/* Colors */
const COLOR_BLACK = 'black';
const COLOR_WHITE = 'white';
const COLOR_BLUE = 'blue';

/* Sizes (in px) */
const GRID_WIDTH = 1200;
const GRID_HEIGHT = 800;
const CELL_SIZE = 10;

/* Sizes (in cells) */
const CELLS_IN_ROW = Math.floor(GRID_WIDTH / CELL_SIZE);
const CELLS_IN_COL = Math.floor(GRID_HEIGHT / CELL_SIZE);
const CELLS_ALL = CELLS_IN_ROW * CELLS_IN_COL;

/* Canvas */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

/* setup size */
canvas.width = GRID_WIDTH + 1;
canvas.height = GRID_HEIGHT;

/* Cells States Matrices */
let cellMatrix = [];
let nextMatrix = [];

/* Alive Cells Counter */
let aliveCells;

/* Game States */
let gameStates = ['Creating Initial Pattern', 'Running', 'Paused'];
let gameState;

/* Game Timer */
let gameTimer;

/* Generation */
let generation;

/* Mouse events */
let isDrawing = false;
let isRemoving = false;

canvas.addEventListener('mousedown', function(e) {
  switch(e.button) {
  	case 0: // LMB
  	  isDrawing = true;
  	  isRemoving = false;
  	  drawCell(e);

  	  break;
  	case 2: // RMB
  	  isDrawing = false;
  	  isRemoving = true;
  	  removeCell(e);

  	  break;
  }
});

canvas.addEventListener('mousemove', function(e) {
  if (isDrawing) {
    drawCell(e);
  }

  if (isRemoving) {
  	removeCell(e);
  }
});

canvas.addEventListener('mouseup', function(e) {
  isDrawing = false;
  isRemoving = false;
});

function init() {
  gameState = gameStates[0];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clearInterval(gameTimer);
  generation = 0;
  aliveCells = 0;
  document.getElementById('gen').innerHTML = 'Generation: ' + generation;
  document.getElementById('game-state').innerHTML = 'Game State: ' + gameState;
  document.getElementById('play-pause').innerHTML = 'Play';
  document.getElementById('alive-cells').innerHTML = 'Alive Cells: ' + aliveCells;
  drawGrid();
  enterTheMatrix();
};

init();

function drawGrid() {
  ctx.beginPath();

  for (let x = 0; x <= GRID_WIDTH; x += CELL_SIZE) {
    ctx.moveTo(0.5 + x, 0);
    ctx.lineTo(0.5 + x, GRID_HEIGHT);
  }

  for (let x = 0; x <= GRID_HEIGHT; x += CELL_SIZE) {
    ctx.moveTo(0.5, x);
    ctx.lineTo(0.5 + GRID_WIDTH, x);
  }

  ctx.closePath();
  ctx.strokeStyle = COLOR_BLACK;
  ctx.stroke();
}

function enterTheMatrix() {
  for (let i = 0; i < CELLS_ALL; i++) {
  	/* 0 - unpopulated, 1 - populated */
    cellMatrix[i] = nextMatrix[i] = 0;
  }
}

function drawCell(event, props) {
  if (event) {
  	const coords = getRectCoords(event);
    const index = getCellIndex(coords.x, coords.y);

  	if (cellMatrix[index] === 0) {
      drawRect(coords.x, coords.y, CELL_SIZE, CELL_SIZE, COLOR_BLUE);
      cellMatrix[index] = 1; // alive
      aliveCells++;
      document.getElementById('alive-cells').innerHTML = 'Alive Cells: ' + aliveCells;
  	}
  } else {
  	  drawRect(props.x, props.y, CELL_SIZE, CELL_SIZE, COLOR_BLUE);
      cellMatrix[props.index] = 1; // alive
  }
}

function getRectCoords(event) {
  const cursorPosition = getCursorPosition(canvas, event);
  const x = cursorPosition.x - cursorPosition.x % CELL_SIZE;
  const y = cursorPosition.y - cursorPosition.y % CELL_SIZE;

  return {x, y};
}

function getCellIndex(topLeftX, topLeftY) {
  const colIndex = Math.floor(topLeftX / CELL_SIZE);
  const rowIndex = Math.floor(topLeftY / CELL_SIZE);

  return CELLS_IN_ROW * rowIndex + colIndex;
}

function drawRect(x, y, width, height, color) {
  ctx.beginPath();
  ctx.rect(x + 1, y + 1, width - 1, height - 1);
  ctx.fillStyle = color;
  ctx.closePath();
  ctx.fill();
}

function removeCell(event, props) {
  if (event) {
  	const coords = getRectCoords(event);
    const index = getCellIndex(coords.x, coords.y);

    ctx.clearRect(1 + coords.x, 1 + coords.y, CELL_SIZE - 1, CELL_SIZE - 2);
    cellMatrix[index] = 0; // dead
  } else {
  	ctx.clearRect(1 + props.x, 1 + props.y, CELL_SIZE - 1, CELL_SIZE - 2);
    cellMatrix[props.index] = 0; // dead
  }
}

function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.abs(event.clientX - rect.left);
  const y = Math.abs(event.clientY - rect.top);

  return {x, y};
}

function nextGen() {
  if (gameState === gameStates[0]) { // Creating Initial Pattern
  	gameState = gameStates[2]; // Paused
  	document.getElementById('game-state').innerHTML = 'Game State: ' + gameState;
  }

  for (let i = 0; i < CELLS_ALL; i++) {
    const neighboursStates = getNeighboursStates(i);
    const aliveNeighbours = getAliveNeighbours(neighboursStates);

    if (cellMatrix[i] === 0) {
      if (aliveNeighbours === 3) {
        nextMatrix[i] = 1; // alive
      }
    }
    else {
      if (aliveNeighbours === 2 || aliveNeighbours === 3) {
        nextMatrix[i] = 1; // alive
      }
      else {
      	nextMatrix[i] = 0; // dead
      }
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear field
  drawGrid(); // redraw grid
  drawCellsFromMatrix(nextMatrix);
  aliveCells = 0;
  cellMatrix = nextMatrix.map(item => {
  	if (item === 1) {
  	  aliveCells++;
  	}

  	return item;
  });
  document.getElementById('alive-cells').innerHTML = 'Alive Cells: ' + aliveCells;
  generation++;
  document.getElementById('gen').innerHTML = 'Generation: ' + generation;
}

function drawCellsFromMatrix(matrix) {
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i] === 1) {
      const rowIndex = Math.floor(i / CELLS_IN_ROW);
  	  const colIndex = i - CELLS_IN_ROW * rowIndex;

  	  drawCell(null, { x: colIndex * CELL_SIZE, y: rowIndex * CELL_SIZE, index: i });
    }
  }
}

function playpause() {
  if (gameState === gameStates[1]) { // isrunning
  	document.getElementById('play-pause').innerHTML = 'Play';
  	gameState = gameStates[2]; // ispaused
  	document.getElementById('game-state').innerHTML = 'Game State: ' + gameState;
    clearInterval(gameTimer);
  }
  else {
  	document.getElementById('play-pause').innerHTML = 'Pause';
    gameState = gameStates[1]; // isrunning
    document.getElementById('game-state').innerHTML = 'Game State: ' + gameState;
    gameTimer = setInterval(
      function() {
        nextGen();
      }
  , 14);
  }
}

function getNeighboursStates(cellIndex) {
  const rowIndex = Math.floor(cellIndex / CELLS_IN_ROW);
  const colIndex = cellIndex - CELLS_IN_ROW * rowIndex;

  const neighboursIndexes = [
    // top left neighbour
    rowIndex === 0 ? (colIndex === 0 ? CELLS_ALL - 1 : CELLS_ALL - CELLS_IN_ROW + cellIndex - 1) : colIndex === 0 ? cellIndex - 1 : cellIndex - CELLS_IN_ROW - 1,
    // top neighbour
    rowIndex === 0 ? CELLS_ALL - CELLS_IN_ROW + cellIndex : cellIndex - CELLS_IN_ROW,
    // top right neighbour
    rowIndex === 0 ? (colIndex === CELLS_IN_ROW - 1 ? CELLS_ALL - CELLS_IN_ROW : CELLS_ALL - CELLS_IN_ROW + cellIndex + 1) : colIndex === CELLS_IN_ROW - 1 ? cellIndex - (CELLS_IN_ROW << 1) + 1 : cellIndex - CELLS_IN_ROW + 1,
    // left neighbour
    colIndex === 0 ? cellIndex + CELLS_IN_ROW - 1 : cellIndex - 1,
    // right neighbour
    colIndex === CELLS_IN_ROW - 1 ? cellIndex - CELLS_IN_ROW + 1 : cellIndex + 1,
    // bottom left neighbour
    rowIndex === CELLS_IN_COL - 1 ? (colIndex === 0 ? cellIndex - CELLS_ALL + (CELLS_IN_ROW << 1) - 1 : cellIndex - (CELLS_ALL - CELLS_IN_ROW) - 1) : colIndex === 0 ? cellIndex + (CELLS_IN_ROW << 1) - 1 : cellIndex + CELLS_IN_ROW - 1,
    // bottom neighbour
    rowIndex === CELLS_IN_COL - 1 ? cellIndex - (CELLS_ALL - CELLS_IN_ROW) : cellIndex + CELLS_IN_ROW,
    // bottom right neighbour
    rowIndex === CELLS_IN_COL - 1 ? (colIndex === CELLS_IN_ROW - 1 ? 0 : cellIndex - (CELLS_ALL - CELLS_IN_ROW) + 1 ) : colIndex === CELLS_IN_ROW - 1 ? cellIndex + 1 : cellIndex + CELLS_IN_ROW + 1
  ];

  return [
    cellMatrix[neighboursIndexes[0]],
    cellMatrix[neighboursIndexes[1]],
    cellMatrix[neighboursIndexes[2]],
    cellMatrix[neighboursIndexes[3]],
    cellMatrix[neighboursIndexes[4]],
    cellMatrix[neighboursIndexes[5]],
    cellMatrix[neighboursIndexes[6]],
    cellMatrix[neighboursIndexes[7]]
  ];
}

function getAliveNeighbours(neighboursStates) {
  let count = 0;

  neighboursStates.map(state => {
  	if (state === 1) {
      count++;
    }
  });

  return count;
}

function drawRandomCells() {
  init();

  for (let i = 0; i < CELLS_ALL; i++) {
  	if (getRandomInt(0, 2) === 1) {
  	  const rowIndex = Math.floor(i / CELLS_IN_ROW);
  	  const colIndex = i - CELLS_IN_ROW * rowIndex;
  	  aliveCells++;

  	  drawCell(null, { x: colIndex * CELL_SIZE, y: rowIndex * CELL_SIZE, index: i });
  	}
  }
  document.getElementById('alive-cells').innerHTML = 'Alive Cells: ' + aliveCells;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
