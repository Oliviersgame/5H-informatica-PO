// Deze code is geschreven door Olivier Hol en Jozua Aron
// Globale variabelen en assets
let brug, bomSprite, verliesAfbeelding;
let appelGroen, appelRood, hartRood, hartZwart;
let canvas, raster, eve, alice, bob, cindy, mindy, lindy, kinky, bommen, bal;
let startTijd;
let spelTimer = 30;
let laatsteBomTijd = 0;
let laatsteAppelTijd = 0;
let safeZone;
let levens = 3;
let appels = [];
let achtergrondMuziek;


// Klasse voor het raster dat het speelveld opdeelt in hokjes
class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k;
    this.celGrootte = null;
  }
  // Berekent de grootte van elke cel op basis van het canvas
  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }
  // Tekent het raster met blauwe rand en grijze hokjes
  teken() {
    push();
    noFill();
    stroke('blue');
    strokeWeight(10);
    rect(0, 0, canvas.width, canvas.height);
    stroke('grey');
    strokeWeight(1);
    for (var rij = 0; rij < this.aantalRijen; rij++) {
      for (var kolom = 0; kolom < this.aantalKolommen; kolom++) {
        rect(kolom * this.celGrootte, rij * this.celGrootte, this.celGrootte, this.celGrootte);
      }
    }
    pop();
  }
}

// Klasse voor de speler die bestuurd wordt met WASD
class Jos {
  constructor() {
    this.x = 0;
    this.y = 250;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
    this.gehaald = false;
  }
  // Laat de speler bewegen en controleert of hij de overkant heeft gehaald
  beweeg() {
    if (keyIsDown(65)) this.x -= this.stapGrootte;
    if (keyIsDown(68)) this.x += this.stapGrootte;
    if (keyIsDown(87)) this.y -= this.stapGrootte;
    if (keyIsDown(83)) this.y += this.stapGrootte;

    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);

    if (this.x >= canvas.width - raster.celGrootte) {
      this.gehaald = true;
    }
  }
  // Controleert of de speler geraakt wordt door een vijand
  wordtGeraakt(vijand) {
    return this.x === vijand.x && this.y === vijand.y;
  }
  // Tekent de speler met het juiste animatieframe
  toon() {
    image(this.animatie[this.frameNummer], this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

// Klasse voor vijanden die willekeurig bewegen
class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
  }
  // Laat de vijand willekeurig bewegen binnen het speelveld
  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;
    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }
  // Tekent de vijand op het canvas
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

// Klasse voor bommen die op en neer bewegen
class Bom {
  constructor(x, snelheid) {
    this.x = x;
    this.y = random(0, canvas.height - raster.celGrootte);
    this.snelheid = snelheid;
    this.richting = 1;
    this.sprite = bomSprite;
  }
  // Laat de bom op en neer bewegen en keren bij de randen
  beweeg() {
    this.y += this.snelheid * this.richting;
    if (this.y <= 0 || this.y >= canvas.height - raster.celGrootte) {
      this.richting *= -1;
    }
  }
  // Tekent de bom op het canvas
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
  // Controleert of de bom de speler raakt
  raaktSpeler(speler) {
    return dist(this.x, this.y, speler.x, speler.y) < raster.celGrootte;
  }
}

// Klasse voor appels (groen = verlies 1 leven, rood = +1 leven)
class Appel {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // "groen" of "rood"
    this.sprite = type === "groen" ? appelGroen : appelRood;
  }
  // Tekent de appel op het canvas
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
  // Controleert of de appel de speler raakt
  raaktSpeler(speler) {
    return dist(this.x, this.y, speler.x, speler.y) < raster.celGrootte;
  }
}

// Laadt alle benodigde afbeeldingen vóór het spel start
function preload() {
  brug = loadImage("Achtergrondje/achtergrondmooi.jpg");
  bomSprite = loadImage("images/sprites/bom.png");
  verliesAfbeelding = loadImage("characters/noFilter.png");
  appelGroen = loadImage("images/sprites/appel_1.png");
  appelRood = loadImage("images/sprites/appel_2.png");
  hartRood = loadImage("Hartjes/hart_1.png");
  hartZwart = loadImage("Hartjes/hart_2.png");
  achtergrondMuziek = loadSound('FamilyGuySong/SurfinBird.ogg');
}

function shakeScreen() {
  translate(random(-5,5), random(-5,5));
}

// Initialiseert het spel: canvas, raster, speler, vijanden, bommen en bal
function setup() {
  canvas = createCanvas(900, 600);
  frameRate(7);
  textFont("Verdana");
  achtergrondMuziek.loop(); // Start achtergrondmuziek en herhaal continu

  raster = new Raster(12, 18);
  raster.berekenCelGrootte();

  safeZone = { x: 0, y: 250, w: raster.celGrootte, h: raster.celGrootte };

  eve = new Jos();
  eve.stapGrootte = raster.celGrootte;
  for (let b = 0; b < 6; b++) {
    eve.animatie.push(loadImage("images/sprites/Eve100px/Eve_" + b + ".png"));
  }

  alice = new Vijand(700, 200); alice.sprite = loadImage("characters/Chris_Griffin.png");
  bob = new Vijand(600, 400); bob.sprite = loadImage("characters/Lois_Griffin.png");
  cindy = new Vijand(500, 100); cindy.sprite = loadImage("characters/Peter_Griffin.png");
  mindy = new Vijand(400, 300); mindy.sprite = loadImage("characters/Meg_Griffin.png");
  lindy = new Vijand(300, 500); lindy.sprite = loadImage("characters/Brian_alcohol.png");
  kinky = new Vijand(100, 600); kinky.sprite = loadImage("characters/Stewie_Griffin.png");

  [alice, bob, cindy, mindy, lindy, kinky].forEach(v => v.stapGrootte = eve.stapGrootte);

  // Start met twee bommen
  bommen = [];
  for (let i = 0; i < 2; i++) {
    let kolom = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen));
    let x = kolom * raster.celGrootte;
    bommen.push(new Bom(x, random(2, 5)));
  }

  // Object voor de pingpongbal die diagonaal stuitert
  bal = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    diameter: raster.celGrootte * 0.6,
    beweeg() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x <= 0 || this.x >= canvas.width - this.diameter) this.dx *= -1;
      if (this.y <= 0 || this.y >= canvas.height - this.diameter) this.dy *= -1;
    },
    // Tekent de bal op het canvas
    toon() {
      fill('white');
      ellipse(this.x, this.y, this.diameter);
    },
    // Controleert of de bal de speler raakt
    raaktSpeler(speler) {
      return dist(this.x, this.y, speler.x, speler.y) < raster.celGrootte;
    }
  };

  startTijd = millis();
}

// Controleert of de speler zich in de veilige startzone bevindt
function inSafeZone(speler) {
  return speler.x === safeZone.x && speler.y === safeZone.y;
}

// Verliest één leven, reset spelerpositie en timer (of toont game-over als levens = 0)
function verliesLeven() {
  levens--;
  if (levens <= 0) {
    eindScherm('red', 'Its tickle time!', verliesAfbeelding);
  } else {
    // reset spelerpositie
    eve.x = safeZone.x;
    eve.y = safeZone.y;
    startTijd = millis();
    spelTimer = 30;
  }
}

// Tekent de hartjes (levens) linksboven: rood = actief, zwart = kwijt
function tekenHartjes() {
  let xStart = 20;
  for (let i = 0; i < 3; i++) {
    let img = i < levens ? hartRood : hartZwart;
    image(img, xStart + i * 50, 10, 40, 40);
  }
}

// Hoofdfunctie die elk frame tekent, objecten beweegt, timer bijhoudt en botsingen checkt
function draw() {
  background(brug);
  raster.teken();

  // Visuele veilige zone tonen
  push();
  noFill();
  stroke('blue');
  strokeWeight(4);
  rect(safeZone.x, safeZone.y, safeZone.w, safeZone.h);
  pop();

  // Timer berekenen en checken
  let verstreken = floor((millis() - startTijd) / 1000);
  spelTimer = max(0, 30 - verstreken);

  if (spelTimer === 0) {
    verliesLeven();
    return;
  }

  // Timer tonen en hartjes tekenen
  stroke('black');
  strokeWeight(4);
  fill('white');
  textSize(32);
  textAlign(CENTER, CENTER);
  text(spelTimer, canvas.width / 2, raster.celGrootte / 2);
  noStroke();
  tekenHartjes();

  // Nieuwe bom elke 5 sec
  if (verstreken % 5 === 0 && verstreken !== laatsteBomTijd) {
    laatsteBomTijd = verstreken;
    let kolom = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen));
    let x = kolom * raster.celGrootte;
    bommen.push(new Bom(x, random(2, 5)));
  }

  // Nieuwe appel elke 7 sec
  if (verstreken % 7 === 0 && verstreken !== laatsteAppelTijd) {
    laatsteAppelTijd = verstreken;
    let kolom = floor(random(1, raster.aantalKolommen - 1));
    let rij = floor(random(0, raster.aantalRijen));
    let type = random() < 0.5 ? "groen" : "rood";
    appels.push(new Appel(kolom * raster.celGrootte, rij * raster.celGrootte, type));
  }

  // Objecten bewegen
  eve.beweeg();
  [alice, bob, cindy, mindy, lindy, kinky].forEach(v => v.beweeg());
  bal.beweeg();
  bommen.forEach(b => b.beweeg());

  // Objecten tekenen
  eve.toon();
  [alice, bob, cindy, mindy, lindy, kinky].forEach(v => v.toon());
  bal.toon();
  bommen.forEach(b => b.toon());
  appels.forEach(a => a.toon());

  // Check botsingen (behalve in safe zone)
  if (
    !inSafeZone(eve) && (
      eve.wordtGeraakt(alice) ||
      eve.wordtGeraakt(bob) ||
      eve.wordtGeraakt(cindy) ||
      eve.wordtGeraakt(mindy) ||
      eve.wordtGeraakt(lindy) ||
      eve.wordtGeraakt(kinky) ||
      bal.raaktSpeler(eve) ||
      bommen.some(b => b.raaktSpeler(eve))
    )
  ) {
    verliesLeven();
    return;
  }

  // Check appelbotsingen: groen = verlies leven, rood = +1 leven (max 3)
  for (let i = appels.length - 1; i >= 0; i--) {
    if (appels[i].raaktSpeler(eve)) {
      if (appels[i].type === "groen") {
        verliesLeven();
      } else if (appels[i].type === "rood" && levens < 3) {
        levens++;
      }
      appels.splice(i, 1);
    }
  }

  // Winconditie: speler haalt de overkant
  if (eve.gehaald) {
    eindScherm('green', 'You won glorious!');
  }
}

// Toont het eindscherm met kleur, boodschap en optionele afbeelding en stopt de loop
function eindScherm(kleur, boodschap, afbeelding = null) {
  background(kleur);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(90);
  text(boodschap, canvas.width / 2, canvas.height / 2 - 100);

  if (afbeelding) {
    imageMode(CENTER);
    image(afbeelding, canvas.width / 2, canvas.height / 2 + 100, 200, 200);
  }
  noLoop();
}
