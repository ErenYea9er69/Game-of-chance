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

let noMatchGameState = {
    userNumbers: [],
    dealerNumbers: [],
    wager: 0
};

// ====================================
// INITIALIZATION
// ====================================
function initPlayer() {
    // Since localStorage is not available, check if player has a name
    if (!player.name) {
        showWelcomeScreen();
    } else {
        showMainGame();
    }
}

function showWelcomeScreen() {
    document.getElementById('welcomeScreen').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('mainMenu').classList.add('hidden');
}

function showMainGame() {
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    updateDisplay();
    animateCredits();
}

function submitName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        showNotification('Please enter your name', 'lose');
        nameInput.focus();
        return;
    }
    
    player.name = name;
    player.credits = 100;
    player.highscore = 100;
    player.uid = Date.now();
    player.gamesPlayed = 0;
    player.totalWins = 0;
    savePlayer();
    showMainGame();
}

function savePlayer() {
    updateDisplay();
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
    
    // Hide menu and show only the game
    document.getElementById('mainMenu').classList.add('hidden');

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
    
    // Scroll to game area
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function backToMenu() {
    document.getElementById('gameArea').innerHTML = '';
    document.getElementById('mainMenu').classList.remove('hidden');
    currentGame = null;
    document.getElementById('mainMenu').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ====================================
// GAME 1: PICK A NUMBER
// ====================================
function pickNumberGame() {
    if (player.credits < 10) {
        showNotification('Insufficient credits! You need at least 10 credits to play.', 'lose');
        backToMenu();
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
        backToMenu();
        return;
    }

    noMatchGameState.userNumbers = [];
    noMatchGameState.dealerNumbers = [];
    noMatchGameState.wager = 0;

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>No Match Dealer</h3>
            <p class="game-description">
                In this game, you can wager up to all of your credits. You will pick 
                <strong>8 numbers between 0 and 99</strong>. The dealer will then deal 
                <strong>8 random numbers</strong>. If there are <strong>no matches</strong> 
                between your numbers and the dealer's numbers, you <strong>double your money</strong>!
            </p>
            <input type="number" id="wagerAmount" min="1" max="${player.credits}" placeholder="Enter your wager">
            <button onclick="startNumberSelection()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                Continue to Number Selection
            </button>
            <button onclick="backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                Back to Menu
            </button>
            <div id="noMatchResult"></div>
        </section>
    `;
}

function startNumberSelection() {
    const wagerInput = document.getElementById('wagerAmount');
    const wager = parseInt(wagerInput.value);
    
    if (!wager || wager < 1 || wager > player.credits) {
        showNotification('Please enter a valid wager amount', 'lose');
        wagerInput.focus();
        return;
    }

    noMatchGameState.wager = wager;
    noMatchGameState.userNumbers = [];

    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>No Match Dealer - Select Your Numbers</h3>
            <p class="game-description">
                Wager: <strong>${wager} credits</strong><br>
                Select 8 numbers between 0 and 99. Numbers selected: <strong id="numberCount">0/8</strong>
            </p>
            <div id="selectedNumbers" class="selected-numbers-display"></div>
            <input type="number" id="numberInput" min="0" max="99" placeholder="Enter a number (0-99)" autofocus>
            <div class="action-buttons">
                <button onclick="addUserNumber()" class="btn-primary">Add Number</button>
                <button onclick="clearUserNumbers()" class="btn-secondary">Clear All</button>
            </div>
            <button onclick="dealDealerCards()" id="dealBtn" class="btn-primary" style="width: 100%; margin-top: 16px;" disabled>
                Deal Dealer Cards
            </button>
            <div id="noMatchResult"></div>
        </section>
    `;
    
    updateSelectedNumbersDisplay();
}

function addUserNumber() {
    const numberInput = document.getElementById('numberInput');
    const number = parseInt(numberInput.value);
    
    if (isNaN(number) || number < 0 || number > 99) {
        showNotification('Please enter a valid number between 0 and 99', 'lose');
        numberInput.focus();
        return;
    }

    if (noMatchGameState.userNumbers.includes(number)) {
        showNotification('You already selected this number!', 'lose');
        numberInput.value = '';
        numberInput.focus();
        return;
    }

    if (noMatchGameState.userNumbers.length >= 8) {
        showNotification('You already selected 8 numbers!', 'lose');
        return;
    }

    noMatchGameState.userNumbers.push(number);
    numberInput.value = '';
    numberInput.focus();
    
    updateSelectedNumbersDisplay();
    
    if (noMatchGameState.userNumbers.length === 8) {
        document.getElementById('dealBtn').disabled = false;
        showNotification('All 8 numbers selected! Click "Deal Dealer Cards" to continue.', 'info');
    }
}

function clearUserNumbers() {
    noMatchGameState.userNumbers = [];
    updateSelectedNumbersDisplay();
    document.getElementById('dealBtn').disabled = true;
    document.getElementById('numberInput').focus();
}

function updateSelectedNumbersDisplay() {
    const display = document.getElementById('selectedNumbers');
    const count = document.getElementById('numberCount');
    
    count.textContent = `${noMatchGameState.userNumbers.length}/8`;
    
    if (noMatchGameState.userNumbers.length === 0) {
        display.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">No numbers selected yet</p>';
    } else {
        let html = '<div class="numbers-grid">';
        noMatchGameState.userNumbers.forEach((num, index) => {
            html += `<div class="number-cell user-number" style="--i: ${index}">${num}</div>`;
        });
        html += '</div>';
        display.innerHTML = html;
    }
}

function dealDealerCards() {
    player.gamesPlayed++;
    
    const resultDiv = document.getElementById('noMatchResult');
    resultDiv.innerHTML = '<div class="spinner"></div>';
    
    document.getElementById('dealBtn').disabled = true;
    
    setTimeout(() => {
        // Generate 8 random numbers for dealer
        noMatchGameState.dealerNumbers = [];
        for (let i = 0; i < 8; i++) {
            noMatchGameState.dealerNumbers.push(Math.floor(Math.random() * 100));
        }

        // Check for matches
        const matches = [];
        for (let userNum of noMatchGameState.userNumbers) {
            if (noMatchGameState.dealerNumbers.includes(userNum)) {
                matches.push(userNum);
            }
        }

        // Display both sets of numbers
        let gridHTML = '<h4 style="margin-top: 24px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Numbers</h4>';
        gridHTML += '<div class="numbers-grid">';
        noMatchGameState.userNumbers.forEach((num, index) => {
            const isMatch = matches.includes(num) ? ' match' : '';
            gridHTML += `<div class="number-cell user-number${isMatch}" style="--i: ${index}">${num}</div>`;
        });
        gridHTML += '</div>';

        gridHTML += '<h4 style="margin-top: 24px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Dealer\'s Numbers</h4>';
        gridHTML += '<div class="numbers-grid">';
        noMatchGameState.dealerNumbers.forEach((num, index) => {
            const isMatch = matches.includes(num) ? ' match' : '';
            gridHTML += `<div class="number-cell dealer-number${isMatch}" style="--i: ${index + 8}">${num}</div>`;
        });
        gridHTML += '</div>';

        let resultHTML = '<div class="result-message ';
        if (matches.length > 0) {
            player.credits -= noMatchGameState.wager;
            resultHTML += 'lose"><span class="emoji">💔</span>';
            resultHTML += `The dealer matched ${matches.length} number(s): <strong>${matches.join(', ')}</strong>! You lose ${noMatchGameState.wager} credits.`;
        } else {
            player.credits += noMatchGameState.wager;
            player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎊</span>';
            resultHTML += `There were no matches! You win <strong>${noMatchGameState.wager} credits</strong>!`;
            showNotification(`💸 Won ${noMatchGameState.wager} credits!`, 'win');
        }
        resultHTML += '</div>';
        
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="startGame('noMatch')" class="btn-primary">Play Again</button>
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
        backToMenu();
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
    if (aceGame.pick !== -1) return;
    
    aceGame.pick = index;
    
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
    
    const gameArea = document.getElementById('aceGameArea');
    gameArea.innerHTML = `
        <p class="game-description text-center" style="margin-top: 24px;">
            Enter additional wager amount (max ${maxAdditional}):
        </p>
        <input type="number" id="additionalWager" min="1" max="${maxAdditional}" placeholder="Additional wager" autofocus>
        <div class="action-buttons" style="margin-top: 16px;">
            <button onclick="confirmAdditionalWager()" class="btn-primary">Confirm Wager</button>
            <button onclick="revealResult()" class="btn-secondary">Skip & Reveal</button>
        </div>
    `;
}

function confirmAdditionalWager() {
    const wagerInput = document.getElementById('additionalWager');
    const wagerTwo = parseInt(wagerInput.value);
    const maxAdditional = player.credits - aceGame.wagerOne;
    
    if (wagerTwo && wagerTwo > 0 && wagerTwo <= maxAdditional) {
        aceGame.wagerTwo = wagerTwo;
        showNotification(`Added ${wagerTwo} credits to wager`, 'info');
        setTimeout(revealResult, 500);
    } else {
        showNotification('Invalid wager amount', 'lose');
        wagerInput.focus();
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
    currentGame = 'highscore';
    document.getElementById('mainMenu').classList.add('hidden');
    
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
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changeName() {
    currentGame = 'changeName';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Change Name</h3>
            <p class="game-description">Enter your new name below:</p>
            <input type="text" id="newNameInput" placeholder="Enter new name" value="${player.name}" autofocus>
            <div class="action-buttons">
                <button onclick="confirmNameChange()" class="btn-primary">Confirm Change</button>
                <button onclick="backToMenu()" class="btn-secondary">Cancel</button>
            </div>
        </section>
    `;
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmNameChange() {
    const newNameInput = document.getElementById('newNameInput');
    const newName = newNameInput.value.trim();
    
    if (!newName) {
        showNotification('Please enter a valid name', 'lose');
        newNameInput.focus();
        return;
    }
    
    player.name = newName;
    savePlayer();
    showNotification('Name changed successfully', 'win');
    backToMenu();
}

function resetAccount() {
    currentGame = 'reset';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Reset Account</h3>
            <p class="game-description">
                ⚠️ Are you sure you want to reset your account to 100 credits?
            </p>
            <p class="game-description" style="color: var(--text-muted);">
                This will erase your current balance of <strong>${player.credits} credits</strong> 
                and your high score of <strong>${player.highscore} credits</strong>.
            </p>
            <div class="action-buttons">
                <button onclick="confirmReset()" class="btn-primary">Yes, Reset Account</button>
                <button onclick="backToMenu()" class="btn-secondary">Cancel</button>
            </div>
        </section>
    `;
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmReset() {
    player.credits = 100;
    player.highscore = 100;
    player.gamesPlayed = 0;
    player.totalWins = 0;
    savePlayer();
    showNotification('Account reset to 100 credits', 'info');
    backToMenu();
}

function quit() {
    currentGame = 'quit';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Quit Game</h3>
            <p class="game-description">
                Are you sure you want to quit? Your progress will be lost when you refresh the page.
            </p>
            <p class="game-description" style="margin-top: 16px;">
                Current Balance: <strong>${player.credits} credits</strong><br>
                High Score: <strong>${player.highscore} credits</strong>
            </p>
            <div class="action-buttons">
                <button onclick="backToMenu()" class="btn-primary">Continue Playing</button>
                <button onclick="confirmQuit()" class="btn-secondary">Quit</button>
            </div>
        </section>
    `;
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmQuit() {
    showNotification('Thanks for playing!', 'info');
    setTimeout(() => {
        backToMenu();
    }, 2000);
}

// ====================================
// INITIALIZE ON PAGE LOAD
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentGame) {
            backToMenu();
        }
        
        // Enter key on welcome screen
        if (e.key === 'Enter' && !document.getElementById('welcomeScreen').classList.contains('hidden')) {
            submitName();
        }
        
        // Enter key on number input in No Match game
        if (e.key === 'Enter' && document.getElementById('numberInput')) {
            addUserNumber();
        }
    });
});

// Prevent accidental page refresh when playing
window.addEventListener('beforeunload', (e) => {
    if (currentGame) {
        e.preventDefault();
        e.returnValue = '';
    }
});