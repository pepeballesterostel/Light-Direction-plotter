
// The Final result: a time line showing the light directions of an artist's oeuvre
// Light direction is a normalized vector from the centroid of the mesh towards the light source
// timeline represents the artist's life span

let paintings;
artistPalette = ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557"];
let colors = chroma.scale(['white', '#F1FAEE']).colors(10); 
let particles = [];
let distanceBetweenParticles;
let currentIndex = 0;
let startX = 100; // timeline initial position
let scannerX = startX; // Scanner's initial position
let timelineDrawn = false; // Flag to check if the timeline has been drawn
let nextPaintingIndex = 0; // Index of the next painting to check
let minDate;
let maxDate;

function preload() {
  loadJSON('TINTORETTO.json', function(data) {
    paintings = data;
    console.log("JSON loaded", paintings);
  });
}

function setup() {
  createCanvas(800, 400);
  distanceBetweenParticles = width / paintings.length;
  paintings.sort((a, b) => a.date - b.date);

}

function draw() {
  background(20);
  stroke(220);
  strokeWeight(1);
  let minDate = Math.min(...paintings.map((p) => p.date));
  let maxDate = Math.max(...paintings.map((p) => p.date));
  let endX = width - startX;
  // Check if the timeline is fully drawn
  if (timelineDrawn) {
    line(startX, height / 2, endX, height / 2); // Draw the full timeline
  } else {
    line(startX, height / 2, scannerX, height / 2); // Draw up to the scanner's position
  }

  textSize(15);
  textAlign(CENTER, BOTTOM);
  noStroke();
  let textColor = colors[Math.floor(colors.length / 2)];
  let artist = "TINTORETTO";
  fill(textColor);
  text(artist, width / 2, height - 95);
  textSize(10);
  textAlign(CENTER, BOTTOM);
  fill(255);
  let dateText = "(" + String(minDate) + " - " + String(maxDate) + ")";
  text(dateText, width / 2, height - 80);

  // Move the scanner
  scannerX += 1; //   SPEED OF SCANNER
  if (scannerX > endX) {
    timelineDrawn = true;
    scannerX = startX;
    nextPaintingIndex = 0;
  }
  // Check for paintings
  while (nextPaintingIndex < paintings.length) {
    let painting = paintings[nextPaintingIndex];
    let mappedDate = map(painting.date, minDate, maxDate, startX, endX);

    if (mappedDate <= scannerX) {
      // Emit a particle
      let direction = createVector(
        painting.lightDirection.x,
        painting.lightDirection.y
      );
      particles.push(new Particle(mappedDate, height / 2, direction));
      nextPaintingIndex++;
    } else {
      break;
    }
  }
  for (let particle of particles) {
    particle.update();
    particle.show();
  }
}

class Particle {
  constructor(x, y, direction) {
    this.origin = createVector(x, y);
    this.position = createVector(x, y);
    this.velocity = direction.copy().normalize();
    this.stepSize = 1; // Fixed step size
    this.maxLen = 60; // Maximum length of the particle's trajectory
    this.alpha = 255; // For fading
    this.currentLen = 0; //
  }
  update() {
    if (this.currentLen < this.maxLen) {
      this.position.add(this.velocity);
      this.currentLen = this.currentLen + this.stepSize;
    } else {
      this.alpha -= 2; // Fading speed
      this.alpha = max(this.alpha, 160);
    }
  }
  show() {
    let paletteIndex = floor(
      map(this.velocity.heading(), -PI, PI, 0, colors.length)
    );
    let myColor = colors[paletteIndex];
    let r = red(myColor);
    let g = green(myColor);
    let b = blue(myColor);
    stroke(r, g, b, this.alpha);
    strokeWeight(1);
    line(this.origin.x, this.origin.y, this.position.x, this.position.y);
  }
}

