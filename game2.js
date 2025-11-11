// game2.js - No Match Dealer Game
/* ====================================
   GAME 2: NO MATCH DEALER
    */

window.Game2 = {
    noMatchGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        GameSystem.noMatchGameState.userNumbers = [];
        GameSystem.noMatchGameState.dealerNumbers = [];
        GameSystem.noMatchGameState.wager = 0;

        const gameArea = document.getElementById('gameArea');
        const randomGameBadge = GameSystem.isRandomGame ? '<div class="random-game-badge">🎲 RANDOM GAME MODE</div>' : '';
        
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                ${randomGameBadge}
                <h3>No Match Dealer</h3>
                <p class="game-description">
                    In this game, you can wager up to all of your credits. You will pick 
                    <strong>8 numbers between 0 and 99</strong>. The dealer will then deal 
                    <strong>8 random numbers</strong>. If there are <strong>no matches</strong> 
                    between your numbers and the dealer's numbers, you <strong>${GameSystem.isRandomGame ? 'quadruple' : 'double'} your money</strong>!
                    ${GameSystem.isRandomGame ? '<br><strong>(2x Random Game Bonus!)</strong>' : ''}
                </p>
                <input type="number" id="wagerAmount" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager">
                <button onclick="Game2.startNumberSelection()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                    Continue to Number Selection
                </button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="noMatchResult"></div>
            </section>
        `;
    },

    startNumberSelection: function() {
        const wagerInput = document.getElementById('wagerAmount');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.noMatchGameState.wager = wager;
        GameSystem.noMatchGameState.userNumbers = [];

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
                    <button onclick="Game2.addUserNumber()" class="btn-primary">Add Number</button>
                    <button onclick="Game2.clearUserNumbers()" class="btn-secondary">Clear All</button>
                </div>
                <button onclick="Game2.dealDealerCards()" id="dealBtn" class="btn-primary" style="width: 100%; margin-top: 16px;" disabled>
                    Deal Dealer Cards
                </button>
                <div id="noMatchResult"></div>
            </section>
        `;
        
        this.updateSelectedNumbersDisplay();
    },

    addUserNumber: function() {
        const numberInput = document.getElementById('numberInput');
        const number = parseInt(numberInput.value);
        
        if (isNaN(number) || number < 0 || number > 99) {
            GameSystem.showNotification('Please enter a valid number between 0 and 99', 'lose');
            numberInput.focus();
            return;
        }

        if (GameSystem.noMatchGameState.userNumbers.includes(number)) {
            GameSystem.showNotification('You already selected this number!', 'lose');
            numberInput.value = '';
            numberInput.focus();
            return;
        }

        if (GameSystem.noMatchGameState.userNumbers.length >= 8) {
            GameSystem.showNotification('You already selected 8 numbers!', 'lose');
            return;
        }

        GameSystem.noMatchGameState.userNumbers.push(number);
        numberInput.value = '';
        numberInput.focus();
        
        this.updateSelectedNumbersDisplay();
        
        if (GameSystem.noMatchGameState.userNumbers.length === 8) {
            document.getElementById('dealBtn').disabled = false;
            GameSystem.showNotification('All 8 numbers selected! Click "Deal Dealer Cards" to continue.', 'info');
        }
    },

    clearUserNumbers: function() {
        GameSystem.noMatchGameState.userNumbers = [];
        this.updateSelectedNumbersDisplay();
        document.getElementById('dealBtn').disabled = true;
        document.getElementById('numberInput').focus();
    },

    updateSelectedNumbersDisplay: function() {
        const display = document.getElementById('selectedNumbers');
        const count = document.getElementById('numberCount');
        
        count.textContent = `${GameSystem.noMatchGameState.userNumbers.length}/8`;
        
        if (GameSystem.noMatchGameState.userNumbers.length === 0) {
            display.innerHTML = '<p class="text-muted" style="text-align: center; padding: 20px;">No numbers selected yet</p>';
        } else {
            let html = '<div class="numbers-grid">';
            GameSystem.noMatchGameState.userNumbers.forEach((num, index) => {
                html += `<div class="number-cell user-number" style="--i: ${index}">${num}</div>`;
            });
            html += '</div>';
            display.innerHTML = html;
        }
    },

    dealDealerCards: function() {
        GameSystem.player.gamesPlayed++;
        
        const resultDiv = document.getElementById('noMatchResult');
        resultDiv.innerHTML = '<div class="spinner"></div>';
        
        document.getElementById('dealBtn').disabled = true;
        
        setTimeout(() => {
            GameSystem.noMatchGameState.dealerNumbers = [];
            for (let i = 0; i < 8; i++) {
                GameSystem.noMatchGameState.dealerNumbers.push(Math.floor(Math.random() * 100));
            }

            const matches = [];
            for (let userNum of GameSystem.noMatchGameState.userNumbers) {
                if (GameSystem.noMatchGameState.dealerNumbers.includes(userNum)) {
                    matches.push(userNum);
                }
            }

            let gridHTML = '<h4 style="margin-top: 24px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Numbers</h4>';
            gridHTML += '<div class="numbers-grid">';
            GameSystem.noMatchGameState.userNumbers.forEach((num, index) => {
                const isMatch = matches.includes(num) ? ' match' : '';
                gridHTML += `<div class="number-cell user-number${isMatch}" style="--i: ${index}">${num}</div>`;
            });
            gridHTML += '</div>';

            gridHTML += '<h4 style="margin-top: 24px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Dealer\'s Numbers</h4>';
            gridHTML += '<div class="numbers-grid">';
            GameSystem.noMatchGameState.dealerNumbers.forEach((num, index) => {
                const isMatch = matches.includes(num) ? ' match' : '';
                gridHTML += `<div class="number-cell dealer-number${isMatch}" style="--i: ${index + 8}">${num}</div>`;
            });
            gridHTML += '</div>';

            let resultHTML = '<div class="result-message ';
            if (matches.length > 0) {
                GameSystem.player.credits -= GameSystem.noMatchGameState.wager;
                resultHTML += 'lose"><span class="emoji">💔</span>';
                resultHTML += `The dealer matched ${matches.length} number(s): <strong>${matches.join(', ')}</strong>! You lose ${GameSystem.noMatchGameState.wager} credits.`;
            } else {
                const baseWin = GameSystem.noMatchGameState.wager;
                const actualWin = GameSystem.isRandomGame ? baseWin * 2 : baseWin;
                GameSystem.player.credits += actualWin;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎊</span>';
                resultHTML += `There were no matches! You win <strong>${actualWin} credits</strong>!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`💸 Won ${actualWin} credits!`, 'win');
            }
            resultHTML += '</div>';
            
            resultHTML += `
                <div class="action-buttons mt-4">
                    <button onclick="Game2.noMatchGame()" class="btn-primary">Play Again</button>
                    <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
                </div>
            `;

            resultDiv.innerHTML = gridHTML + resultHTML;
            GameSystem.updateHighscore();
            GameSystem.savePlayer();
            GameSystem.isRandomGame = false;
        }, 800);
    }
};