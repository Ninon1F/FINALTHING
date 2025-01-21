let walls = [];
let particle;
let gameStarted = false;
let gameFinished = false;
let goal;
let level = 1;
let scaleFactor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  scaleFactor = min(width,height) / 1000; // Calculate scaling factor based on canvas size
  setupLevel(level);

  // Create particle (starting point of the rays)
  particle = new Particle();

  // No cursor visible
  noCursor();
}

function draw() {
  background(0);

  if (gameStarted) {
    for (let wall of walls) {
      wall.show();
    }

    particle.update(mouseX, mouseY); // Particle follows mouse
    particle.show();
    particle.look(walls); // Show rays

    // Check collision with walls
    for (let wall of walls) {
      if (particleTouchesWall(wall)) {
        gameReset(); // Restart the game if collision occurs
        return;
      }
    }

    // Show the goal
    fill(0, 255, 0, 100); // Goal color
    noStroke();
    ellipse(goal.x, goal.y, 40 * scaleFactor, 40 * scaleFactor); // Goal size scaled

    // If player reaches the goal, progress or finish
    if (dist(particle.pos.x, particle.pos.y, goal.x, goal.y) < 40 * scaleFactor) {
      level++;
      if (level > 3) {
        gameFinished = true; // Win after level 3
      } else {
        setupLevel(level); // Load next level
      }
    }

    // Display win screen if all levels are completed
    if (gameFinished) {
      showWinScreen();
    }
  } else {
    // Display the start message
    showStartMessage();
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true; // Game starts on click
  }
}

// Function to display the start message
function showStartMessage() {
  fill(255);
  textSize(32 * scaleFactor); // Scale text size
  textAlign(CENTER, CENTER);
  text("Click to Start!", width / 2, height / 2);
}

// Function to display the win screen
function showWinScreen() {
  fill(0, 255, 0);
  textSize(48 * scaleFactor); // Scale text size
  textAlign(CENTER, CENTER);
  text("You Win!", width / 2, height / 2);
}

// Function to set up walls for each level
function setupLevel(level) {
  walls = []; // Clear previous walls
  particle = new Particle(); // Reset particle position

  // Fixed goal for each level
  if (level === 1) {
    goal = createVector(850 * scaleFactor, 850 * scaleFactor);
  } else if (level === 2) {
    goal = createVector(150 * scaleFactor, 850 * scaleFactor);
  } else if (level === 3) {
    goal = createVector(850 * scaleFactor, 150 * scaleFactor);
  }

  // Maze wall layouts for each level (occupy the whole canvas)
  if (level === 1) {
    createLevel1Walls();
  } 
  ///else if (level === 2) {
  ///  createLevel2Walls();
 /// } else if (level === 3) {
 ///   createLevel3Walls();
 /// }
}

// Function to create walls for level 1
function createLevel1Walls() {
  // Fixed walls for level 1, scaled
  walls.push(new Boundary(100 * scaleFactor, 100 * scaleFactor, 300 * scaleFactor, 100 * scaleFactor));
  walls.push(new Boundary(300 * scaleFactor, 100 * scaleFactor, 300 * scaleFactor, 300 * scaleFactor));
  walls.push(new Boundary(300 * scaleFactor, 300 * scaleFactor, 700 * scaleFactor, 300 * scaleFactor));
  walls.push(new Boundary(700 * scaleFactor, 300 * scaleFactor, 700 * scaleFactor, 700 * scaleFactor));
  walls.push(new Boundary(300 * scaleFactor, 500 * scaleFactor, 300 * scaleFactor, 700 * scaleFactor));
  walls.push(new Boundary(200 * scaleFactor, 600 * scaleFactor, 600 * scaleFactor, 600 * scaleFactor));
  walls.push(new Boundary(100 * scaleFactor, 100 * scaleFactor, 500 * scaleFactor, 100 * scaleFactor));
  walls.push(new Boundary(100 * scaleFactor, 100 * scaleFactor, 100 * scaleFactor, 500 * scaleFactor));
  walls.push(new Boundary(300 * scaleFactor, 700 * scaleFactor, 800 * scaleFactor, 700 * scaleFactor));

  // Adding a few more walls with gaps created, scaled
  walls.push(new Boundary(400 * scaleFactor, 100 * scaleFactor, 400 * scaleFactor, 300 * scaleFactor)); // Gap created
  walls.push(new Boundary(500 * scaleFactor, 300 * scaleFactor, 600 * scaleFactor, 300 * scaleFactor)); // Gap created
  walls.push(new Boundary(300 * scaleFactor, 500 * scaleFactor, 300 * scaleFactor, 700 * scaleFactor)); // Gap created

  // Add more small scattered walls for difficulty
  for (let x = 0; x < width; x += 30 * scaleFactor) {
    for (let y = 0; y < height; y += 30 * scaleFactor) {
      if (random(1) < 0.15) { // Increased probability for more walls
        if (random(1) < 0.5) {
          walls.push(new Boundary(x, y, x + 30 * scaleFactor, y)); // Horizontal small wall
        } else {
          walls.push(new Boundary(x, y, x, y + 30 * scaleFactor)); // Vertical small wall
        }
      }
    }
  }
}

// Similar scaling for other levels (Level 2 and 3)...
// Just make sure that all wall coordinates, gap positions, goal positions, etc., are scaled by `scaleFactor`

// Function to reset the game
function gameReset() {
  level = 1; // Reset to level 1
  gameStarted = false;
  setupLevel(level); // Reload level 1
}

// Function to check if the particle touches a wall
function particleTouchesWall(wall) {
  const d = dist(particle.pos.x, particle.pos.y, wall.a.x, wall.a.y) + dist(particle.pos.x, particle.pos.y, wall.b.x, wall.b.y);
  const wallLength = dist(wall.a.x, wall.a.y, wall.b.x, wall.b.y);
  return d <= wallLength + 5 * scaleFactor; // Particle touches the wall
}

// Walls class (fixed walls in specific positions)
class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255, 0, 0); // Red wall color
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}

// Rays class
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
    line(0, 0, this.dir.x * 150 * scaleFactor, this.dir.y * 150 * scaleFactor); // Rays extend 150 pixels
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

// Particle class (starting point of rays)
class Particle {
  constructor() {
    this.pos = createVector(width / 2, height / 2); // Particle in the center
    this.rays = [];
    for (let a = 0; a < 360; a += 1) {
      this.rays.push(new Ray(this.pos, radians(a))); // 360 rays (one for each direction)
    }
  }

  update(x, y) {
    this.pos.set(x, y); // Particle follows mouse position
  }

  look(walls) {
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
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
        stroke(255, 100); // Ray color
        line(this.pos.x, this.pos.y, closest.x, closest.y); // Draw the ray
      }
    }
  }

  show() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, 6 * scaleFactor); // Particle size scaled
  }
}
