// script.js - Main game system and shared functionality
/* ====================================
   GAME OF CHANCE - CORE SYSTEM
   ==================================== */

// API Configuration - Works both locally and on Vercel
const API_BASE_URL = window.location.hostname.includes('vercel.app') 
  ? '/api'
  : 'http://localhost:3000/api';

const LEADERBOARD_ENABLED = true;

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
    isRandomGame: false,
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
    chuckALuckState: {
        selectedNumber: null,
        wager: 0
    },
    
    // Core UI functions
    updateDisplay: function() {
        document.getElementById('playerName').textContent = this.player.name;
        document.getElementById('playerCredits').textContent = this.player.credits;
        this.loadMiniLeaderboard();
    },
    
    animateCredits: function() {
        const creditsEl = document.getElementById('playerCredits');
        creditsEl.style.animation = 'none';
        setTimeout(() => {
            creditsEl.style.animation = 'fadeIn 0.3s ease';
        }, 10);
    },
    
    updateHighscore: function() {
        // Update local highscore if current credits exceed it
        if (this.player.credits > this.player.highscore) {
            this.player.highscore = this.player.credits;
            this.showNotification('🎉 New High Score!');
        }
        
        // Submit current credits to leaderboard (not just highscore)
        if (LEADERBOARD_ENABLED) {
            this.submitToLeaderboard();
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
        // Save player data to localStorage
        try {
            localStorage.setItem('gameOfChance_player', JSON.stringify(this.player));
        } catch (e) {
            console.error('Error saving player data:', e);
        }
        this.updateDisplay();
    },
    
    loadPlayer: function() {
        // Load player data from localStorage
        try {
            const savedData = localStorage.getItem('gameOfChance_player');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.player = {
                    ...this.player,
                    ...parsedData
                };
                return true;
            }
        } catch (e) {
            console.error('Error loading player data:', e);
        }
        return false;
    },
    
    backToMenu: function() {
        if (this.isRandomGame && this.currentGame) {
            // Deduct 50% of credits for quitting random game
            const penalty = Math.floor(this.player.credits * 0.5);
            this.player.credits -= penalty;
            this.showNotification(`-${penalty} credits for quitting random game`, 'lose');
            this.savePlayer();
        }
        
        document.getElementById('gameArea').innerHTML = '';
        document.getElementById('mainMenu').classList.remove('hidden');
        this.currentGame = null;
        this.isRandomGame = false;
        document.getElementById('mainMenu').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    
    // Leaderboard functions
    async submitToLeaderboard() {
        if (!LEADERBOARD_ENABLED) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: this.player.name,
                    highscore: this.player.credits, // Submit current credits instead of highscore
                    games_played: this.player.gamesPlayed,
                    total_wins: this.player.totalWins
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Leaderboard updated:', result);
            return result;
        } catch (error) {
            console.warn('❌ Failed to submit to leaderboard:', error.message);
            // Silent failure - don't show user
            return null;
        }
    },
    
    async fetchLeaderboard(limit = 10) {
        if (!LEADERBOARD_ENABLED) return [];
        
        try {
            // Add cache-busting parameter
            const url = `${API_BASE_URL}/leaderboard?limit=${limit}&t=${Date.now()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || `HTTP error! status: ${response.status}`);
            }
            
            const leaderboard = await response.json();
            return leaderboard;
        } catch (error) {
            console.warn('❌ Failed to fetch leaderboard:', error.message);
            return null;
        }
    },

    // Mini leaderboard functions
    async loadMiniLeaderboard() {
        if (!LEADERBOARD_ENABLED) return;
        
        const miniLeaderboard = document.getElementById('miniLeaderboard');
        
        try {
            const leaderboard = await this.fetchLeaderboard(3);
            
            if (!leaderboard || leaderboard.length === 0) {
                miniLeaderboard.innerHTML = '<div class="leaderboard-placeholder">No scores yet</div>';
                return;
            }
            
            let html = '';
            leaderboard.forEach((player, index) => {
                const isCurrentPlayer = player.player_name === this.player.name;
                const rank = index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
                
                html += `
                    <div class="mini-leaderboard-entry">
                        <div class="mini-rank">${medal}</div>
                        <div class="mini-name">
                            ${player.player_name}
                            ${isCurrentPlayer ? '<span class="mini-you-badge">YOU</span>' : ''}
                        </div>
                        <div class="mini-score">${player.highscore.toLocaleString()}</div>
                    </div>
                `;
            });
            
            miniLeaderboard.innerHTML = html;
        } catch (error) {
            miniLeaderboard.innerHTML = '<div class="leaderboard-placeholder">Loading...</div>';
        }
    }
};

// ====================================
// RANDOM GAME FUNCTIONALITY
// ====================================
function startRandomGame() {
    const games = ['pickNumber', 'noMatch', 'findAce', 'luckyWheel', 'highLow', 'overUnder7', 'chuckALuck', 'blackjack'];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    
    GameSystem.isRandomGame = true;
    GameSystem.showNotification('🎲 Random Game Mode Active! Quit = -50% credits, Win = 2x prize', 'info');
    
    setTimeout(() => {
        startGame(randomGame);
    }, 500);
}

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
        case 'overUnder7':
            window.Game6.overUnder7Game();
            break;
        case 'chuckALuck':
            window.Game7.chuckALuckGame();
            break;
        case 'blackjack':
            window.Game8.blackjackGame();
            break;
    }
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function showLeaderboard() {
    GameSystem.currentGame = 'leaderboard';
    document.getElementById('mainMenu').classList.add('hidden');
    
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
        <section class="game-container glass-card">
            <h3>🏆 Global Leaderboard</h3>
            <div id="leaderboardContent">
                <div class="spinner"></div>
                <p class="text-center text-muted">Loading leaderboard...</p>
            </div>
            <button onclick="backToMenu()" style="width: 100%; margin-top: 24px;">
                Back to Menu
            </button>
        </section>
    `;
    
    gameArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Fetch leaderboard data
    const leaderboard = await GameSystem.fetchLeaderboard(10);
    
    const contentDiv = document.getElementById('leaderboardContent');
    
    if (!leaderboard) {
        contentDiv.innerHTML = `
            <div class="result-message info">
                <span class="emoji">⚠️</span>
                <strong>Connection Error</strong><br>
                Could not connect to leaderboard. Please check your internet connection.
            </div>
        `;
        return;
    }
    
    if (leaderboard.length === 0) {
        contentDiv.innerHTML = `
            <p class="text-center text-muted" style="margin-top: 32px;">
                No scores yet. Be the first to climb the leaderboard!
            </p>
        `;
        return;
    }
    
    // Generate leaderboard HTML
    let html = '<div class="leaderboard-container">';
    
    leaderboard.forEach((player, index) => {
        const isCurrentPlayer = player.player_name === GameSystem.player.name;
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        
        html += `
            <div class="leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''}">
                <div class="rank">${medal}</div>
                <div class="player-info">
                    <div class="player-name">
                        ${player.player_name}
                        ${isCurrentPlayer ? '<span class="you-badge">(YOU)</span>' : ''}
                    </div>
                    <div class="player-stats">
                        ${player.highscore.toLocaleString()} credits • ${player.total_wins} wins • ${player.games_played} games
                    </div>
                </div>
                <div class="score">${player.highscore.toLocaleString()}</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Add current player's rank if not in top 10
    const currentPlayerEntry = leaderboard.find(p => p.player_name === GameSystem.player.name);
    if (!currentPlayerEntry && GameSystem.player.highscore > 0) {
        html += `
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border-subtle);">
                <div class="leaderboard-entry current-player">
                    <div class="rank">?</div>
                    <div class="player-info">
                        <div class="player-name">
                            ${GameSystem.player.name}
                            <span class="you-badge">(YOU)</span>
                        </div>
                        <div class="player-stats">
                            Not in top 10 • ${GameSystem.player.highscore} credits
                        </div>
                    </div>
                    <div class="score">${GameSystem.player.highscore.toLocaleString()}</div>
                </div>
            </div>
        `;
    }
    
    contentDiv.innerHTML = html;
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
    // Submit final score before reset
    if (LEADERBOARD_ENABLED && GameSystem.player.highscore > 100) {
        GameSystem.submitToLeaderboard();
    }
    
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
                Are you sure you want to quit? Your progress is automatically saved and will be here when you return.
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
    // Submit score on quit
    if (LEADERBOARD_ENABLED && GameSystem.player.highscore > 100) {
        GameSystem.submitToLeaderboard();
    }
    
    GameSystem.showNotification('Thanks for playing! Your progress has been saved.', 'info');
    setTimeout(() => {
        GameSystem.backToMenu();
    }, 2000);
}

// ====================================
// INITIALIZATION
// ====================================
function initPlayer() {
    const hasExistingPlayer = GameSystem.loadPlayer();
    
    if (hasExistingPlayer && GameSystem.player.name) {
        showMainGame();
    } else {
        showWelcomeScreen();
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
    GameSystem.savePlayer();
});



// Global function exports
window.startGame = startGame;
window.startRandomGame = startRandomGame;
window.backToMenu = () => GameSystem.backToMenu();
window.showLeaderboard = showLeaderboard;
window.changeName = changeName;
window.resetAccount = resetAccount;
window.quit = quit;
window.submitName = submitName;
window.confirmNameChange = confirmNameChange;
window.confirmReset = confirmReset;
window.confirmQuit = confirmQuit;