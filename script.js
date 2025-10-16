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
    stroke('black');
    ellipse(this.x,this.y,this.diameter);
    for (var rij = 0; rij < this.aantalRijen; rij++) {
      for (var kolom = 0; kolom < this.aantalKolommen; kolom++) {
        rect(kolom * this.celGrootte, rij * this.celGrootte, this.celGrootte, this.celGrootte);
      }
    }
    stroke('blue')
    strokeWeight(15);
    noFill();
    rect(
      0,
      0,
      this.aantalKolommen * this.celGrootte,
      this.aantalRijen * this.celGrootte
    );
    pop();
  }
}

class Jos {
  constructor() {
    this.x = 400;
    this.y = 300;
    this.animatie = [];
    this.frameNummer =  3;
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

    this.x = constrain(this.x,0,canvas.width);
      this.y = constrain(this.y,0,canvas.height - raster.celGrootte);

      if (this.x == canvas.width) {
        this.gehaald = true;
      }
    }

    wordtGeraakt(Bom) {
      if (this.x == Bom.x && this.y == Bom.y) {
        return true;
      }
      else {
        return false;
      }
    }

  toon() {
image(this.animatie[this.frameNummer],this.x,this.y,raster.celGrootte,raster.celGrootte);
    }
  }  

class Bom {
  constructor(x, y) {
    this.diameter = 40;
    this.straal = this.diameter / 2;
    this.x = x;
    this.y = y;
    this.sprite = null;
    this.stapGrootte = null;
    this.snelheid = random(1,10);
  }

  beweeg() {
    this.y += this.snelheid;

    this.x += floor(random(-1,2))*this.stapGrootte;
    this.y += floor(random(-1,2))*this.stapGrootte;

    this.x = constrain(this.x,0,canvas.width - raster.celGrootte);
    this.y = constrain(this.y,0,canvas.height - raster.celGrootte);
  }

  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}
 class cindy {
   constructor(x, y) {
     this.x = x;
     this.y = y;
     this.sprite = null;
     this.stapGrootte = null;
    }

     beweeg() {
       this.x += floor(random(-1,2))*this.stapGrootte;
       this.y += floor(random(-1,2))*this.stapGrootte;

       this.x = constrain(this.x,0,canvas.width - raster.celGrootte);
       this.y = constrain(this.y,0,canvas.height - raster.celGrootte);
     }

   toon() {
       image(this.sprite,this.x,this.y,raster.celGrootte,raster.celGrootte);
     }
   }



function preload() {
  brug = loadImage("images/backgrounds/abstract.jpg");
}

function setup() {
  canvas = createCanvas(900, 600);
  canvas.parent();
  frameRate(15);
  textFont("dafont");
  textSize(90);
  noStroke();
  Jos.straal = Jos.diameter/2;
  Jos.x = Jos.straal;
  Jos.y = canvas.height/4;


  raster = new Raster(12, 18);

  raster.berekenCelGrootte();

  eve = new Jos();
  eve.stapGrootte = 1 * raster.celGrootte;
  for (var b = 0; b < 6; b++) {
    frameEve = loadImage("images/sprites/Eve100px/Eve_" + b + ".png");
    eve.animatie.push(frameEve);
  }

  alice = new Bom(700, 200);
  alice.stapGrootte = 1 * eve.stapGrootte;
  alice.sprite = loadImage("images/sprites/bom.png");

  bob = new Bom(600, 400);
  bob.stapGrootte = 1 * eve.stapGrootte;
  bob.sprite = loadImage("peter/Peter_Griffin.png");

  cook = new cindy(500, 300);
  cook.stapGrootte = 1 * eve.stapGrootte;
  cook.sprite = loadImage("bolle jos/sigma.png");
}

function draw() {
  background(brug);
  raster.teken();
  eve.beweeg();
  alice.beweeg();
  bob.beweeg();
  cook.beweeg()
  eve.toon();
  alice.toon();
  bob.toon();
  cook.toon();

  if (eve.wordtGeraakt(alice) || eve.wordtGeraakt(bob) || eve.wordtGeraakt(cook)) {
    background('red');
    fill('white');
    text("its tickle time", 30, 300)
    noLoop();
  }

  if (eve.gehaald) {
    background('green');
    fill('white');
    text("You won gooner!", 100, 300);
    text("Glorious", 300, 200);
    noLoop();
  }
}