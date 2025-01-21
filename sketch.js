let walls = [];
let particle;
let gameStarted = false;
let gameFinished = false;
let goal;
let level = 1;
let scaleFactor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  scaleFactor = min(width, height) / 1000; // Scale factor
  setupLevel(level); // Initialize the level
}

function draw() {
  if (gameFinished) {
    drawWinScreen(); // Display the win screen
    return;
  }

  background(0);

  if (gameStarted) {
    // Draw walls
    for (let wall of walls) {
      wall.show(); 
    }

    // Update particle position based on mouse only after the game has started
    particle.update(mouseX, mouseY);
    particle.show();
    particle.look(walls); // Show rays for collision detection

    // Check for collision with walls
    for (let wall of walls) {
      if (particleTouchesWall(wall)) {
        gameReset(); // Restart the game if collision occurs
        return;
      }
    }

    // Draw the goal
    fill(0, 255, 0, 100);
    noStroke();
    ellipse(goal.x, goal.y, 40 * scaleFactor, 40 * scaleFactor); // Goal size

    // Check if the particle reaches the goal
    if (dist(particle.pos.x, particle.pos.y, goal.x, goal.y) < 40 * scaleFactor) {
      level++;
      if (level > 3) {
        gameFinished = true; // End the game after level 3
      } else {
        setupLevel(level); // Load the next level
      }
    }
  } else {
    // Display the start message
    showStartMessage();
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true; // Start the game on mouse click
  }
}

// Display the start message
function showStartMessage() {
  fill(255);
  textSize(32 * scaleFactor);
  textAlign(LEFT, CENTER);

  // Draw the outline of the circle at top middle
  noFill();
  stroke(255);
  ellipse(width / 2, 50 * scaleFactor, 30 * scaleFactor, 30 * scaleFactor); // Circle outline

  // Text next to the circle
  fill(255);
  text("Click here to start", width / 2 + 40 * scaleFactor, 50 * scaleFactor); // Text to the right
}

// Display the win screen
function drawWinScreen() {
  background(0); // Black background
  fill(255); // White text
  textSize(64 * scaleFactor);
  textAlign(CENTER, CENTER);
  text("Congratulations!", width / 2, height / 2 - 50 * scaleFactor);

  textSize(32 * scaleFactor);
  text("You Win!", width / 2, height / 2 + 50 * scaleFactor);

  textSize(24 * scaleFactor);
  text("Refresh the page to play again.", width / 2, height / 2 + 120 * scaleFactor);
}

// Setup the walls and goal for each level
function setupLevel(level) {
  walls = []; // Clear previous level walls

  // Set the goal position based on the level
  goal = createVector(
    level === 1 ? 850 * scaleFactor : level === 2 ? 50 * scaleFactor : width - 50 * scaleFactor, // For level 3, goal is at bottom-right
    level === 1 ? 850 * scaleFactor : level === 2 ? 50 * scaleFactor : height - 50 * scaleFactor // For level 3, goal is at bottom-right
  );

  // Add progressively more walls for difficulty
  if (level === 1) {
    createScatteredWalls(50); // 50 walls for level 1
  } else if (level === 2) {
    createScatteredWalls(100); // 100 walls for level 2
  } else if (level === 3) {
    createScatteredWalls(120); // 120 walls for level 3
  }

  // Reset particle position based on the level
  if (level === 1) {
    particle = new Particle(width - 50 * scaleFactor, 50 * scaleFactor); // Top-right corner
  } else if (level === 2) {
    particle = new Particle(50 * scaleFactor, 50 * scaleFactor); // Top-left corner (green dot)
  } else if (level === 3) {
    particle = new Particle(50 * scaleFactor, height - 50 * scaleFactor); // Bottom-left corner for level 3
  }
}

// Create scattered walls across the canvas
function createScatteredWalls(count) {
  for (let i = 0; i < count; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = x1 + random(-150, 150) * scaleFactor; // Random short length
    let y2 = y1 + random(-150, 150) * scaleFactor;
    walls.push(new Boundary(x1, y1, x2, y2));
  }
}

// Reset the game to level 1
function gameReset() {
  level = 1;
  gameStarted = false;
  setupLevel(level);
}

// Check if the particle touches a wall
function particleTouchesWall(wall) {
  const d = dist(particle.pos.x, particle.pos.y, wall.a.x, wall.a.y) + dist(particle.pos.x, particle.pos.y, wall.b.x, wall.b.y);
  const wallLength = dist(wall.a.x, wall.a.y, wall.b.x, wall.b.y);
  return d <= wallLength + 5 * scaleFactor; // Particle touches the wall
}

// Class for walls
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255, 0, 0);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

// Class for rays
class Ray {
  constructor(pos, angle) {
    this.pos = pos;
    this.dir = p5.Vector.fromAngle(angle);
  }

  lookAt(x, y) {
    this.dir.x = x - this.pos.x;
    this.dir.y = y - this.pos.y;
    this.dir.normalize();
  }

  show() {
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    line(0, 0, this.dir.x * 150 * scaleFactor, this.dir.y * 150 * scaleFactor);
    pop();
  }

  cast(wall) {
    const x1 = wall.a.x;
    const y1 = wall.a.y;
    const x2 = wall.b.x;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const y3 = this.pos.y;
    const x4 = this.pos.x + this.dir.x;
    const y4 = this.pos.y + this.dir.y;

    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (den == 0) {
      return;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t > 0 && t < 1 && u > 0) {
      const pt = createVector();
      pt.x = x1 + t * (x2 - x1);
      pt.y = y1 + t * (y2 - y1);
      return pt;
    } else {
      return;
    }
  }
}

// Class for the particle
class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y); // Set initial position
    this.rays = [];
    for (let a = 0; a < 360; a += 1) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }
  }

  update(x, y) {
    this.pos.set(x, y); // Update position to follow mouse
  }

  look(walls) {
    for (let ray of this.rays) {
      let closest = null;
      let record = Infinity;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const d = p5.Vector.dist(this.pos, pt);
          if (d < record) {
            record = d;
            closest = pt;
          }
        }
      }
      if (closest) {
        stroke(255, 100);
        line(this.pos.x, this.pos.y, closest.x, closest.y);
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 6 * scaleFactor);
  }
}
