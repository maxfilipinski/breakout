const canvas = document.getElementById('canvas');
const canvasCtx = canvas.getContext('2d');

let rightKeyPressed = false;
let leftKeyPressed = false;

const game = {
  score: 0,
  lives: 3,
  paused: false,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 2,
  dy: 2,
  radius: 5,
};

const brick = {
  width: 70,
  height: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

const bricks = {
  columnCount: 0,
  rowCount: 0,
  data: [],
  init: function (columnCount = 5, rowCount = 3) {
    const self = this;

    self.columnCount = columnCount;
    self.rowCount = rowCount;

    for (let c = 0; c < columnCount; c++) {
      self.data[c] = [];
      for (let r = 0; r < rowCount; r++) {
        let brickX = c * (brick.width + brick.padding) + brick.offsetX;
        let brickY = r * (brick.height + brick.padding) + brick.offsetY;
        self.data[c][r] = { x: brickX, y: brickY, ...brick };
      }
    }
  },
};

const paddle = {
  width: 60,
  height: 10,
  x: canvas.width / 2 - 30,
  y: canvas.height - 20,
};

function runNewGame() {
  document.getElementById('mainMenu').style.display = 'none';
  document.getElementById('gameWindow').style.display = 'block';

  bricks.init();
  updateCanvas();
}

function showOptions() {
  document.getElementById('optionsWindow').style.display = 'block';
}

function showHelp() {
  document.getElementById('helpWindow').style.display = 'block';
}

function pauseGame() {
  toggleGameState();
  document.getElementById('pauseMenu').style.display = 'flex';
}

function toggleGameState() {
  game.paused = !game.paused;
}

function resumeGame() {
  toggleGameState();
  updateCanvas();
  document.getElementById('pauseMenu').style.display = 'none';
}

function showMainMenu() {
  document.location.reload();
}

function updateCanvas() {
  draw();

  moveBall();
  movePaddle();

  if (!game.paused) {
    requestAnimationFrame(updateCanvas);
  }
}

function draw() {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawBricks();
  drawLives();
  drawPaddle();
  drawScore();
}

function drawBall() {
  canvasCtx.beginPath();
  canvasCtx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  canvasCtx.fillStyle = '#e6e6e6';
  canvasCtx.fill();
  canvasCtx.closePath();
}

function drawBricks() {
  bricks.data.forEach((column) => {
    column.forEach((brick) => {
      canvasCtx.beginPath();
      canvasCtx.rect(brick.x, brick.y, brick.width, brick.height);
      canvasCtx.fillStyle = brick.visible ? '#0095DD' : 'transparent';
      canvasCtx.fill();
      canvasCtx.closePath();
    });
  });
}

function drawLives() {
  canvasCtx.font = '16px Arial';
  canvasCtx.fillStyle = '#0095DD';
  canvasCtx.fillText(`Lives: ${game.lives}`, canvas.width - 65, 20);
}

function drawPaddle() {
  canvasCtx.beginPath();
  canvasCtx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
  canvasCtx.fillStyle = '#4d88ff';
  canvasCtx.fill();
  canvasCtx.closePath();
}

function drawScore() {
  canvasCtx.font = '16px Arial';
  canvasCtx.fillStyle = '#0095DD';
  canvasCtx.fillText(`Score: ${game.score}`, 8, 20);
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // right/left wall collision
  if (
    ball.x + ball.dx > canvas.width - ball.radius ||
    ball.x + ball.dx < ball.radius
  ) {
    ball.dx = -ball.dx;
  }

  if (ball.y + ball.dy < ball.radius) {
    // top wall collision
    ball.dy = -ball.dy;
  } else if (
    // paddle hit
    ball.y + ball.radius > paddle.y &&
    ball.x + ball.radius > paddle.x &&
    ball.x - ball.radius < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;
  } else if (ball.y + ball.dy > canvas.height - ball.radius) {
    // bottom collision
    game.lives--;

    if (!game.lives) {
      console.log('game over');
    } else {
      ball.x = canvas.width / 2;
      ball.y = canvas.height - 30;
      ball.dx = 2;
      ball.dy = -2;
      paddle.x = (canvas.width - paddle.width) / 2;
    }
  }

  // bricks collision
  bricks.data.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          ball.dy = -ball.dy;
          brick.visible = false;

          game.score++;
          if (game.score === bricks.columnCount * bricks.rowCount) {
            console.log('you win');
          }
        }
      }
    });
  });
}

function movePaddle() {
  if (rightKeyPressed) {
    paddle.x += 7;

    if (paddle.x + paddle.width > canvas.width) {
      paddle.x = canvas.width - paddle.width;
    }
  } else if (leftKeyPressed) {
    paddle.x -= 7;

    if (paddle.x < 0) {
      paddle.x = 0;
    }
  }
}

function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightKeyPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftKeyPressed = true;
  } else if (e.key === 'Escape') {
    pauseGame();
  }
}

function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight') {
    rightKeyPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
    leftKeyPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  const relativeY = e.clientY - canvas.offsetTop;

  if (
    relativeX > 0 &&
    relativeX < canvas.width &&
    relativeY > 0 &&
    relativeY < canvas.height
  ) {
    if (relativeX > 0 && relativeX < paddle.width / 2) {
      paddle.x = 0;
    } else if (
      relativeX < canvas.width &&
      relativeX > canvas.width - paddle.width / 2
    ) {
      paddle.x = canvas.width - paddle.width;
    } else {
      paddle.x = relativeX - paddle.width / 2;
    }
  }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
