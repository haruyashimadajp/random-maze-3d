// ========================================
//  Random Maze 3D — Main Sketch
// ========================================

// ----- Player State -----
let playerX;           // Player world X coordinate
let playerY;           // Player world Y coordinate
let playerZ;           // Player world Z coordinate
let lastPosition = []; // Saved position for collision recovery

// ----- Maze Data -----
let gridSize = 10;    // Grid dimension (gridSize × gridSize cells)
let mazeCells = [];   // Cell data: [col, row, wallA, wallB]
let isSolvable = false;

// ----- BFS Maze Validation -----
let bfsFrontier = [];
let bfsNext = [];
let bfsVisited = [];

// ----- Game State -----
let showTitle = true;
let generateFailCount = 0;

// ----- Enemy State -----
let enemyX;
let enemyZ;
let enemyPath = [];        // Array of [col, row] waypoints from BFS
let enemyPathIndex = 0;    // Current step in path
let enemySpeed = 0.035;    // Movement speed (slow)
let pathRefreshTimer = 0;
const PATH_REFRESH_INTERVAL = 45;
let enemyFacing = 0;       // Yaw angle the enemy faces (radians)
let enemyWalkPhase = 0;    // Walking animation phase

// ----- Game Over State -----
let isGameOver = false;
let gameOverTimer = 0;
const GAMEOVER_DURATION = 150; // Frames to show game over before returning to title

// ----- Overhead Map -----
let showMap = false;

// ----- World Dimensions -----
let wallSize = 2;
let pathSize = 10;
let wallHeight = 10;

// ----- Camera & Input -----
let cam;
let cameraAngle = [0, Math.PI / 4]; // [pitch, yaw]
let fov = 1.5;
let moveSpeed = 1;

// Walk bob: [yOffset, pitchDelta, yawDelta, state, velocity]
// state: 1=rising 2=peak 3=falling 4=idle
let walkBob = [0, 0, 0, 4, 0];

// ========================================

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);

  playerX = wallSize + pathSize / 2;
  playerY = wallHeight / 2;
  playerZ = wallSize + pathSize / 2;
}

// Returns 1 (wall) with 40% probability, 0 (open) with 60%
function randomWall() {
  return random(0, 1) < 0.60 ? 0 : 1;
}

// Fill mazeCells with random wall data
function generateMaze() {
  mazeCells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      mazeCells.push([col, row, randomWall(), randomWall()]);
    }
  }
}

// BFS to verify a path exists from (1,1) to (gridSize, gridSize)
function validateMaze() {
  bfsFrontier = [[1, 1]];
  bfsNext = [];
  bfsVisited = [];

  for (let i = 0; i < gridSize ** 2 && bfsFrontier.length > 0; i++) {
    for (let q = 0; q < gridSize ** 2 && q < bfsFrontier.length; q++) {
      if (!isVisited(...bfsFrontier[q])) {

        if (bfsFrontier[q][0] == gridSize && bfsFrontier[q][1] == gridSize) {
          isSolvable = true;
          return;
        }

        bfsVisited.push([...bfsFrontier[q]]);

        const col = bfsFrontier[q][0];
        const row = bfsFrontier[q][1];

        // Right
        if (mazeCells[(row - 1) * gridSize + col][3] == 0 && col != gridSize) {
          bfsNext.push([col + 1, row]);
        }
        // Down
        if (row != gridSize) {
          if (mazeCells[row * gridSize + col - 1][2] == 0) {
            bfsNext.push([col, row + 1]);
          }
        }
        // Left
        if (mazeCells[(row - 1) * gridSize + col - 1][3] == 0 && col != 1) {
          bfsNext.push([col - 1, row]);
        }
        // Up
        if (mazeCells[(row - 1) * gridSize + col - 1][2] == 0 && row != 1) {
          bfsNext.push([col, row - 1]);
        }
      }
    }

    bfsFrontier = bfsNext;
    bfsNext = [];
  }
}

// Returns true if (col, row) was already visited in BFS
function isVisited(col, row) {
  for (let t = 0; t < gridSize ** 2 && t < bfsVisited.length; t++) {
    if (bfsVisited[t][0] == col && bfsVisited[t][1] == row) {
      return true;
    }
  }
  return false;
}

// Returns true if the player overlaps any wall
function checkWallCollision() {
  for (let i = 0; i < mazeCells.length; i++) {
    const cell = mazeCells[i];
    const step = wallSize + pathSize;

    if (
      cell[2] == 1 &&
      playerX + 1 > cell[0] * step &&
      playerX - 1 < (cell[0] + 1) * step + wallSize &&
      playerZ + 1 > cell[1] * step &&
      playerZ - 1 < cell[1] * step + wallSize
    ) {
      return true;
    }

    if (
      cell[3] == 1 &&
      playerX + 1 > cell[0] * step &&
      playerX - 1 < cell[0] * step + wallSize &&
      playerZ + 1 > cell[1] * step &&
      playerZ - 1 < (cell[1] + 1) * step + wallSize
    ) {
      return true;
    }
  }

  const boundary = gridSize * (wallSize + pathSize);
  if (
    playerX - 1 < wallSize ||
    playerX + 1 > boundary ||
    playerZ - 1 < wallSize ||
    playerZ + 1 > boundary
  ) {
    return true;
  }
}

// Push player out of walls in 4 directions; revert to lastPosition if stuck
function resolveCollision() {
  for (let i = 1; i < 50; i++) {
    playerX += i * 0.01;
    if (checkWallCollision()) { playerX -= i * 0.01; } else { return; }

    playerZ += i * 0.01;
    if (checkWallCollision()) { playerZ -= i * 0.01; } else { return; }

    playerX -= i * 0.01;
    if (checkWallCollision()) { playerX += i * 0.01; } else { return; }

    playerZ -= i * 0.01;
    if (checkWallCollision()) { playerZ += i * 0.01; } else { return; }
  }

  playerX = lastPosition[0];
  playerY = lastPosition[1];
  playerZ = lastPosition[2];
}

// Animate camera Y offset for a walking bob effect
function updateWalkBob() {
  if (walkBob[3] == 1) {
    walkBob[4] += 0.005;
    if (walkBob[0] >= 0.3) {
      walkBob[3] = 2;
      walkBob[4] = 0.06;
      walkBob[0] = 0.3;
    }
  }

  if (walkBob[3] == 2) {
    walkBob[4] -= 0.005;
    if (walkBob[0] >= 0.6) {
      walkBob[3] = 3;
      walkBob[4] = 0;
      walkBob[0] = 0.6;
    }
  }

  if (walkBob[3] == 3) {
    walkBob[4] -= 0.005;
    if (walkBob[0] <= 0.3) {
      walkBob[3] = 4;
      walkBob[4] = -0.06;
      walkBob[0] = 0.3;
    }
  }

  if (walkBob[3] == 4) {
    walkBob[4] += 0.005;
    if (walkBob[0] <= 0) {
      walkBob[4] = 0;
      walkBob[0] = 0;
    }
  }

  walkBob[0] += walkBob[4];
}

// Handle player movement, camera rotation, and collision
function updatePlayer() {
  cam.camera(
    playerX,
    playerY + walkBob[0],
    playerZ,
    cos(cameraAngle[0] + walkBob[1]) * cos(cameraAngle[1] + walkBob[2]) * 100 + playerX,
    sin(cameraAngle[0] + walkBob[1]) * 100 + playerY,
    cos(cameraAngle[0] + walkBob[1]) * sin(cameraAngle[1] + walkBob[2]) * 100 + playerZ,
    0, 1, 0
  );

  lastPosition = [playerX, playerY, playerZ];

  moveSpeed = keyIsDown(16) ? 0.33 : 1; // Shift = slow

  if (keyIsDown(68)) { // D — strafe right
    playerX -= sin(cameraAngle[1]) * 0.12 * moveSpeed;
    playerZ += cos(cameraAngle[1]) * 0.12 * moveSpeed;
    if (walkBob[3] == 4 && walkBob[0] >= 0) walkBob[3] = 1;
  }

  if (keyIsDown(65)) { // A — strafe left
    playerX += sin(cameraAngle[1]) * 0.12 * moveSpeed;
    playerZ -= cos(cameraAngle[1]) * 0.12 * moveSpeed;
    if (walkBob[3] == 4 && walkBob[0] >= 0) walkBob[3] = 1;
  }

  if (keyIsDown(83)) { // S — move back
    playerX -= cos(cameraAngle[1]) * 0.10 * moveSpeed;
    playerZ -= sin(cameraAngle[1]) * 0.10 * moveSpeed;
    if (walkBob[3] == 4 && walkBob[0] >= 0) walkBob[3] = 1;
  }

  if (keyIsDown(87)) { // W — move forward
    playerX += cos(cameraAngle[1]) * 0.15 * moveSpeed;
    playerZ += sin(cameraAngle[1]) * 0.15 * moveSpeed;
    if (walkBob[3] == 4 && walkBob[0] >= 0) walkBob[3] = 1;
  }

  if (checkWallCollision()) {
    resolveCollision();
  }

  if (keyIsDown(UP_ARROW) && cameraAngle[0] > -1.3) cameraAngle[0] -= 0.05;
  if (keyIsDown(DOWN_ARROW) && cameraAngle[0] < 1.3)  cameraAngle[0] += 0.05;
  if (keyIsDown(RIGHT_ARROW)) cameraAngle[1] += 0.05;
  if (keyIsDown(LEFT_ARROW))  cameraAngle[1] -= 0.05;

  updateWalkBob();
}

// Render the maze walls, floor, ceiling, and goal marker
function renderMaze() {
  const step = wallSize + pathSize;

  for (let i = 0; i < mazeCells.length; i++) {
    const cell = mazeCells[i];
    const distSq = (cell[0] - playerX / step) ** 2 + (cell[1] - playerZ / step) ** 2;

    if (distSq < 64) {
      if (cell[2] == 1) {
        push();
        translate(
          (cell[0] + 1) * wallSize + (cell[0] + 0.5) * pathSize,
          wallHeight / 2,
          (cell[1] + 0.5) * wallSize + cell[1] * pathSize
        );
        box(wallSize * 2 + pathSize, wallHeight, wallSize);
        pop();
      }

      if (cell[3] == 1) {
        push();
        translate(
          (cell[0] + 0.5) * wallSize + cell[0] * pathSize,
          wallHeight / 2,
          (cell[1] + 1) * wallSize + (cell[1] + 0.5) * pathSize
        );
        box(wallSize, wallHeight, wallSize * 2 + pathSize);
        pop();
      }
    }
  }

  const totalSize = (gridSize + 1) * wallSize + gridSize * pathSize;

  // Outer walls
  push(); translate(totalSize / 2, wallHeight / 2, wallSize / 2);         box(totalSize, wallHeight, wallSize); pop();
  push(); translate(wallSize / 2, wallHeight / 2, totalSize / 2);         box(wallSize, wallHeight, totalSize); pop();
  push(); translate(totalSize / 2, wallHeight / 2, (gridSize + 0.5) * wallSize + gridSize * pathSize); box(totalSize, wallHeight, wallSize); pop();
  push(); translate((gridSize + 0.5) * wallSize + gridSize * pathSize, wallHeight / 2, totalSize / 2); box(wallSize, wallHeight, totalSize); pop();

  // Ceiling
  push();
  fill(200);
  translate(((wallSize + pathSize) * gridSize + wallSize) / 2, wallHeight + 1, ((wallSize + pathSize) * gridSize + wallSize) / 2);
  box((wallSize + pathSize) * gridSize + wallSize, 2, (wallSize + pathSize) * gridSize + wallSize);
  pop();

  // Floor
  push();
  fill(0);
  translate(((wallSize + pathSize) * gridSize + wallSize) / 2, -1, ((wallSize + pathSize) * gridSize + wallSize) / 2);
  box((wallSize + pathSize) * gridSize + wallSize, 2, (wallSize + pathSize) * gridSize + wallSize);
  pop();

  // Goal marker (bottom-right corner)
  push();
  fill(255, 255, 255, 100);
  ambientLight(255);
  translate((wallSize + pathSize) * gridSize - pathSize / 2, 5, (wallSize + pathSize) * gridSize - pathSize / 2);
  box(pathSize - 0.1, wallHeight - 0.1, pathSize - 0.1);
  pop();
}

// ========================================
// Enemy Functions
// ========================================

// Spawn enemy at a random cell far from the player start (cell 0,0)
function initEnemy() {
  const step = wallSize + pathSize;
  let col, row;
  do {
    col = Math.floor(random(gridSize));
    row = Math.floor(random(gridSize));
  } while (col < 4 && row < 4); // Keep away from player start

  enemyX = wallSize + col * step + pathSize / 2;
  enemyZ = wallSize + row * step + pathSize / 2;
  enemyPath = [];
  enemyPathIndex = 0;
  pathRefreshTimer = 0;
}

// Returns true if movement from (col,row) in direction is blocked by a wall
// Wall data (0-indexed): cell[2] = top/north wall, cell[3] = left/west wall
function canMoveInMaze(col, row, dir) {
  if (dir === 'right' && col + 1 < gridSize) {
    return mazeCells[row * gridSize + (col + 1)][3] === 0;
  }
  if (dir === 'left' && col > 0) {
    return mazeCells[row * gridSize + col][3] === 0;
  }
  if (dir === 'down' && row + 1 < gridSize) {
    return mazeCells[(row + 1) * gridSize + col][2] === 0;
  }
  if (dir === 'up' && row > 0) {
    return mazeCells[row * gridSize + col][2] === 0;
  }
  return false;
}

// BFS from (startCol,startRow) to (goalCol,goalRow); returns array of [col,row] steps
function findPath(startCol, startRow, goalCol, goalRow) {
  if (startCol === goalCol && startRow === goalRow) return [];

  const visited = new Set();
  const parent = {};
  const queue = [[startCol, startRow]];
  const startKey = `${startCol},${startRow}`;
  visited.add(startKey);

  const dirs = [
    ['right', 1, 0],
    ['left', -1, 0],
    ['down', 0, 1],
    ['up', 0, -1],
  ];

  while (queue.length > 0) {
    const [col, row] = queue.shift();

    if (col === goalCol && row === goalRow) {
      // Reconstruct path (skip start cell, include goal)
      const path = [];
      let cur = `${col},${row}`;
      while (cur !== startKey) {
        const [c, r] = cur.split(',').map(Number);
        path.unshift([c, r]);
        cur = parent[cur];
      }
      return path;
    }

    for (const [dir, dc, dr] of dirs) {
      const nc = col + dc;
      const nr = row + dr;
      const key = `${nc},${nr}`;
      if (!visited.has(key) && canMoveInMaze(col, row, dir)) {
        visited.add(key);
        parent[key] = `${col},${row}`;
        queue.push([nc, nr]);
      }
    }
  }
  return []; // No path
}

// Move enemy along BFS path toward player
function updateEnemy() {
  const step = wallSize + pathSize;

  const enemyCol = Math.floor((enemyX - wallSize) / step);
  const enemyRow = Math.floor((enemyZ - wallSize) / step);
  const playerCol = Math.floor((playerX - wallSize) / step);
  const playerRow = Math.floor((playerZ - wallSize) / step);

  pathRefreshTimer++;
  if (pathRefreshTimer >= PATH_REFRESH_INTERVAL || enemyPath.length === 0) {
    pathRefreshTimer = 0;
    enemyPath = findPath(
      Math.max(0, Math.min(gridSize - 1, enemyCol)),
      Math.max(0, Math.min(gridSize - 1, enemyRow)),
      Math.max(0, Math.min(gridSize - 1, playerCol)),
      Math.max(0, Math.min(gridSize - 1, playerRow))
    );
    enemyPathIndex = 0;
  }

  if (enemyPath.length > 0 && enemyPathIndex < enemyPath.length) {
    const [tc, tr] = enemyPath[enemyPathIndex];
    const targetX = wallSize + tc * step + pathSize / 2;
    const targetZ = wallSize + tr * step + pathSize / 2;
    const dx = targetX - enemyX;
    const dz = targetZ - enemyZ;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < enemySpeed + 0.01) {
      enemyX = targetX;
      enemyZ = targetZ;
      enemyPathIndex++;
    } else {
      // Update facing direction and walk animation
      enemyFacing = Math.atan2(dx, dz);
      enemyWalkPhase += 0.18;
      enemyX += (dx / dist) * enemySpeed;
      enemyZ += (dz / dist) * enemySpeed;
    }
  }
}

// Draw humanoid enemy model (inspired by user's golem hierarchical approach)
// Y is UP in maze world. Root placed at floor (y=0).
// Each limb: translate to pivot, rotate, translate to box center, draw box.
function renderEnemy() {
  const sw = sin(enemyWalkPhase);  // swing amount for walk animation
  const swAmt = 0.45;              // max swing angle (radians)

  push();
  // Root: place at floor level, face movement direction
  translate(enemyX, 0, enemyZ);
  rotateY(-enemyFacing);

  // --- Torso ---
  push();
  fill(160, 85, 65);
  translate(0, 3.75, 0);
  box(3.2, 3.5, 2.0);
  pop();

  // --- Head ---
  push();
  fill(180, 110, 80);
  translate(0, 6.8, 0);
  box(2.2, 2.2, 2.2);
  pop();

  // --- Right Arm (pivot at right shoulder) ---
  push();
  translate(0, 5.5, 1.8);          // shoulder pivot
  rotateZ(sw * swAmt);             // swing forward/back
  translate(0, -1.8, 0);           // arm center hangs below pivot
  fill(160, 85, 65);
  box(1.0, 3.2, 1.0);
  pop();

  // --- Left Arm (pivot at left shoulder, opposite swing) ---
  push();
  translate(0, 5.5, -1.8);
  rotateZ(-sw * swAmt);
  translate(0, -1.8, 0);
  fill(160, 85, 65);
  box(1.0, 3.2, 1.0);
  pop();

  // --- Right Leg (pivot at right hip, opposite to right arm) ---
  push();
  translate(0, 2.5, 0.8);          // hip pivot
  rotateZ(-sw * swAmt);
  translate(0, -1.5, 0);           // leg center hangs below hip
  fill(120, 65, 50);
  box(1.0, 2.8, 1.0);
  pop();

  // --- Left Leg (pivot at left hip, opposite to left arm) ---
  push();
  translate(0, 2.5, -0.8);
  rotateZ(sw * swAmt);
  translate(0, -1.5, 0);
  fill(120, 65, 50);
  box(1.0, 2.8, 1.0);
  pop();

  pop();
}

// Returns true if enemy is within contact distance of player
function checkEnemyCollision() {
  const dx = enemyX - playerX;
  const dz = enemyZ - playerZ;
  return Math.sqrt(dx * dx + dz * dz) < 3.5;
}

// ========================================
// Overhead Map & Key Handling
// ========================================

// Toggle map on P key press
function keyPressed() {
  if (!showTitle && !isGameOver && (key === 'p' || key === 'P')) {
    showMap = !showMap;
  }
}

// Draw a 2D overhead map overlay using WEBGL ortho camera
function drawOverheadMap() {
  const totalSize = (gridSize + 1) * wallSize + gridSize * pathSize;
  const pad = 50;
  const mapSize = Math.min(width, height) - pad * 2;
  const sc = mapSize / totalSize;
  const ox = (width - mapSize) / 2;
  const oy = (height - mapSize) / 2;
  const step = wallSize + pathSize;

  push();
  // Switch to 2D ortho mode centered at canvas origin
  ortho(-width / 2, width / 2, -height / 2, height / 2, -1000, 1000);
  camera(0, 0, 1, 0, 0, 0, 0, 1, 0);
  noLights();
  ambientLight(255);
  // Move origin to top-left corner
  translate(-width / 2, -height / 2, 0);

  // Semi-transparent backdrop
  fill(0, 0, 0, 200);
  noStroke();
  rect(0, 0, width, height);

  // Map background = wall color
  fill(90, 90, 100);
  rect(ox - 1, oy - 1, totalSize * sc + 2, totalSize * sc + 2);

  // Draw open corridors
  fill(20, 20, 30);
  for (let i = 0; i < mazeCells.length; i++) {
    const cell = mazeCells[i];
    const col = cell[0];
    const row = cell[1];
    const cx = ox + (wallSize + col * step) * sc;
    const cy = oy + (wallSize + row * step) * sc;
    const ps = pathSize * sc;
    const ws = wallSize * sc;

    // Cell interior (corridor)
    rect(cx, cy, ps, ps);

    // Open passage north (no top wall → connect to cell above)
    if (cell[2] === 0 && row > 0) {
      rect(cx, cy - ws, ps, ws);
    }
    // Open passage west (no left wall → connect to cell to the left)
    if (cell[3] === 0 && col > 0) {
      rect(cx - ws, cy, ws, ps);
    }
  }

  const dotR = pathSize * sc * 0.38;

  // Goal marker (yellow star-ish circle)
  fill(255, 220, 0, 220);
  noStroke();
  const gx = ox + ((gridSize - 1) * step + wallSize + pathSize / 2) * sc;
  const gy = oy + ((gridSize - 1) * step + wallSize + pathSize / 2) * sc;
  ellipse(gx, gy, dotR * 2.2, dotR * 2.2);

  // Enemy (red)
  fill(220, 40, 40, 230);
  const ex = ox + enemyX * sc;
  const ey = oy + enemyZ * sc;
  ellipse(ex, ey, dotR * 2, dotR * 2);

  // Player (blue + direction arrow)
  fill(60, 140, 255, 240);
  const px = ox + playerX * sc;
  const py = oy + playerZ * sc;
  ellipse(px, py, dotR * 2, dotR * 2);

  stroke(160, 200, 255);
  strokeWeight(2);
  const arrowLen = dotR * 2.4;
  line(px, py,
    px + cos(cameraAngle[1]) * arrowLen,
    py + sin(cameraAngle[1]) * arrowLen);

  // Legend & label
  noStroke();
  textAlign(CENTER, CENTER);
  fill(220, 220, 220);
  textSize(Math.max(12, mapSize * 0.035));
  text('MAP  [ P ] to close', width / 2, oy / 2);

  const lx = ox;
  const ly = oy + totalSize * sc + 12;
  const ls = Math.max(10, mapSize * 0.025);
  textSize(ls);
  textAlign(LEFT, TOP);

  fill(60, 140, 255); rect(lx, ly, ls, ls);
  fill(200); text('  You', lx + ls + 2, ly);

  fill(220, 40, 40); rect(lx + ls * 5, ly, ls, ls);
  fill(200); text('  Enemy', lx + ls * 7, ly);

  fill(255, 220, 0); rect(lx + ls * 13, ly, ls, ls);
  fill(200); text('  Goal', lx + ls * 15, ly);

  pop();
}

// ========================================

function draw() {
  noStroke();
  fill(0);

  if (!showTitle) {
    background(0);

    if (!isGameOver) {
      updatePlayer();
      updateEnemy();

      if (checkEnemyCollision()) {
        isGameOver = true;
        gameOverTimer = GAMEOVER_DURATION;
      }
    } else {
      gameOverTimer--;
      if (gameOverTimer <= 0) {
        // Return to title and reset all state
        showTitle = true;
        isGameOver = false;
        isSolvable = false;
        showMap = false;
        walkBob = [0, 0, 0, 4, 0];
        playerX = wallSize + pathSize / 2;
        playerY = wallHeight / 2;
        playerZ = wallSize + pathSize / 2;
        cameraAngle = [0, Math.PI / 4];
        createCanvas(windowWidth, windowHeight);
        background(220);
        return;
      }
    }

    fill(255, 255, 0);
    ambientLight(0);
    pointLight(150, 150, 150, playerX, playerY, playerZ);
    lightFalloff(0.5, 0.08, 0.001);

    renderMaze();
    renderEnemy();

    // Overhead map overlay (P key)
    if (showMap) {
      drawOverheadMap();
    }

    // Game Over overlay (2D text in WEBGL mode)
    if (isGameOver) {
      push();
      noLights();
      ambientLight(255);
      translate(-width / 2, -height / 2, 0);
      noStroke();
      fill(255, 0, 0, 220);
      textSize(width / 5);
      textAlign(CENTER, CENTER);
      text('GAME OVER', width / 2, height / 2);
      pop();
    }
  }

  if (showTitle) {
    stroke(0);
    strokeWeight(2);

    textSize(windowWidth / 6);
    text("迷路", windowWidth / 3, windowHeight / 3);
    fill(220);
    rect(windowWidth / 4, windowHeight * 2 / 3, windowWidth / 2, windowHeight / 4);
    fill(0);
    textSize(windowWidth / 8);
    text(" START! ", windowWidth * 7 / 32, windowHeight * 6 / 7);

    if (generateFailCount > 0) {
      text("Failed", windowWidth / 2, windowHeight / 2);
      generateFailCount -= 1;
    }

    const inButton =
      mouseIsPressed &&
      mouseX > windowWidth / 4 && mouseX < windowWidth * 3 / 4 &&
      mouseY > windowHeight * 2 / 3 && mouseY < windowHeight * 11 / 12;

    if (inButton) {
      for (let i = 0; i < 100 && !isSolvable; i++) {
        background(220);
        generateMaze();
        validateMaze();
      }

      if (isSolvable) {
        showTitle = false;
        isGameOver = false;
        initEnemy();
        createCanvas(windowWidth, windowHeight, WEBGL);
        cam = createCamera();
        cam.camera(playerX, playerY, playerZ + 500, 0, 0, 0, 0, 1, 0);
        cam.perspective(PI * (fov - 1) / fov, width / height, 0.01, 100);
      } else {
        generateFailCount = 20;
      }
    }
  }
}