// game5.js - High-Low Cards Game
/* ====================================
   GAME 5: HIGH-LOW CARDS
   ==================================== */

window.Game5 = {
    highLowGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        GameSystem.highLowState = {
            wager: 0,
            currentCard: 0,
            nextCard: 0,
            streak: 0,
            maxStreak: 5,
            playing: false
        };

        const gameArea = document.getElementById('gameArea');
        const randomGameBadge = GameSystem.isRandomGame ? '<div class="random-game-badge">🎲 RANDOM GAME MODE</div>' : '';
        
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                ${randomGameBadge}
                <h3>High-Low Cards</h3>
                <p class="game-description">
                    Predict whether the next card will be <strong>higher or lower</strong> than the current card.
                    Build a streak to increase your multiplier: <strong>1x → 1.5x → 2x → 3x → 5x → 10x</strong>!
                    But beware: one wrong guess and you <strong>lose everything</strong>. Cash out anytime to keep your winnings.
                    Cards range from <strong>1 (Ace) to 13 (King)</strong>.
                    ${GameSystem.isRandomGame ? '<br><strong>(Cash outs will be doubled with 2x Random Game Bonus!)</strong>' : ''}
                </p>
                <input type="number" id="highLowWager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager" autofocus>
                <button onclick="Game5.startHighLow()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                    Start Game
                </button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="highLowGame"></div>
            </section>
        `;
    },

    startHighLow: function() {
        const wagerInput = document.getElementById('highLowWager');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.highLowState.wager = wager;
        GameSystem.highLowState.currentCard = Math.floor(Math.random() * 13) + 1;
        GameSystem.highLowState.streak = 0;
        GameSystem.highLowState.playing = true;
        GameSystem.player.gamesPlayed++;
        
        wagerInput.disabled = true;
        
        this.displayHighLowRound();
    },

    displayHighLowRound: function() {
        const multipliers = [1, 1.5, 2, 3, 5, 10];
        const currentMultiplier = multipliers[GameSystem.highLowState.streak];
        const basePotentialWin = Math.floor(GameSystem.highLowState.wager * currentMultiplier);
        const potentialWin = GameSystem.isRandomGame ? basePotentialWin * 2 : basePotentialWin;
        
        const gameDiv = document.getElementById('highLowGame');
        
        let gridHTML = '<div class="highlow-progress">';
        
        multipliers.forEach((mult, i) => {
            const isReached = i < GameSystem.highLowState.streak;
            const isCurrent = i === GameSystem.highLowState.streak;
            const canClick = isCurrent && GameSystem.highLowState.streak > 0;
            
            gridHTML += `
                <div class="multiplier-bar">
                    <button class="multiplier-button ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}" 
                            ${!canClick ? 'disabled' : ''}
                            onclick="Game5.cashOut()"
                            title="${canClick ? 'Click to cash out at this multiplier' : 'Reach this streak level to enable cash out'}">
                        ${mult}x
                    </button>
                </div>
            `;
        });
        
        gridHTML += '</div>';
        
        gameDiv.innerHTML = `
            <div style="margin-top: 32px;">
                <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 24px; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">
                    <div>Streak: <strong style="color: var(--text-primary); font-size: 16px;">${GameSystem.highLowState.streak}/${GameSystem.highLowState.maxStreak}</strong></div>
                    <div>Multiplier: <strong style="color: var(--text-primary); font-size: 16px;">${currentMultiplier}x${GameSystem.isRandomGame ? ' (2x bonus)' : ''}</strong></div>
                    <div>Potential Win: <strong style="color: var(--text-primary); font-size: 16px;">${potentialWin}</strong></div>
                </div>
                
                ${gridHTML}
                
                <p class="game-description text-center">Current Card:</p>
                <div class="cards-display">
                    <div class="card revealed" style="font-size: 36px; cursor: default;">${this.getCardDisplay(GameSystem.highLowState.currentCard)}</div>
                </div>
                
                <p class="game-description text-center" style="margin-top: 24px;">Will the next card be:</p>
                <div class="action-buttons">
                    <button onclick="Game5.makeGuess('higher')" class="btn-primary" ${GameSystem.highLowState.currentCard === 13 ? 'disabled' : ''}>Higher</button>
                    <button onclick="Game5.makeGuess('lower')" class="btn-primary" ${GameSystem.highLowState.currentCard === 1 ? 'disabled' : ''}>Lower</button>
                </div>
                
                ${GameSystem.highLowState.streak > 0 ? `
                    <button onclick="Game5.cashOut()" class="btn-secondary" style="width: 100%; margin-top: 16px;">
                        Cash Out (${potentialWin} credits)
                    </button>
                ` : ''}
            </div>
        `;
    },

    getCardDisplay: function(cardValue) {
        const cards = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return cards[cardValue];
    },

    makeGuess: function(guess) {
        if (!GameSystem.highLowState.playing) return;
        
        GameSystem.highLowState.nextCard = Math.floor(Math.random() * 13) + 1;
        
        const gameDiv = document.getElementById('highLowGame');
        gameDiv.innerHTML += '<div class="spinner" style="margin: 20px auto;"></div>';
        
        setTimeout(() => {
            let correct = false;
            
            if (guess === 'higher' && GameSystem.highLowState.nextCard > GameSystem.highLowState.currentCard) {
                correct = true;
            } else if (guess === 'lower' && GameSystem.highLowState.nextCard < GameSystem.highLowState.currentCard) {
                correct = true;
            } else if (GameSystem.highLowState.nextCard === GameSystem.highLowState.currentCard) {
                correct = false;
            }
            
            if (correct) {
                GameSystem.highLowState.streak++;
                GameSystem.showNotification(`Correct! Streak: ${GameSystem.highLowState.streak}`, 'win');
                
                if (GameSystem.highLowState.streak >= GameSystem.highLowState.maxStreak) {
                    setTimeout(() => {
                        const multipliers = [1, 1.5, 2, 3, 5, 10];
                        const baseFinalWin = Math.floor(GameSystem.highLowState.wager * multipliers[GameSystem.highLowState.streak]);
                        const finalWin = GameSystem.isRandomGame ? baseFinalWin * 2 : baseFinalWin;
                        GameSystem.player.credits += finalWin;
                        GameSystem.player.totalWins++;
                        this.showHighLowResult(true, true, finalWin);
                    }, 800);
                } else {
                    GameSystem.highLowState.currentCard = GameSystem.highLowState.nextCard;
                    setTimeout(() => this.displayHighLowRound(), 800);
                }
            } else {
                GameSystem.player.credits -= GameSystem.highLowState.wager;
                this.showHighLowResult(false, false, 0);
            }
        }, 1500);
    },

    cashOut: function() {
        const multipliers = [1, 1.5, 2, 3, 5, 10];
        const baseWinAmount = Math.floor(GameSystem.highLowState.wager * multipliers[GameSystem.highLowState.streak]);
        const winAmount = GameSystem.isRandomGame ? baseWinAmount * 2 : baseWinAmount;
        GameSystem.player.credits += winAmount;
        GameSystem.player.totalWins++;
        this.showHighLowResult(true, false, winAmount);
    },

    showHighLowResult: function(won, maxStreak, amount) {
        GameSystem.highLowState.playing = false;
        
        const gameDiv = document.getElementById('highLowGame');
        let resultHTML = '';
        
        if (!won) {
            resultHTML += `
                <p class="game-description text-center" style="margin-top: 24px;">The next card was:</p>
                <div class="cards-display">
                    <div class="card revealed" style="font-size: 36px;">${this.getCardDisplay(GameSystem.highLowState.nextCard)}</div>
                </div>
            `;
        }
        
        resultHTML += '<div class="result-message ';
        
        if (won) {
            if (maxStreak) {
                resultHTML += 'win"><span class="emoji">🏆</span>';
                resultHTML += `<strong>MAXIMUM STREAK!</strong> You completed all ${GameSystem.highLowState.maxStreak} rounds and won <strong>${amount} credits</strong>!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`🏆 MAX STREAK! Won ${amount} credits!`, 'win');
            } else {
                resultHTML += 'win"><span class="emoji">💰</span>';
                resultHTML += `You cashed out with a ${GameSystem.highLowState.streak}-streak and won <strong>${amount} credits</strong>!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`💰 Cashed out ${amount} credits!`, 'win');
            }
        } else {
            resultHTML += 'lose"><span class="emoji">😢</span>';
            resultHTML += `Wrong guess! The card was ${this.getCardDisplay(GameSystem.highLowState.nextCard)}. You lost ${GameSystem.highLowState.wager} credits.`;
        }
        
        resultHTML += '</div>';
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="Game5.highLowGame()" class="btn-primary">Play Again</button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;
        
        gameDiv.innerHTML = resultHTML;
        GameSystem.updateHighscore();
        GameSystem.savePlayer();
        GameSystem.isRandomGame = false;
    }
};