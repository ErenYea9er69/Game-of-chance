// script.js - Main game system and shared functionality
/* ====================================
   GAME OF CHANCE - CORE SYSTEM
   ==================================== */

// Global game system object
window.GameSystem = {
    // Player data
    player: {
        name: '',
        credits: 100,
        highscore: 100,
        uid: Date.now(),
        gamesPlayed: 0,
        totalWins: 0
    },
    
    // Game states
    currentGame: null,
    aceGame: {
        ace: 0,
        pick: -1,
        wagerOne: 0,
        wagerTwo: 0,
        revealed: -1
    },
    noMatchGameState: {
        userNumbers: [],
        dealerNumbers: [],
        wager: 0
    },
    luckyWheelState: {
        wager: 0,
        spinning: false,
        rotation: 0
    },
    highLowState: {
        wager: 0,
        currentCard: 0,
        nextCard: 0,
        streak: 0,
        maxStreak: 5,
        playing: false
    },
    
    // Core UI functions
    updateDisplay: function() {
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('playerCredits').textContent = this.player.credits;
        document.getElementById('playerHighscore').textContent = this.player.highscore;
    },
    
    animateCredits: function() {
        const creditsEl = document.getElementById('playerCredits');
        creditsEl.style.animation = 'none';
        setTimeout(() => {
            creditsEl.style.animation = 'fadeIn 0.3s ease';
        }, 10);
    },
    
    updateHighscore: function() {
        if (this.player.credits > this.player.highscore) {
            this.player.highscore = this.player.credits;
            this.showNotification('🎉 New High Score!');
        }
    },
    
    showNotification: function(message, type = 'info') {
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
    },
    
    savePlayer: function() {
        this.updateDisplay();
    },
    
    backToMenu: function() {
        document.getElementById('gameArea').innerHTML = '';
        document.getElementById('mainMenu').classList.remove('hidden');
        this.currentGame = null;
        document.getElementById('mainMenu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

// ====================================
// MENU MANAGEMENT
// ====================================
function startGame(gameType) {
    GameSystem.currentGame = gameType;
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    
    document.getElementById('mainMenu').classList.add('hidden');

    switch(gameType) {
        case 'pickNumber':
            window.Game1.pickNumberGame();
            break;
        case 'noMatch':
            window.Game2.noMatchGame();
            break;
        case 'findAce':
            window.Game3.findAceGame();
            break;
        case 'luckyWheel':
            window.Game4.luckyWheelGame();
            break;
        case 'highLow':
            window.Game5.highLowGame();
            break;
    }
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showHighscore() {
    GameSystem.currentGame = 'highscore';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <div class="highscore-display">
                <h3>High Score</h3>
                <div class="score">${GameSystem.player.highscore}</div>
                <p>${GameSystem.player.name} currently holds the high score!</p>
                <p class="text-muted" style="margin-top: 16px; font-size: 12px;">
                    Games Played: ${GameSystem.player.gamesPlayed} | Wins: ${GameSystem.player.totalWins}
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
    GameSystem.currentGame = 'changeName';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Change Name</h3>
            <p class="game-description">Enter your new name below:</p>
            <input type="text" id="newNameInput" placeholder="Enter new name" value="${GameSystem.player.name}" autofocus>
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
        GameSystem.showNotification('Please enter a valid name', 'lose');
        newNameInput.focus();
        return;
    }
    
    GameSystem.player.name = newName;
    GameSystem.savePlayer();
    GameSystem.showNotification('Name changed successfully', 'win');
    GameSystem.backToMenu();
}

function resetAccount() {
    GameSystem.currentGame = 'reset';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Reset Account</h3>
            <p class="game-description">
                ⚠️ Are you sure you want to reset your account to 100 credits?
            </p>
            <p class="game-description" style="color: var(--text-muted);">
                This will erase your current balance of <strong>${GameSystem.player.credits} credits</strong> 
                and your high score of <strong>${GameSystem.player.highscore} credits</strong>.
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
    GameSystem.player.credits = 100;
    GameSystem.player.highscore = 100;
    GameSystem.player.gamesPlayed = 0;
    GameSystem.player.totalWins = 0;
    GameSystem.savePlayer();
    GameSystem.showNotification('Account reset to 100 credits', 'info');
    GameSystem.backToMenu();
}

function quit() {
    GameSystem.currentGame = 'quit';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>Quit Game</h3>
            <p class="game-description">
                Are you sure you want to quit? Your progress will be lost when you refresh the page.
            </p>
            <p class="game-description" style="margin-top: 16px;">
                Current Balance: <strong>${GameSystem.player.credits} credits</strong><br>
                High Score: <strong>${GameSystem.player.highscore} credits</strong>
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
    GameSystem.showNotification('Thanks for playing!', 'info');
    setTimeout(() => {
        GameSystem.backToMenu();
    }, 2000);
}

// ====================================
// INITIALIZATION
// ====================================
function initPlayer() {
    if (!GameSystem.player.name) {
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
    GameSystem.updateDisplay();
    GameSystem.animateCredits();
}

function submitName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        GameSystem.showNotification('Please enter your name', 'lose');
        nameInput.focus();
        return;
    }
    
    GameSystem.player.name = name;
    GameSystem.player.credits = 100;
    GameSystem.player.highscore = 100;
    GameSystem.player.uid = Date.now();
    GameSystem.player.gamesPlayed = 0;
    GameSystem.player.totalWins = 0;
    GameSystem.savePlayer();
    showMainGame();
}

// ====================================
// PAGE LOAD INITIALIZATION
// ====================================
document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && GameSystem.currentGame) {
            GameSystem.backToMenu();
        }
        
        if (e.key === 'Enter' && !document.getElementById('welcomeScreen').classList.contains('hidden')) {
            submitName();
        }
        
        if (e.key === 'Enter' && document.getElementById('numberInput')) {
            window.Game2.addUserNumber();
        }
    });
});

window.addEventListener('beforeunload', (e) => {
    if (GameSystem.currentGame) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Make functions available globally for HTML onclick handlers
window.startGame = startGame;
window.backToMenu = () => GameSystem.backToMenu();
window.showHighscore = showHighscore;
window.changeName = changeName;
window.resetAccount = resetAccount;
window.quit = quit;
window.submitName = submitName;