// game7.js - Chuck-a-Luck Game
/* ====================================
   GAME 7: CHUCK-A-LUCK
   ==================================== */

window.Game7 = {
    chuckALuckGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                <h3>Chuck-a-Luck</h3>
                <p class="game-description">
                    Select a number from <strong>1 to 6</strong>, place your wager, and roll three dice. 
                    The more dice that match your number, the bigger your win!
                    <br><br>
                    <strong>Payouts:</strong><br>
                    • 1 match: <strong>1x</strong> your wager (get wager back + 1x)<br>
                    • 2 matches: <strong>2x</strong> your wager (get wager back + 2x)<br>
                    • 3 matches: <strong>10x</strong> your wager (get wager back + 10x)<br>
                    • 0 matches: Lose your wager
                </p>
                <input type="number" id="chuckWager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager" autofocus>
                
                <p class="game-description text-center" style="margin-top: 24px;">Select Your Number:</p>
                <div class="chuck-number-selector">
                    ${[1, 2, 3, 4, 5, 6].map(num => `
                        <button onclick="Game7.selectNumber(${num})" class="chuck-number-btn" data-number="${num}">
                            ${this.getDieFace(num)}
                        </button>
                    `).join('')}
                </div>
                
                <button onclick="Game7.rollDice()" id="chuckRollBtn" class="btn-primary" style="width: 100%; margin-top: 16px;" disabled>
                    Roll the Dice
                </button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="chuckResult"></div>
            </section>
        `;
        
        GameSystem.chuckALuckState = {
            selectedNumber: null,
            wager: 0
        };
    },

    selectNumber: function(number) {
        GameSystem.chuckALuckState.selectedNumber = number;
        
        // Update button states
        const buttons = document.querySelectorAll('.chuck-number-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.number) === number) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        
        document.getElementById('chuckRollBtn').disabled = false;
        GameSystem.showNotification(`Selected: ${number}`, 'info');
    },

    rollDice: function() {
        const wagerInput = document.getElementById('chuckWager');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        if (!GameSystem.chuckALuckState.selectedNumber) {
            GameSystem.showNotification('Please select a number first', 'lose');
            return;
        }

        GameSystem.chuckALuckState.wager = wager;
        GameSystem.player.gamesPlayed++;
        
        wagerInput.disabled = true;
        document.getElementById('chuckRollBtn').disabled = true;
        
        const buttons = document.querySelectorAll('.chuck-number-btn');
        buttons.forEach(btn => btn.disabled = true);

        const resultDiv = document.getElementById('chuckResult');
        resultDiv.innerHTML = '<div class="spinner"></div>';

        setTimeout(() => {
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            const dice3 = Math.floor(Math.random() * 6) + 1;
            
            const diceArray = [dice1, dice2, dice3];
            const matches = diceArray.filter(d => d === GameSystem.chuckALuckState.selectedNumber).length;

            let resultHTML = `
                <div style="margin-top: 32px;">
                    <p class="game-description text-center">You selected: <strong>${GameSystem.chuckALuckState.selectedNumber}</strong></p>
                    <p class="game-description text-center">The dice rolled:</p>
                    <div class="dice-display">
                        ${diceArray.map((die, index) => `
                            <div class="die ${die === GameSystem.chuckALuckState.selectedNumber ? 'match' : ''}" 
                                 style="animation-delay: ${index * 0.1}s;">
                                ${this.getDieFace(die)}
                            </div>
                        `).join('')}
                    </div>
                    <p class="game-description text-center" style="font-size: 18px; font-weight: 500; margin: 20px 0;">
                        Matches: <strong>${matches}</strong>
                    </p>
                </div>
            `;

            resultHTML += '<div class="result-message ';

            if (matches === 0) {
                GameSystem.player.credits -= wager;
                resultHTML += 'lose"><span class="emoji">😞</span>';
                resultHTML += `No matches! You lost ${wager} credits.`;
            } else {
                let multiplier = 0;
                if (matches === 1) multiplier = 1;
                else if (matches === 2) multiplier = 2;
                else if (matches === 3) multiplier = 10;
                
                const winAmount = wager * multiplier;
                GameSystem.player.credits += winAmount;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎊</span>';
                
                if (matches === 3) {
                    resultHTML += `<strong>TRIPLE MATCH!</strong> All three dice matched! You won <strong>${winAmount} credits</strong> (${multiplier}x)!`;
                    GameSystem.showNotification(`🎲 TRIPLE! Won ${winAmount} credits!`, 'win');
                } else {
                    resultHTML += `${matches} dice matched! You won <strong>${winAmount} credits</strong> (${multiplier}x your wager)!`;
                    GameSystem.showNotification(`🎲 Won ${winAmount} credits!`, 'win');
                }
            }

            resultHTML += '</div>';
            resultHTML += `
                <div class="action-buttons mt-4">
                    <button onclick="Game7.chuckALuckGame()" class="btn-primary">Play Again</button>
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