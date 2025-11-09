// game6.js - Over/Under 7 Game
/* ====================================
   GAME 6: OVER/UNDER 7
   ==================================== */

window.Game6 = {
    overUnder7Game: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                <h3>Over/Under 7</h3>
                <p class="game-description">
                    Two dice will be rolled. Predict whether the total will be <strong>over 7</strong>, 
                    <strong>under 7</strong>, or <strong>exactly 7</strong>. 
                    <br><br>
                    <strong>Payouts:</strong><br>
                    • Over 7 or Under 7: <strong>2x</strong> your wager<br>
                    • Exactly 7: <strong>5x</strong> your wager
                </p>
                <input type="number" id="overUnder7Wager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager" autofocus>
                
                <div class="over-under-buttons">
                    <button onclick="Game6.placeBet('under')" class="bet-option-btn under-btn">
                        <div class="bet-label">UNDER 7</div>
                        <div class="bet-payout">2x payout</div>
                    </button>
                    <button onclick="Game6.placeBet('exactly')" class="bet-option-btn exactly-btn">
                        <div class="bet-label">EXACTLY 7</div>
                        <div class="bet-payout">5x payout</div>
                    </button>
                    <button onclick="Game6.placeBet('over')" class="bet-option-btn over-btn">
                        <div class="bet-label">OVER 7</div>
                        <div class="bet-payout">2x payout</div>
                    </button>
                </div>
                
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="overUnder7Result"></div>
            </section>
        `;
    },

    placeBet: function(betType) {
        const wagerInput = document.getElementById('overUnder7Wager');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.player.gamesPlayed++;
        wagerInput.disabled = true;
        
        const resultDiv = document.getElementById('overUnder7Result');
        resultDiv.innerHTML = '<div class="spinner"></div>';

        // Disable all bet buttons
        const buttons = document.querySelectorAll('.bet-option-btn');
        buttons.forEach(btn => btn.disabled = true);

        setTimeout(() => {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const total = dice1 + dice2;

            let won = false;
            let multiplier = 0;

            if (betType === 'under' && total < 7) {
                won = true;
                multiplier = 2;
            } else if (betType === 'over' && total > 7) {
                won = true;
                multiplier = 2;
            } else if (betType === 'exactly' && total === 7) {
                won = true;
                multiplier = 5;
            }

            let resultHTML = `
                <div style="margin-top: 32px;">
                    <p class="game-description text-center">The dice rolled:</p>
                    <div class="dice-display">
                        <div class="die" style="animation-delay: 0s;">${this.getDieFace(dice1)}</div>
                        <div class="die" style="animation-delay: 0.1s;">${this.getDieFace(dice2)}</div>
                    </div>
                    <p class="game-description text-center" style="font-size: 24px; font-weight: 500; margin: 20px 0;">
                        Total: <strong>${total}</strong>
                    </p>
                </div>
            `;

            resultHTML += '<div class="result-message ';

            if (won) {
                const winAmount = wager * multiplier;
                GameSystem.player.credits += winAmount;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎉</span>';
                resultHTML += `You bet <strong>${betType.toUpperCase()}</strong> and won! You receive <strong>${winAmount} credits</strong> (${multiplier}x your wager)!`;
                GameSystem.showNotification(`🎲 Won ${winAmount} credits!`, 'win');
            } else {
                GameSystem.player.credits -= wager;
                resultHTML += 'lose"><span class="emoji">😔</span>';
                resultHTML += `You bet <strong>${betType.toUpperCase()}</strong> but the total was ${total}. You lost ${wager} credits.`;
            }

            resultHTML += '</div>';
            resultHTML += `
                <div class="action-buttons mt-4">
                    <button onclick="Game6.overUnder7Game()" class="btn-primary">Play Again</button>
                    <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
                </div>
            `;

            resultDiv.innerHTML = resultHTML;
            GameSystem.updateHighscore();
            GameSystem.savePlayer();
        }, 1500);
    },

    getDieFace: function(value) {
        const faces = {
            1: '⚀',
            2: '⚁',
            3: '⚂',
            4: '⚃',
            5: '⚄',
            6: '⚅'
        };
        return faces[value];
    }
};