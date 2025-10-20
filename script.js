let brug, bomSprite, verliesAfbeelding;
let canvas, raster, eve, alice, bob, cindy, bommen, bal;
let startTijd;
let spelTimer = 30;
let laatsteBomTijd = 0;
let safeZone;
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
    if (keyIsDown(65)) {
      this.x -= this.stapGrootte;
      this.frameNummer = 2;
    }
    if (keyIsDown(68)) {
      this.x += this.stapGrootte;
      this.frameNummer = 1;
    }
    if (keyIsDown(87)) {
      this.y -= this.stapGrootte;
      this.frameNummer = 4;
    }
    if (keyIsDown(83)) {
      this.y += this.stapGrootte;
      this.frameNummer = 5;
    }

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
    this.snelheid = random(2, 5)
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
// Toont het eindscherm met kleur, boodschap en afbeelding
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
// Laadt alle benodigde afbeeldingen vóór het spel start
function preload() {
  brug = loadImage("Achtergrondje/achtergrondmooi.jpg");
  bomSprite = loadImage("images/sprites/bom.png");
  verliesAfbeelding = loadImage("characters/noFilter.png");
}
// Initialiseert het spel: canvas, raster, speler, vijanden, bommen en bal
function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent();
  frameRate(10);
  textFont("Verdana");
  textSize(90);

  raster = new Raster(12, 18);
  raster.berekenCelGrootte();
  // Definieert de veilige zone waar de speler niet geraakt kan worden
  safeZone = {
    x: 0,
    y: 250,
    w: raster.celGrootte,
    h: raster.celGrootte
  };

  eve = new Jos();
  eve.stapGrootte = raster.celGrootte;
  for (var b = 0; b < 6; b++) {
    frameEve = loadImage("images/sprites/Eve100px/Eve_" + b + ".png");
    eve.animatie.push(frameEve);
  }

  alice = new Vijand(700, 200);
  alice.stapGrootte = eve.stapGrootte;
  alice.sprite = loadImage("characters/Chris_Griffin.png");

  bob = new Vijand(600, 400);
  bob.stapGrootte = eve.stapGrootte;
  bob.sprite = loadImage("characters/Lois_Griffin.png");

  cindy = new Vijand(500, 100);
  cindy.stapGrootte = eve.stapGrootte;
  cindy.sprite = loadImage("characters/Peter_Griffin.png");

  mindy = new Vijand(400, 300);
  mindy.stapGrootte = eve.stapGrootte;
  mindy.sprite = loadImage("characters/Meg_Griffin.png");

  lindy = new Vijand(300, 500);
  lindy.stapGrootte = eve.stapGrootte;
  lindy.sprite = loadImage("characters/Brian_alcohol.png");

  kinky = new Vijand(100, 600);
  kinky.stapGrootte = eve.stapGrootte;
  kinky.sprite = loadImage("characters/Stewie_Griffin.png");

  bommen = [];
  for (let i = 0; i < 2; i++) {
    let kolom = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen));
    let x = kolom * raster.celGrootte;
    let snelheid = random(2, 5);
    bommen.push(new Bom(x, snelheid));
  }
  // Object voor de pingpongbal die diagonaal stuitert
  bal = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 5,
    dy: 5,
    diameter: raster.celGrootte * 0.6,
    beweeg() {     // Laat de bal bewegen en stuiteren tegen de randen
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
// Hoofdfunctie die elk frame tekent, objecten beweegt, timer bijhoudt en botsingen checkt
function draw() {
  background(brug);
  raster.teken();

  push();
  noFill();
  stroke('blue');
  strokeWeight(4);
  rect(safeZone.x, safeZone.y, safeZone.w, safeZone.h);
  pop();


  let verstreken = floor((millis() - startTijd) / 1000);
  spelTimer = max(0, 30 - verstreken);
  // Als de tijd op is, verliest de speler en wordt het eindscherm getoond
  if (spelTimer === 0) {
    eindScherm('red', 'Time’s up!', verliesAfbeelding);
    return;
  }

  stroke('black');
  strokeWeight(4);
  fill('white');
  textSize(32);
  textAlign(CENTER, CENTER);
  text(spelTimer, canvas.width / 2, raster.celGrootte / 2);
  noStroke();
  // Elke 5 seconden wordt er een nieuwe bom toegevoegd aan het spel
  if (verstreken % 5 === 0 && verstreken !== laatsteBomTijd) {
    laatsteBomTijd = verstreken;
    let kolom = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen));
    let x = kolom * raster.celGrootte;
    let snelheid = random(2, 5);
    bommen.push(new Bom(x, snelheid));
  }

  eve.beweeg();
  alice.beweeg();
  bob.beweeg();
  cindy.beweeg();
  mindy.beweeg();
  lindy.beweeg();
  kinky.beweeg();
  bal.beweeg();
  for (let bom of bommen) bom.beweeg();

  eve.toon();
  alice.toon();
  bob.toon();
  cindy.toon();
  mindy.toon();
  lindy.toon();
  kinky.toon();
  bal.toon();
  for (let bom of bommen) bom.toon();
  // Controleert of de speler geraakt wordt door vijanden, bommen of bal (behalve in safe zone)
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
    eindScherm('red', 'Its tickle time!', verliesAfbeelding);
  }
  // Als de speler de overkant haalt, wint hij en wordt het groene eindscherm getoond
  if (eve.gehaald) {
    eindScherm('green', 'You won glorious!');
  }
}
