let brug, bomSprite, verliesAfbeelding;
let canvas, raster, eve, alice, bob, cindy, bommen, bal;
let startTijd;
let spelTimer = 30;
let laatsteBomTijd = 0;
let safeZone;

class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k;
    this.celGrootte = null;
  }

  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }

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

class Jos {
  constructor() {
    this.x = 0;
    this.y = 250;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
    this.gehaald = false;
  }

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

  wordtGeraakt(vijand) {
    return this.x === vijand.x && this.y === vijand.y;
  }

  toon() {
    image(this.animatie[this.frameNummer], this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
  }

  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

class Bom {
  constructor(x, snelheid) {
    this.x = x;
    this.y = random(0, canvas.height - raster.celGrootte);
    this.snelheid = random(2, 5)
    this.richting = 1;
    this.sprite = bomSprite;
  }

  beweeg() {
    
    this.y += this.snelheid * this.richting;
    if (this.y <= 0 || this.y >= canvas.height - raster.celGrootte) {
      this.richting *= -1;
    }
  }

  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }

  raaktSpeler(speler) {
    return dist(this.x, this.y, speler.x, speler.y) < raster.celGrootte;
  }
}

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

function preload() {
  brug = loadImage("Achtergrondje/achtergrondmooi.jpg");
  bomSprite = loadImage("images/sprites/bom.png");
  verliesAfbeelding = loadImage("peter/noFilter.png");
}

function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent();
  frameRate(10);
  textFont("Verdana");
  textSize(90);

  raster = new Raster(12, 18);
  raster.berekenCelGrootte();

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
  mindy.sprite = loadImage("characters2/Meg_Griffin.png");

  lindy = new Vijand(300, 500);
  lindy.stapGrootte = eve.stapGrootte;
  lindy.sprite = loadImage("characters2/Brian_alcohol.png");

  kinky = new Vijand(100, 600);
  kinky.stapGrootte = eve.stapGrootte;
  kinky.sprite = loadImage("characters2/Stewie_Griffin.png");

  bommen = [];
  for (let i = 0; i < 2; i++) {
    let kolom = floor(random(raster.aantalKolommen / 2, raster.aantalKolommen));
    let x = kolom * raster.celGrootte;
    let snelheid = random(2, 5);
    bommen.push(new Bom(x, snelheid));
  }

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
    toon() {
      fill('white');
      ellipse(this.x, this.y, this.diameter);
    },
    raaktSpeler(speler) {
      return dist(this.x, this.y, speler.x, speler.y) < raster.celGrootte;
    }
  };

  startTijd = millis();
}

function inSafeZone(speler) {
  return speler.x === safeZone.x && speler.y === safeZone.y;
}

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

  stroke('black');
  strokeWeight(4);
  fill('white');
  textSize(32);
  textAlign(CENTER, CENTER);
  text(spelTimer, canvas.width / 2, raster.celGrootte / 2);
  noStroke();

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

  if (eve.gehaald) {
    eindScherm('green', 'You won glorious!');
  }
}
