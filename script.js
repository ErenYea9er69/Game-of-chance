// Replace the startGame function in script.js with this updated version:

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

// Also update the startRandomGame function to include blackjack:

function startRandomGame() {
    const games = ['pickNumber', 'noMatch', 'findAce', 'luckyWheel', 'highLow', 'overUnder7', 'chuckALuck', 'blackjack'];
    const randomGame = games[Math.floor(Math.random() * games.length)];
    
    GameSystem.isRandomGame = true;
    GameSystem.showNotification('🎲 Random Game Mode Active! Quit = -50% credits, Win = 2x prize', 'info');
    
    setTimeout(() => {
        startGame(randomGame);
    }, 500);
}