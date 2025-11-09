// game1.js - Pick a Number Game
/* ====================================
   GAME 1: PICK A NUMBER
   ==================================== */

window.Game1 = {
    pickNumberGame: function() {
        if (GameSystem.player.credits < 10) {
            GameSystem.showNotification('Insufficient credits! You need at least 10 credits to play.', 'lose');
            GameSystem.backToMenu();
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
                    <button onclick="Game1.playPickNumber()" class="btn-primary">Place Bet & Play</button>
                    <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
                </div>
                <div id="pickResult"></div>
            </section>
        `;
    },

    playPickNumber: function() {
        const pickInput = document.getElementById('userPick');
        const pick = parseInt(pickInput.value);
        
        if (!pick || pick < 1 || pick > 20) {
            GameSystem.showNotification('Please enter a valid number between 1 and 20', 'lose');
            pickInput.focus();
            return;
        }

        GameSystem.player.credits -= 10;
        GameSystem.player.gamesPlayed++;
        
        const winning = Math.floor(Math.random() * 20) + 1;
        const resultDiv = document.getElementById('pickResult');
        
        pickInput.disabled = true;
        resultDiv.innerHTML = '<div class="spinner"></div>';
        
        setTimeout(() => {
            let resultHTML = '<div class="result-message ';
            
            if (pick === winning) {
                GameSystem.player.credits += 100;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎉</span>';
                resultHTML += `<strong>JACKPOT!</strong> The winning number was ${winning}. You won 100 credits!`;
                GameSystem.showNotification('💰 JACKPOT! +100 credits', 'win');
            } else {
                resultHTML += 'lose"><span class="emoji">😔</span>';
                resultHTML += `The winning number was ${winning}. You picked ${pick}. Better luck next time!`;
            }
            resultHTML += '</div>';
            
            resultHTML += `
                <div class="action-buttons mt-4">
                    <button onclick="Game1.pickNumberGame()" class="btn-primary">Play Again</button>
                    <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
                </div>
            `;
            
            resultDiv.innerHTML = resultHTML;
            GameSystem.updateHighscore();
            GameSystem.savePlayer();
        }, 1500);
    }
};