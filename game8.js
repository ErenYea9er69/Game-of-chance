// game8.js - Blackjack Game
/* ====================================
   GAME 8: BLACKJACK
   ==================================== */

window.Game8 = {
    gameState: {
        deck: [],
        playerHand: [],
        dealerHand: [],
        wager: 0,
        playerTotal: 0,
        dealerTotal: 0,
        gameOver: false,
        dealerRevealed: false
    },

    suits: ['♠', '♥', '♦', '♣'],
    ranks: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],

    blackjackGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        const gameArea = document.getElementById('gameArea');
        const randomGameBadge = GameSystem.isRandomGame ? '<div class="random-game-badge">🎲 RANDOM GAME MODE</div>' : '';
        
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                ${randomGameBadge}
                <h3>Blackjack</h3>
                <p class="game-description">
                    Get as close to <strong>21</strong> as possible without going over. 
                    <strong>Blackjack (Ace + 10-value card) pays ${GameSystem.isRandomGame ? '3x' : '1.5x'}</strong>!
                    ${GameSystem.isRandomGame ? '<br><strong>(2x Random Game Bonus!)</strong>' : ''}
                    Face cards = 10, Aces = 1 or 11.
                </p>
                <input type="number" id="blackjackWager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager">
                <div class="action-buttons">
                    <button onclick="Game8.startBlackjack()" class="btn-primary">Deal Cards</button>
                    <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
                </div>
            </section>
        `;
    },

    createDeck: function() {
        this.gameState.deck = [];
        for (let suit of this.suits) {
            for (let rank of this.ranks) {
                this.gameState.deck.push({ rank, suit });
            }
        }
        // Shuffle deck
        for (let i = this.gameState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameState.deck[i], this.gameState.deck[j]] = [this.gameState.deck[j], this.gameState.deck[i]];
        }
    },

    drawCard: function() {
        return this.gameState.deck.pop();
    },

    getCardValue: function(card) {
        if (card.rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.rank)) return 10;
        return parseInt(card.rank);
    },

    calculateHandValue: function(hand) {
        let total = 0;
        let aces = 0;

        for (let card of hand) {
            let value = this.getCardValue(card);
            if (value === 11) aces++;
            total += value;
        }

        // Adjust for aces
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    },

    isBlackjack: function(hand) {
        return hand.length === 2 && this.calculateHandValue(hand) === 21;
    },

    startBlackjack: function() {
        const wagerInput = document.getElementById('blackjackWager');
        const wager = parseInt(wagerInput.value);

        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.player.credits -= wager;
        GameSystem.player.gamesPlayed++;

        this.gameState.wager = wager;
        this.gameState.playerHand = [];
        this.gameState.dealerHand = [];
        this.gameState.gameOver = false;
        this.gameState.dealerRevealed = false;

        this.createDeck();

        // Deal initial cards
        this.gameState.playerHand.push(this.drawCard());
        this.gameState.dealerHand.push(this.drawCard());
        this.gameState.playerHand.push(this.drawCard());
        this.gameState.dealerHand.push(this.drawCard());

        this.gameState.playerTotal = this.calculateHandValue(this.gameState.playerHand);
        this.gameState.dealerTotal = this.calculateHandValue(this.gameState.dealerHand);

        this.renderGame();

        // Check for immediate blackjack
        if (this.isBlackjack(this.gameState.playerHand)) {
            if (this.isBlackjack(this.gameState.dealerHand)) {
                // Both have blackjack - push
                this.endGame('push');
            } else {
                // Player blackjack wins!
                this.endGame('blackjack');
            }
        } else if (this.isBlackjack(this.gameState.dealerHand)) {
            // Dealer has blackjack
            this.endGame('dealerBlackjack');
        }
    },

    renderGame: function() {
        const gameArea = document.getElementById('gameArea');
        
        let dealerCardsHTML = '';
        if (this.gameState.dealerRevealed) {
            dealerCardsHTML = this.gameState.dealerHand.map(card => 
                `<div class="blackjack-card">${card.rank}${card.suit}</div>`
            ).join('');
        } else {
            dealerCardsHTML = `
                <div class="blackjack-card">${this.gameState.dealerHand[0].rank}${this.gameState.dealerHand[0].suit}</div>
                <div class="blackjack-card card-back">🂠</div>
            `;
        }

        const playerCardsHTML = this.gameState.playerHand.map(card => 
            `<div class="blackjack-card">${card.rank}${card.suit}</div>`
        ).join('');

        const dealerTotal = this.gameState.dealerRevealed 
            ? this.gameState.dealerTotal 
            : this.getCardValue(this.gameState.dealerHand[0]);

        const actionsHTML = this.gameState.gameOver ? '' : `
            <div class="action-buttons">
                <button onclick="Game8.hit()" class="btn-primary" ${this.gameState.playerTotal >= 21 ? 'disabled' : ''}>
                    Hit
                </button>
                <button onclick="Game8.stand()" class="btn-primary">
                    Stand
                </button>
                <button onclick="Game8.doubleDown()" class="btn-secondary" 
                    ${this.gameState.playerHand.length > 2 || GameSystem.player.credits < this.gameState.wager ? 'disabled' : ''}>
                    Double Down
                </button>
            </div>
        `;

        gameArea.innerHTML = `
            <section class="game-container glass-card">
                <h3>Blackjack - Wager: ${this.gameState.wager} credits</h3>
                
                <div class="blackjack-table">
                    <div class="blackjack-hand">
                        <h4>Dealer (${dealerTotal})</h4>
                        <div class="blackjack-cards">
                            ${dealerCardsHTML}
                        </div>
                    </div>

                    <div class="blackjack-hand">
                        <h4>You (${this.gameState.playerTotal})</h4>
                        <div class="blackjack-cards">
                            ${playerCardsHTML}
                        </div>
                    </div>
                </div>

                ${actionsHTML}

                <div id="blackjackResult"></div>
            </section>
        `;
    },

    hit: function() {
        if (this.gameState.gameOver) return;

        this.gameState.playerHand.push(this.drawCard());
        this.gameState.playerTotal = this.calculateHandValue(this.gameState.playerHand);

        this.renderGame();

        if (this.gameState.playerTotal > 21) {
            this.endGame('bust');
        } else if (this.gameState.playerTotal === 21) {
            this.stand();
        }
    },

    stand: function() {
        if (this.gameState.gameOver) return;

        this.gameState.dealerRevealed = true;
        this.renderGame();

        // Dealer draws until 17 or higher
        const dealerDrawCards = () => {
            setTimeout(() => {
                if (this.gameState.dealerTotal < 17) {
                    this.gameState.dealerHand.push(this.drawCard());
                    this.gameState.dealerTotal = this.calculateHandValue(this.gameState.dealerHand);
                    this.renderGame();
                    dealerDrawCards();
                } else {
                    // Determine winner
                    if (this.gameState.dealerTotal > 21) {
                        this.endGame('dealerBust');
                    } else if (this.gameState.dealerTotal > this.gameState.playerTotal) {
                        this.endGame('lose');
                    } else if (this.gameState.dealerTotal < this.gameState.playerTotal) {
                        this.endGame('win');
                    } else {
                        this.endGame('push');
                    }
                }
            }, 800);
        };

        dealerDrawCards();
    },

    doubleDown: function() {
        if (this.gameState.gameOver || this.gameState.playerHand.length > 2) return;
        if (GameSystem.player.credits < this.gameState.wager) {
            GameSystem.showNotification('Insufficient credits to double down', 'lose');
            return;
        }

        GameSystem.player.credits -= this.gameState.wager;
        this.gameState.wager *= 2;

        this.gameState.playerHand.push(this.drawCard());
        this.gameState.playerTotal = this.calculateHandValue(this.gameState.playerHand);

        this.renderGame();

        if (this.gameState.playerTotal > 21) {
            this.endGame('bust');
        } else {
            this.stand();
        }
    },

    endGame: function(result) {
        this.gameState.gameOver = true;
        this.gameState.dealerRevealed = true;
        this.renderGame();

        const resultDiv = document.getElementById('blackjackResult');
        let resultHTML = '<div class="result-message ';
        let winnings = 0;

        switch(result) {
            case 'blackjack':
                const blackjackMultiplier = GameSystem.isRandomGame ? 3 : 1.5;
                winnings = Math.floor(this.gameState.wager * blackjackMultiplier) + this.gameState.wager;
                GameSystem.player.credits += winnings;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎉</span>';
                resultHTML += `<strong>BLACKJACK!</strong> You win ${winnings} credits!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`🃏 BLACKJACK! +${winnings} credits`, 'win');
                break;

            case 'win':
                const baseWin = this.gameState.wager;
                const actualWin = GameSystem.isRandomGame ? baseWin * 2 : baseWin;
                winnings = actualWin + this.gameState.wager;
                GameSystem.player.credits += winnings;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">🎊</span>';
                resultHTML += `You win! ${winnings} credits awarded!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`💰 Won ${winnings} credits!`, 'win');
                break;

            case 'dealerBust':
                const bustWin = GameSystem.isRandomGame ? this.gameState.wager * 2 : this.gameState.wager;
                winnings = bustWin + this.gameState.wager;
                GameSystem.player.credits += winnings;
                GameSystem.player.totalWins++;
                resultHTML += 'win"><span class="emoji">💥</span>';
                resultHTML += `Dealer busts! You win ${winnings} credits!`;
                if (GameSystem.isRandomGame) {
                    resultHTML += ' <strong>(2x Random Game Bonus!)</strong>';
                }
                GameSystem.showNotification(`💥 Dealer bust! +${winnings} credits`, 'win');
                break;

            case 'push':
                GameSystem.player.credits += this.gameState.wager;
                resultHTML += 'info"><span class="emoji">🤝</span>';
                resultHTML += `Push! Your ${this.gameState.wager} credits are returned.`;
                break;

            case 'bust':
                resultHTML += 'lose"><span class="emoji">💔</span>';
                resultHTML += `You bust! You lose ${this.gameState.wager} credits.`;
                break;

            case 'dealerBlackjack':
                resultHTML += 'lose"><span class="emoji">😔</span>';
                resultHTML += `Dealer has Blackjack! You lose ${this.gameState.wager} credits.`;
                break;

            case 'lose':
                resultHTML += 'lose"><span class="emoji">😞</span>';
                resultHTML += `Dealer wins! You lose ${this.gameState.wager} credits.`;
                break;
        }

        resultHTML += '</div>';
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="Game8.blackjackGame()" class="btn-primary">Play Again</button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;

        resultDiv.innerHTML = resultHTML;
        GameSystem.updateHighscore();
        GameSystem.savePlayer();
        GameSystem.isRandomGame = false;
    }
};