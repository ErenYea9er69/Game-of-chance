/* ====================================
   GAME OF CHANCE - ENHANCED VERSION
   ==================================== */

// ====================================
// PLAYER DATA STRUCTURE
// ====================================
let player = {
    name: '',
    credits: 100,
    highscore: 100,
    uid: Date.now(),
    gamesPlayed: 0,
    totalWins: 0
};

// ====================================
// GAME STATE
// ====================================
let currentGame = null;
let aceGame = {
    ace: 0,
    pick: -1,
    wagerOne: 0,
    wagerTwo: 0,
    revealed: -1
};

// ====================================
// INITIALIZATION
// ====================================
function initPlayer() {
    const saved = localStorage.getItem('gameOfChancePlayer');
    if (saved) {
        try {
            player = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load player data:', e);
            registerNewPlayer();
        }
    } else {
        registerNewPlayer();
    }
    updateDisplay();
    animateCredits();
}

function registerNewPlayer() {
    const name = prompt('🎰 NEW PLAYER REGISTRATION\n\nEnter your name:') || 'Player';
    player.name = name.trim() || 'Player';
    player.credits = 100;
    player.highscore = 100;
    player.uid = Date.now();
    player.gamesPlayed = 0;
    player.totalWins = 0;
    savePlayer();
}

function savePlayer() {
    try {
        localStorage.setItem('gameOfChancePlayer', JSON.stringify(player));
        updateDisplay();
    } catch (e) {
        console.error('Failed to save player data:', e);
    }
}

// ====================================
// UI UPDATE FUNCTIONS
// ====================================
function updateDisplay() {
    document.getElementById('playerName').textContent = player.name;
    document.getElementById('playerCredits').textContent = player.credits;
    document.getElementById('playerHighscore').textContent = player.highscore;
}

function animateCredits() {
    const creditsEl = document.getElementById('playerCredits');
    creditsEl.style.animation = 'none';
    setTimeout(() => {
        creditsEl.style.animation = 'fadeIn 0.3s ease';
    }, 10);
}

function updateHighscore() {
    if (player.credits > player.highscore) {
        player.highscore = player.credits;
        showNotification('🎉 New High Score!');
    }
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `result-message ${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.maxWidth = '300px';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================================
// GAME MANAGEMENT
// ====================================
function startGame(gameType) {
    currentGame = gameType;
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';

    switch(gameType) {
        case 'pickNumber':
            pickNumberGame();
            break;
        case 'noMatch':
            noMatchGame();
            break;
        case 'findAce':
            findAceGame();
            break;
    }
}

function backToMenu() {
    document.getElementById('gameArea').innerHTML = '';
    currentGame = null;
}

// ====================================
// GAME 1: PICK A NUMBER
// ====================================
function pickNumberGame() {
    if (player.credits < 10) {
        showNotification('Insufficient credits! You need at least 10 credits to play.', 'lose');
        return;
    }

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Pick a Number</h3>
            <p class="game-description">
                This game costs <strong>10 credits</strong> to play. Simply pick a number 
                between 1 and 20. If you pick the winning number, you will win the 
                <strong>jackpot of 100 credits</strong>!
            </p>
            <input type="number" id="userPick" min="1" max="20" placeholder="Enter a number (1-20)" autofocus>
            <div class="action-buttons">
                <button onclick="playPickNumber()" class="btn-primary">Place Bet & Play</button>
                <button onclick="backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
            <div id="pickResult"></div>
        </section>
    `;
}

function playPickNumber() {
    const pickInput = document.getElementById('userPick');
    const pick = parseInt(pickInput.value);
    
    if (!pick || pick < 1 || pick > 20) {
        showNotification('Please enter a valid number between 1 and 20', 'lose');
        pickInput.focus();
        return;
    }

    player.credits -= 10;
    player.gamesPlayed++;
    
    const winning = Math.floor(Math.random() * 20) + 1;
    const resultDiv = document.getElementById('pickResult');
    
    // Add suspense delay
    pickInput.disabled = true;
    resultDiv.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        let resultHTML = '<div class="result-message ';
        
        if (pick === winning) {
            player.credits += 100;
            player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎉</span>';
            resultHTML += `<strong>JACKPOT!</strong> The winning number was ${winning}. You won 100 credits!`;
            showNotification('💰 JACKPOT! +100 credits', 'win');
        } else {
            resultHTML += 'lose"><span class="emoji">😔</span>';
            resultHTML += `The winning number was ${winning}. You picked ${pick}. Better luck next time!`;
        }
        resultHTML += '</div>';
        
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="pickNumberGame()" class="btn-primary">Play Again</button>
                <button onclick="backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;
        
        resultDiv.innerHTML = resultHTML;
        updateHighscore();
        savePlayer();
    }, 1500);
}

// ====================================
// GAME 2: NO MATCH DEALER
// ====================================
function noMatchGame() {
    if (player.credits === 0) {
        showNotification('You don\'t have any credits to wager!', 'lose');
        return;
    }

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>No Match Dealer</h3>
            <p class="game-description">
                In this game, you can wager up to all of your credits. The dealer will 
                deal out <strong>16 random numbers</strong> between 0 and 99. If there are 
                <strong>no matches</strong> among them, you <strong>double your money</strong>!
            </p>
            <input type="number" id="wagerAmount" min="1" max="${player.credits}" placeholder="Enter your wager">
            <div class="action-buttons">
                <button onclick="playNoMatch()" class="btn-primary">Deal Cards</button>
                <button onclick="backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
            <div id="noMatchResult"></div>
        </section>
    `;
}

function playNoMatch() {
    const wagerInput = document.getElementById('wagerAmount');
    const wager = parseInt(wagerInput.value);
    
    if (!wager || wager < 1 || wager > player.credits) {
        showNotification('Please enter a valid wager amount', 'lose');
        wagerInput.focus();
        return;
    }

    player.gamesPlayed++;
    wagerInput.disabled = true;
    
    const resultDiv = document.getElementById('noMatchResult');
    resultDiv.innerHTML = '<div class="spinner"></div>';
    
    setTimeout(() => {
        const numbers = [];
        for (let i = 0; i < 16; i++) {
            numbers.push(Math.floor(Math.random() * 100));
        }

        let match = -1;
        for (let i = 0; i < 15; i++) {
            for (let j = i + 1; j < 16; j++) {
                if (numbers[i] === numbers[j]) {
                    match = numbers[i];
                    break;
                }
            }
            if (match !== -1) break;
        }

        let gridHTML = '<div class="numbers-grid">';
        numbers.forEach((num, index) => {
            const isMatch = num === match ? ' match' : '';
            gridHTML += `<div class="number-cell${isMatch}" style="--i: ${index}">${num}</div>`;
        });
        gridHTML += '</div>';

        let resultHTML = '<div class="result-message ';
        if (match !== -1) {
            player.credits -= wager;
            resultHTML += 'lose"><span class="emoji">💔</span>';
            resultHTML += `The dealer matched the number <strong>${match}</strong>! You lose ${wager} credits.`;
        } else {
            player.credits += wager;
            player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎊</span>';
            resultHTML += `There were no matches! You win <strong>${wager} credits</strong>!`;
            showNotification(`💸 Won ${wager} credits!`, 'win');
        }
        resultHTML += '</div>';
        
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="noMatchGame()" class="btn-primary">Play Again</button>
                <button onclick="backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;

        resultDiv.innerHTML = gridHTML + resultHTML;
        updateHighscore();
        savePlayer();
    }, 800);
}

// ====================================
// GAME 3: FIND THE ACE
// ====================================
function findAceGame() {
    if (player.credits === 0) {
        showNotification('You don\'t have any credits to wager!', 'lose');
        return;
    }

    aceGame = { ace: 0, pick: -1, wagerOne: 0, wagerTwo: 0, revealed: -1 };
    aceGame.ace = Math.floor(Math.random() * 3);

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Find the Ace</h3>
            <p class="game-description">
                In this game, you can wager up to all of your credits. Three cards will be 
                dealt out: <strong>two queens and one ace</strong>. If you find the ace, 
                you will win your wager. After choosing a card, one of the queens will be 
                revealed. You may then change your pick or increase your wager.
            </p>
            <input type="number" id="aceWager" min="1" max="${player.credits}" placeholder="Enter your wager">
            <button onclick="dealAceCards()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                Place Wager & Deal Cards
            </button>
            <button onclick="backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                Back to Menu
            </button>
            <div id="aceGameArea"></div>
        </section>
    `;
}

function dealAceCards() {
    const wagerInput = document.getElementById('aceWager');
    const wager = parseInt(wagerInput.value);
    
    if (!wager || wager < 1 || wager > player.credits) {
        showNotification('Please enter a valid wager amount', 'lose');
        wagerInput.focus();
        return;
    }

    aceGame.wagerOne = wager;
    player.gamesPlayed++;

    const gameArea = document.getElementById('aceGameArea');
    gameArea.innerHTML = `
        <p class="game-description text-center" style="margin-top: 24px;">Select a card:</p>
        <div class="cards-display">
            <div class="card" onclick="selectCard(0)">?</div>
            <div class="card" onclick="selectCard(1)">?</div>
            <div class="card" onclick="selectCard(2)">?</div>
        </div>
    `;
}

function selectCard(index) {
    if (aceGame.pick !== -1) return; // Already selected
    
    aceGame.pick = index;
    
    // Reveal a queen that's not the ace and not the pick
    let reveal = 0;
    while (reveal === aceGame.ace || reveal === aceGame.pick) {
        reveal++;
    }
    aceGame.revealed = reveal;

    const cards = ['?', '?', '?'];
    cards[reveal] = 'Q';

    const gameArea = document.getElementById('aceGameArea');
    gameArea.innerHTML = `
        <p class="game-description text-center" style="margin-top: 24px;">
            Your pick: <strong>Card ${aceGame.pick + 1}</strong>
        </p>
        <div class="cards-display">
            ${cards.map((c, i) => `
                <div class="card ${i === aceGame.pick ? 'selected' : ''} ${i === reveal ? 'revealed' : ''}">${c}</div>
            `).join('')}
        </div>
        <p class="game-description text-center">
            A queen has been revealed. Would you like to:
        </p>
        <div class="action-buttons">
            <button onclick="changeCard()" class="btn-primary">Change Your Pick</button>
            <button onclick="increaseWager()" class="btn-primary">Increase Wager</button>
        </div>
    `;
}

function changeCard() {
    let newPick = 0;
    while (newPick === aceGame.pick || newPick === aceGame.revealed) {
        newPick++;
    }
    aceGame.pick = newPick;
    showNotification(`Card changed to Card ${newPick + 1}`, 'info');
    setTimeout(revealResult, 500);
}

function increaseWager() {
    const maxAdditional = player.credits - aceGame.wagerOne;
    const additional = prompt(`Enter additional wager amount (max ${maxAdditional}):`);
    const wagerTwo = parseInt(additional);
    
    if (wagerTwo && wagerTwo > 0 && (aceGame.wagerOne + wagerTwo) <= player.credits) {
        aceGame.wagerTwo = wagerTwo;
        showNotification(`Added ${wagerTwo} credits to wager`, 'info');
        setTimeout(revealResult, 500);
    } else {
        showNotification('Invalid wager amount', 'lose');
    }
}

function revealResult() {
    const cards = ['Q', 'Q', 'Q'];
    cards[aceGame.ace] = 'A';

    let resultHTML = `
        <p class="game-description text-center" style="margin-top: 24px;">
            <strong>Final Result</strong>
        </p>
        <div class="cards-display">
            ${cards.map((c, i) => `
                <div class="card ${i === aceGame.pick ? 'selected' : ''} revealed">${c}</div>
            `).join('')}
        </div>
    `;

    resultHTML += '<div class="result-message ';
    if (aceGame.pick === aceGame.ace) {
        player.credits += aceGame.wagerOne;
        player.totalWins++;
        resultHTML += 'win"><span class="emoji">🎉</span>';
        resultHTML += `You won <strong>${aceGame.wagerOne} credits</strong> from your first wager`;
        if (aceGame.wagerTwo > 0) {
            player.credits += aceGame.wagerTwo;
            resultHTML += ` and an additional <strong>${aceGame.wagerTwo} credits</strong> from your second wager!`;
        }
        resultHTML += '!';
        showNotification(`🎰 Won ${aceGame.wagerOne + aceGame.wagerTwo} credits!`, 'win');
    } else {
        player.credits -= aceGame.wagerOne;
        resultHTML += 'lose"><span class="emoji">😞</span>';
        resultHTML += `You lost <strong>${aceGame.wagerOne} credits</strong> from your first wager`;
        if (aceGame.wagerTwo > 0) {
            player.credits -= aceGame.wagerTwo;
            resultHTML += ` and an additional <strong>${aceGame.wagerTwo} credits</strong> from your second wager`;
        }
        resultHTML += '.';
    }
    resultHTML += '</div>';
    
    resultHTML += `
        <div class="action-buttons mt-4">
            <button onclick="findAceGame()" class="btn-primary">Play Again</button>
            <button onclick="backToMenu()" class="btn-secondary">Back to Menu</button>
        </div>
    `;

    updateHighscore();
    document.getElementById('aceGameArea').innerHTML = resultHTML;
    savePlayer();
}

// ====================================
// MENU FUNCTIONS
// ====================================
function showHighscore() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <div class="highscore-display">
                <h3>High Score</h3>
                <div class="score">${player.highscore}</div>
                <p>${player.name} currently holds the high score!</p>
                <p class="text-muted" style="margin-top: 16px; font-size: 12px;">
                    Games Played: ${player.gamesPlayed} | Wins: ${player.totalWins}
                </p>
            </div>
            <button onclick="backToMenu()" style="width: 100%; margin-top: 24px;">
                Back to Menu
            </button>
        </section>
    `;
}

function changeName() {
    const newName = prompt('Enter your new name:');
    if (newName && newName.trim()) {
        player.name = newName.trim();
        savePlayer();
        showNotification('Name changed successfully', 'win');
    }
}

function resetAccount() {
    if (confirm('⚠️ Reset your account to 100 credits?\n\nThis will erase your current balance and high score!')) {
        player.credits = 100;
        player.highscore = 100;
        player.gamesPlayed = 0;
        player.totalWins = 0;
        savePlayer();
        showNotification('Account reset to 100 credits', 'info');
    }
}

function quit() {
    if (confirm('Are you sure you want to quit?')) {
        showNotification('Thanks for playing! Your progress has been saved.', 'info');
        setTimeout(() => {
            backToMenu();
        }, 2000);
    }
}

// ====================================
// INITIALIZE ON PAGE LOAD
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentGame) {
            backToMenu();
        }
    });
});

// ====================================
// UTILITY FUNCTIONS
// ====================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Prevent accidental page refresh when playing
window.addEventListener('beforeunload', (e) => {
    if (currentGame) {
        e.preventDefault();
        e.returnValue = '';
    }
});