// game3.js - Find the Ace Game
/* ====================================
   GAME 3: FIND THE ACE
   ==================================== */

window.Game3 = {
    findAceGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        GameSystem.aceGame = { ace: 0, pick: -1, wagerOne: 0, wagerTwo: 0, revealed: -1 };
        GameSystem.aceGame.ace = Math.floor(Math.random() * 3);

        const gameArea = document.getElementById('gameArea');
        const randomGameBadge = GameSystem.isRandomGame ? '<div class="random-game-badge">🎲 RANDOM GAME MODE</div>' : '';
        
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                ${randomGameBadge}
                <h3>Find the Ace</h3>
                <p class="game-description">
                    In this game, you can wager up to all of your credits. Three cards will be 
                    dealt out: <strong>two queens and one ace</strong>. If you find the ace, 
                    you will win your wager${GameSystem.isRandomGame ? ' <strong>doubled (2x Random Game Bonus!)</strong>' : ''}. After choosing a card, one of the queens will be 
                    revealed. You may then change your pick or increase your wager.
                </p>
                <input type="number" id="aceWager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager">
                <button onclick="Game3.dealAceCards()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                    Place Wager & Deal Cards
                </button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="aceGameArea"></div>
            </section>
        `;
    },

    dealAceCards: function() {
        const wagerInput = document.getElementById('aceWager');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.aceGame.wagerOne = wager;
        GameSystem.player.gamesPlayed++;

        const gameArea = document.getElementById('aceGameArea');
        gameArea.innerHTML = `
            <p class="game-description text-center" style="margin-top: 24px;">Select a card:</p>
            <div class="cards-display">
                <div class="card" onclick="Game3.selectCard(0)">?</div>
                <div class="card" onclick="Game3.selectCard(1)">?</div>
                <div class="card" onclick="Game3.selectCard(2)">?</div>
            </div>
        `;
    },

    selectCard: function(index) {
        if (GameSystem.aceGame.pick !== -1) return;
        
        GameSystem.aceGame.pick = index;
        
        let reveal = 0;
        while (reveal === GameSystem.aceGame.ace || reveal === GameSystem.aceGame.pick) {
            reveal++;
        }
        GameSystem.aceGame.revealed = reveal;

        const cards = ['?', '?', '?'];
        cards[reveal] = 'Q';

        const gameArea = document.getElementById('aceGameArea');
        gameArea.innerHTML = `
            <p class="game-description text-center" style="margin-top: 24px;">
                Your pick: <strong>Card ${GameSystem.aceGame.pick + 1}</strong>
            </p>
            <div class="cards-display">
                ${cards.map((c, i) => `
                    <div class="card ${i === GameSystem.aceGame.pick ? 'selected' : ''} ${i === reveal ? 'revealed' : ''}">${c}</div>
                `).join('')}
            </div>
            <p class="game-description text-center">
                A queen has been revealed. Would you like to:
            </p>
            <div class="action-buttons">
                <button onclick="Game3.changeCard()" class="btn-primary">Change Your Pick</button>
                <button onclick="Game3.increaseWager()" class="btn-primary">Increase Wager</button>
            </div>
        `;
    },

    changeCard: function() {
        let newPick = 0;
        while (newPick === GameSystem.aceGame.pick || newPick === GameSystem.aceGame.revealed) {
            newPick++;
        }
        GameSystem.aceGame.pick = newPick;
        GameSystem.showNotification(`Card changed to Card ${newPick + 1}`, 'info');
        setTimeout(() => this.revealResult(), 500);
    },

    increaseWager: function() {
        const maxAdditional = GameSystem.player.credits - GameSystem.aceGame.wagerOne;
        
        const gameArea = document.getElementById('aceGameArea');
        gameArea.innerHTML = `
            <p class="game-description text-center" style="margin-top: 24px;">
                Enter additional wager amount (max ${maxAdditional}):
            </p>
            <input type="number" id="additionalWager" min="1" max="${maxAdditional}" placeholder="Additional wager" autofocus>
            <div class="action-buttons" style="margin-top: 16px;">
                <button onclick="Game3.confirmAdditionalWager()" class="btn-primary">Confirm Wager</button>
                <button onclick="Game3.revealResult()" class="btn-secondary">Skip & Reveal</button>
            </div>
        `;
    },

    confirmAdditionalWager: function() {
        const wagerInput = document.getElementById('additionalWager');
        const wagerTwo = parseInt(wagerInput.value);
        const maxAdditional = GameSystem.player.credits - GameSystem.aceGame.wagerOne;
        
        if (wagerTwo && wagerTwo > 0 && wagerTwo <= maxAdditional) {
            GameSystem.aceGame.wagerTwo = wagerTwo;
            GameSystem.showNotification(`Added ${wagerTwo} credits to wager`, 'info');
            setTimeout(() => this.revealResult(), 500);
        } else {
            GameSystem.showNotification('Invalid wager amount', 'lose');
            wagerInput.focus();
        }
    },

    revealResult: function() {
        const cards = ['Q', 'Q', 'Q'];
        cards[GameSystem.aceGame.ace] = 'A';

        let resultHTML = `
            <p class="game-description text-center" style="margin-top: 24px;">
                <strong>Final Result</strong>
            </p>
            <div class="cards-display">
                ${cards.map((c, i) => `
                    <div class="card ${i === GameSystem.aceGame.pick ? 'selected' : ''} revealed">${c}</div>
                `).join('')}
            </div>
        `;

        resultHTML += '<div class="result-message ';
        if (GameSystem.aceGame.pick === GameSystem.aceGame.ace) {
            const baseWin1 = GameSystem.aceGame.wagerOne;
            const baseWin2 = GameSystem.aceGame.wagerTwo;
            const actualWin1 = GameSystem.isRandomGame ? baseWin1 * 2 : baseWin1;
            const actualWin2 = GameSystem.isRandomGame ? baseWin2 * 2 : baseWin2;
            
            GameSystem.player.credits += actualWin1;
            GameSystem.player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎉</span>';
            resultHTML += `You won <strong>${actualWin1} credits</strong> from your first wager`;
            if (actualWin2 > 0) {
                GameSystem.player.credits += actualWin2;
                resultHTML += ` and an additional <strong>${actualWin2} credits</strong> from your second wager!`;
            }
            if (GameSystem.isRandomGame) {
                resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
            }
            resultHTML += '!';
            GameSystem.showNotification(`🎰 Won ${actualWin1 + actualWin2} credits!`, 'win');
        } else {
            GameSystem.player.credits -= GameSystem.aceGame.wagerOne;
            resultHTML += 'lose"><span class="emoji">😞</span>';
            resultHTML += `You lost <strong>${GameSystem.aceGame.wagerOne} credits</strong> from your first wager`;
            if (GameSystem.aceGame.wagerTwo > 0) {
                GameSystem.player.credits -= GameSystem.aceGame.wagerTwo;
                resultHTML += ` and an additional <strong>${GameSystem.aceGame.wagerTwo} credits</strong> from your second wager`;
            }
            resultHTML += '.';
        }
        resultHTML += '</div>';
        
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="Game3.findAceGame()" class="btn-primary">Play Again</button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;

        GameSystem.updateHighscore();
        document.getElementById('aceGameArea').innerHTML = resultHTML;
        GameSystem.savePlayer();
        GameSystem.isRandomGame = false;
    }
};