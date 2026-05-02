const gameContainer = document.querySelector('.game-container');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const movesEl = document.getElementById('moves');
const leaderboardEl = document.getElementById("leaderboard");
let leaderboard = JSON.parse(localStorage.getItem("memoryLeaderboard")) || [];

const items = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍍", "🥝", "🍉"];
let cards = [...items, ...items];

let moves = 0;


cards.sort(() => Math.random() - 0.5);

let firstCard = null;
let lockBoard = false;
let matchedPairs = 0;

let time = 0;
let timer = null;

// Load best score
let bestScore = localStorage.getItem("memoryBest");
if (bestScore) bestEl.textContent = bestScore;

// Start timer
function startTimer() {
    timer = setInterval(() => {
        time++;
        timeEl.textContent = time;
    }, 1000);
}

// Create cards
cards.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="front">${item}</div>
        <div class="back"></div>
    `;
    card.addEventListener('click', flipCard);
    gameContainer.appendChild(card);
});

let gameStarted = false;

function flipCard() {
    if (!gameStarted) {
        startTimer();
        gameStarted = true;
    }

    if (lockBoard || this === firstCard) return;

    this.classList.add('flip');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    checkMatch(this);
}

function checkMatch(secondCard) {
     // Count a move every time two cards are selected
    moves++;
    movesEl.textContent = moves;

    const isMatch =
        firstCard.querySelector('.front').textContent ===
        secondCard.querySelector('.front').textContent;

    if (isMatch) {
        matchedPairs++;
        firstCard = null;

        if (matchedPairs === items.length) {
            clearInterval(timer);
            setTimeout(() => winGame(), 300);
        }
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            firstCard = null;
            lockBoard = false;
        }, 800);
    }
};

function updateLeaderboard() {
    leaderboardEl.innerHTML = "";

    leaderboard
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)
        .forEach((entry, index) => {
            const li = document.createElement("li");
            li.textContent = `${index + 1}. ${entry.time}s — ${entry.moves} moves`;
            leaderboardEl.appendChild(li);
        });
};


function resetGame() {
    moves = 0;
    movesEl.textContent = 0;

    // Reset timer
    time = 0;
    timeEl.textContent = 0;
    clearInterval(timer);
    timer = null;
    gameStarted = false;

    // Reset board
    gameContainer.innerHTML = "";
    matchedPairs = 0;
    firstCard = null;
    lockBoard = false;

    // Shuffle new cards
    cards.sort(() => Math.random() - 0.5);

    // Rebuild cards
    cards.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="front">${item}</div>
            <div class="back"></div>
        `;
        card.addEventListener('click', flipCard);
        gameContainer.appendChild(card);
    });
}


document.getElementById("resetBtn").addEventListener("click", resetGame);

function winGame() {
    alert(`🎉 You Win! Time: ${time}s — Moves: ${moves}`);

    // Save high score
    if (!bestScore || time < bestScore) {
        localStorage.setItem("memoryBest", time);
        bestEl.textContent = time;
        bestScore = time;
    }

    // Add to leaderboard
    leaderboard.push({ time: time, moves: moves });
    localStorage.setItem("memoryLeaderboard", JSON.stringify(leaderboard));

    updateLeaderboard();

    // Reset after user clicks OK
    resetGame();
}

updateLeaderboard();


