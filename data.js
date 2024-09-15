// data.js
let currentScore = 0;
let highScore = localStorage.getItem('brickBreakerHighScore') || 0;

function updateHighScore(score) {
    highScore = Math.max(score, highScore);
    localStorage.setItem('brickBreakerHighScore', highScore);
}

function getCurrentScore() {
    return currentScore;
}

function setCurrentScore(score) {
    currentScore = score;
}

