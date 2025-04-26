const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOver");
const winnerText = document.getElementById("winnerText");

let playerScore = 0;
let aiScore = 0;
const WIN_SCORE = 7;

let upPressed = false;
let downPressed = false;
let difficulty = 1;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

let sounds = {
  hit: new Audio("https://www.soundjay.com/button/beep-07.wav"),
  score: new Audio("https://www.soundjay.com/button/beep-10.wav")
};

let player = {
  x: 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "#00ffcc",
  speed: 6,
};

let ai = {
  x: canvas.width - paddleWidth - 10,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "#ffcc00",
  speed: 4,
};

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speed: 5,
  velocityX: 5,
  velocityY: 3,
  color: "#ffffff",
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.fillText(text, x, y);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 5;
  ball.velocityX = -ball.velocityX;
  ball.velocityY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

function moveAI() {
  let target = ball.y - ai.height / 2;
  let moveAmount = (difficulty === 1) ? 2 :
                   (difficulty === 2) ? 4 :
                   6;

  ai.y += (target - ai.y) * 0.05 * difficulty;

  // Random error chance (lower difficulty, more error)
  if (Math.random() < (0.01 * (4 - difficulty))) {
    ai.y += Math.random() * 50 - 25;
  }
}

function update() {
  // Move player
  if (upPressed) player.y -= player.speed;
  if (downPressed) player.y += player.speed;

  // Keep paddles on screen
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
  ai.y = Math.max(0, Math.min(canvas.height - ai.height, ai.y));

  moveAI();

  // Move ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // Bounce top/bottom
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
  }

  // Paddle collision
  let paddle = (ball.x < canvas.width / 2) ? player : ai;
  if (
    ball.x - ball.radius < paddle.x + paddle.width &&
    ball.x + ball.radius > paddle.x &&
    ball.y > paddle.y &&
    ball.y < paddle.y + paddle.height
  ) {
    // Angle based on hit location
    let collidePoint = ball.y - (paddle.y + paddle.height / 2);
    collidePoint = collidePoint / (paddle.height / 2);
    let angleRad = (Math.PI / 4) * collidePoint;

    let direction = (ball.x < canvas.width / 2) ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    ball.speed += 0.2;

    sounds.hit.play();
  }

  // Score
  if (ball.x - ball.radius < 0) {
    aiScore++;
    sounds.score.play();
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    playerScore++;
    sounds.score.play();
    resetBall();
  }

  if (playerScore === WIN_SCORE || aiScore === WIN_SCORE) {
    endGame();
  }
}

function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");

  // Center line
  for (let i = 0; i < canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, "#fff");
  }

  drawText(playerScore, canvas.width / 4, 50, 40, "#00ffcc");
  drawText(aiScore, 3 * canvas.width / 4, 50, 40, "#ffcc00");

  drawRect(player.x, player.y, player.width, player.height, player.color);
  drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function gameLoop() {
  update();
  render();
  if (playerScore < WIN_SCORE && aiScore < WIN_SCORE) {
    requestAnimationFrame(gameLoop);
  }
}

function startGame(level) {
  difficulty = level;
  menu.style.display = "none";
  canvas.style.display = "block";
  playerScore = 0;
  aiScore = 0;
  resetBall();
  gameLoop();
}

function endGame() {
  canvas.style.display = "none";
  gameOverScreen.style.display = "block";
  winnerText.textContent = playerScore > aiScore ? "You Win! 🏆" : "AI Wins! 🤖";
}

function restartGame() {
  gameOverScreen.style.display = "none";
  menu.style.display = "block";
}

window.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" || e.key === "w") upPressed = true;
  if (e.key === "ArrowDown" || e.key === "s") downPressed = true;
});
window.addEventListener("keyup", e => {
  if (e.key === "ArrowUp" || e.key === "w") upPressed = false;
  if (e.key === "ArrowDown" || e.key === "s") downPressed = false;
});
