document.addEventListener('DOMContentLoaded', function() {
    // Lägg till event listeners för knapparna
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('return-btn').addEventListener('click', returnToMenu);

    // Lägg till event listeners för keyboard
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Info button events
    document.getElementById('infoButton').addEventListener('click', showInfoModal);
    document.getElementById('infoClose').addEventListener('click', closeInfoModal);
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('infoModal')) {
            closeInfoModal();
        }
    });
});

function showInfoModal() {
    document.getElementById('infoModal').style.display = 'block';
}

function closeInfoModal() {
    document.getElementById('infoModal').style.display = 'none';
}


const config = {
    ballSpeed: 8,
    paddleSpeed: 7,
    brick: {
        rowCount: 6,
        columnCount: 9,
        width: 75,
        height: 20,
        padding: 10,
        offsetTop: 60,
        offsetLeft: 20
    },
    star: {
        count: 100,
        maxRadius: 3,
        maxSpeed: 3
    }
};

let gameState = {
    username: '',
    ball: {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        radius: 10
    },
    paddle: {
        height: 10,
        width: 100,
        x: 0
    },
    bricks: [],
    score: 0,
    lives: 3,
    gameOver: false,
    rightPressed: false,
    leftPressed: false
};

function startGame() {
    gameState.username = document.getElementById('username-input').value.trim();
    if (gameState.username === '') {
        gameState.username = 'Anonymous';
    }

    document.getElementById('username-form').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    initializeGame();
}

function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element 'gameCanvas' not found.");
        return;
    }
    const ctx = canvas.getContext('2d');

    const starCanvas = document.getElementById('starCanvas');
    if (!starCanvas) {
        console.error("Canvas element 'starCanvas' not found.");
        return;
    }
    const starCtx = starCanvas.getContext('2d');

    resetBallAndPaddle(canvas);
    initializeBricks();
    drawInitialScreen(ctx);
    drawStars(starCtx);
    setupEventListeners(canvas);
}

function resetBallAndPaddle(canvas) {
    gameState.paddle.x = (canvas.width - gameState.paddle.width) / 2;
    gameState.ball.x = gameState.paddle.x + gameState.paddle.width / 2;
    gameState.ball.y = canvas.height - gameState.paddle.height - gameState.ball.radius;
    randomizeBallDirection();
    applySpeedToBall(config.ballSpeed); // Tillämpa konstant hastighet
}


function randomizeBallDirection() {
    // Definiera det övre gränsen för vinkeln i grader
    const minAngleDegrees = 30; // Min vinkel, t.ex. 30 grader
    const maxAngleDegrees = 60; // Max vinkel, t.ex. 60 grader

    // Omvandla grader till radianer
    const minAngleRadians = minAngleDegrees * (Math.PI / 180);
    const maxAngleRadians = maxAngleDegrees * (Math.PI / 180);

    // Generera en slumpmässig vinkel inom det angivna intervallet
    const angle = Math.random() * (maxAngleRadians - minAngleRadians) + minAngleRadians;

    // Sätt bollens hastighet baserat på den slumpmässiga vinkeln
    gameState.ball.dx = Math.cos(angle);
    gameState.ball.dy = -Math.sin(angle); // - för att säkerställa att bollen går uppåt

    // Applicera hastighet
    applySpeedToBall(config.ballSpeed);

    console.log(`Ball direction set to dx: ${gameState.ball.dx}, dy: ${gameState.ball.dy}`);
}


function applySpeedToBall(speed) {
    // Normalisera dx och dy så att hastigheten alltid blir konstant
    const length = Math.sqrt(gameState.ball.dx * gameState.ball.dx + gameState.ball.dy * gameState.ball.dy);
    gameState.ball.dx = (gameState.ball.dx / length) * speed;
    gameState.ball.dy = (gameState.ball.dy / length) * speed;
}


function initializeBricks() {
    const { rowCount, columnCount } = config.brick;
    gameState.bricks = [];
    for (let c = 0; c < columnCount; c++) {
        gameState.bricks[c] = [];
        for (let r = 0; r < rowCount; r++) {
            gameState.bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawInitialScreen(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBricks(ctx);
    drawBall(ctx);
    drawPaddle(ctx);
    drawUsername(ctx);
    drawScore(ctx);
    drawLives(ctx);
}

function drawBall(ctx) {
    const { x, y, radius } = gameState.ball;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f0f';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(ctx) {
    const { x, width, height } = gameState.paddle;
    const canvas = ctx.canvas;
    ctx.beginPath();
    ctx.rect(x, canvas.height - height, width, height);
    ctx.fillStyle = '#0ff';
    ctx.fill();
    ctx.closePath();
}

function drawBricks(ctx) {
    const { rowCount, columnCount, width, height, padding, offsetTop, offsetLeft } = config.brick;
    for (let c = 0; c < columnCount; c++) {
        for (let r = 0; r < rowCount; r++) {
            if (gameState.bricks[c][r].status === 1) {
                const brickX = (c * (width + padding)) + offsetLeft;
                const brickY = (r * (height + padding)) + offsetTop;
                gameState.bricks[c][r].x = brickX;
                gameState.bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, width, height);
                ctx.fillStyle = '#0f0';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawUsername(ctx) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Player: ' + gameState.username, 8, 20);
}

function drawScore(ctx) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + gameState.score, 8, 40);
}

function drawLives(ctx) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('Lives: ' + gameState.lives, ctx.canvas.width - 65, 20);
}

function drawStars(starCtx) {
    const stars = [];
    const { count, maxRadius, maxSpeed } = config.star;
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * starCtx.canvas.width,
            y: Math.random() * starCtx.canvas.height,
            radius: Math.random() * maxRadius,
            speed: Math.random() * maxSpeed + 1
        });
    }

    function draw() {
        starCtx.clearRect(0, 0, starCtx.canvas.width, starCtx.canvas.height);
        starCtx.fillStyle = '#fff';
        stars.forEach(star => {
            starCtx.beginPath();
            starCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            starCtx.fill();
            starCtx.closePath();
            star.y += star.speed;
            if (star.y > starCtx.canvas.height) {
                star.y = 0;
                star.x = Math.random() * starCtx.canvas.width;
            }
        });
        requestAnimationFrame(draw);
    }
    draw();
}

function setupEventListeners(canvas) {
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            startCountdown(() => {
                draw(canvas.getContext('2d'));
            });
        }
    });
}

function handleKeyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.leftPressed = true;
    }
}

function handleKeyUp(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        gameState.rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        gameState.leftPressed = false;
    }
}

function startCountdown(callback) {
    const countdownElement = document.getElementById('countdown-message');
    const startMessageElement = document.getElementById('start-message');
    let count = 3;

    startMessageElement.style.display = 'none';  // Döljer meddelandet

    const interval = setInterval(() => {
        countdownElement.textContent = count;
        if (count === 0) {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            callback();
        }
        count--;
    }, 900);

    countdownElement.style.display = 'block';
    countdownElement.textContent = count;
}

function draw(ctx) {
    if (gameState.gameOver) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawBricks(ctx);
    drawBall(ctx);
    drawPaddle(ctx);
    drawUsername(ctx);
    drawScore(ctx);
    drawLives(ctx);

    const { canvas } = ctx;
    const { ball, paddle } = gameState;

    // Ball collision with the walls
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        // Check collision with paddle
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            // Calculate the position of the impact on the paddle
            const relativeX = ball.x - paddle.x;
            const normalizedX = (relativeX / paddle.width) * 2 - 1; // Value between -1 and 1

            // Define the angle ranges based on the paddle section
            const angleRange = Math.PI / 3; // Angle range for deflection
            let angle;

            if (normalizedX < -0.5) {
                // Left third of the paddle
                angle = -angleRange;
            } else if (normalizedX > 0.5) {
                // Right third of the paddle
                angle = angleRange;
            } else {
                // Middle third of the paddle
                angle = 0;
            }

            // Calculate ball direction based on the impact angle
            ball.dx = Math.sin(angle) * config.ballSpeed;
            ball.dy = -Math.cos(angle) * config.ballSpeed;

            // Ensure the ball always moves upwards
            if (ball.dy > 0) ball.dy = -ball.dy;
        } else {
            // Ball missed the paddle, lose a life
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                showGameOverScreen(false);
            } else {
                resetBallAndPaddle(canvas);
            }
        }
    }

    // Check if all bricks are broken
    if (gameState.bricks.flat().every(brick => brick.status === 0)) {
        gameState.gameOver = true;
        showGameOverScreen(true);
    }

    if (!gameState.gameOver) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (gameState.rightPressed && paddle.x < canvas.width - paddle.width) {
            gameState.paddle.x += config.paddleSpeed;
        } else if (gameState.leftPressed && paddle.x > 0) {
            gameState.paddle.x -= config.paddleSpeed;
        }

        collisionDetection(ctx);
        requestAnimationFrame(() => draw(ctx));
    }
}

function drawPaddle(ctx) {
    const { x, width, height } = gameState.paddle;
    const canvas = ctx.canvas;

    // Rensa canvas innan paddeln ritas
    ctx.clearRect(0, canvas.height - height, canvas.width, height);

    // Definiera sektionens bredd
    const paddleSectionWidth = width / 3;

    ctx.beginPath();
    // Vänster tredjedel
    ctx.rect(x, canvas.height - height, paddleSectionWidth, height);
    ctx.fillStyle = '#ff0000'; // Röd färg för vänster tredjedel
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    // Mitten tredjedel
    ctx.rect(x + paddleSectionWidth, canvas.height - height, paddleSectionWidth, height);
    ctx.fillStyle = '#00ff00'; // Grön färg för mitten tredjedel
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    // Höger tredjedel
    ctx.rect(x + 2 * paddleSectionWidth, canvas.height - height, paddleSectionWidth, height);
    ctx.fillStyle = '#ff0000'; // Röd färg för höger tredjedel
    ctx.fill();
    ctx.closePath();
}

function collisionDetection(ctx) {
    const { ball, bricks, paddle } = gameState;
    const { radius } = ball;
    const { rowCount, columnCount, width, height, padding, offsetTop, offsetLeft } = config.brick;

    // Brickkollisionsdetektion
    for (let c = 0; c < columnCount; c++) {
        for (let r = 0; r < rowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                const brickX = brick.x;
                const brickY = brick.y;

                if (
                    ball.x + radius > brickX &&
                    ball.x - radius < brickX + width &&
                    ball.y + radius > brickY &&
                    ball.y - radius < brickY + height
                ) {
                    // Kollision från sidan
                    if (ball.x > brickX && ball.x < brickX + width) {
                        ball.dy = -ball.dy;
                    } else {
                        ball.dx = -ball.dx;
                    }
                    brick.status = 0;
                    gameState.score++;
                    if (gameState.score === rowCount * columnCount) {
                        gameState.gameOver = true;
                        showGameOverScreen(true);
                    }
                }
            }
        }
    }

    // Kollision med väggar
    if (ball.x + ball.dx > ctx.canvas.width - radius || ball.x + ball.dx < radius) {
        ball.dx = -ball.dx;
    }
    if (ball.y + ball.dy < radius) {
        ball.dy = -ball.dy;
    }

    // Kollision med paddeln
    const paddleTop = ctx.canvas.height - gameState.paddle.height;
    if (ball.y + ball.dy > paddleTop - radius) {
        if (ball.x + radius > gameState.paddle.x && ball.x - radius < gameState.paddle.x + gameState.paddle.width) {
            // Beräkna träffpunkten på paddeln
            const paddleSectionWidth = gameState.paddle.width / 3;
            const relativeX = ball.x - gameState.paddle.x;

            if (relativeX < paddleSectionWidth) {
                // Vänster tredjedel
                ball.dx = -Math.abs(ball.dx); // Studsa åt vänster
                ball.dy = -ball.dy; // Studsa rakt upp
            } else if (relativeX < 2 * paddleSectionWidth) {
                // Mitten tredjedel (neutral del)
                ball.dy = -ball.dy; // Studsa rakt upp
            } else {
                // Höger tredjedel
                ball.dx = Math.abs(ball.dx); // Studsa åt höger
                ball.dy = -ball.dy; // Studsa rakt upp
            }

            // Se till att bollen alltid går uppåt
            if (ball.dy > 0) ball.dy = -ball.dy;
        } else {
            // Bollen missade paddeln, förlora ett liv
            gameState.lives--;
            if (gameState.lives <= 0) {
                gameState.gameOver = true;
                showGameOverScreen(false);
            } else {
                resetBallAndPaddle(ctx.canvas);
            }
        }
    }
}


function showGameOverScreen(won) {
    document.getElementById('game-screen').style.display = 'block'; // Ensure game-screen is visible
    const gameOverScreen = document.getElementById('game-over-screen');
    const startMessage = document.getElementById('start-message');
    const countdownMessage = document.getElementById('countdown-message');

    startMessage.style.display = 'none';
    countdownMessage.style.display = 'none';

    gameOverScreen.style.display = 'block';

    const gameOverMessage = document.getElementById('game-over-message');
    const scoreMessage = document.getElementById('score-message');
    if (won) {
        gameOverMessage.textContent = `Congratulations, ${gameState.username}!`;
    } else {
        gameOverMessage.textContent = `Game Over, ${gameState.username}!`;
    }

    scoreMessage.innerHTML = `Your score: ${gameState.score}`;
}

function returnToMenu() {
    // Ladda om sidan
    window.location.reload();
}
