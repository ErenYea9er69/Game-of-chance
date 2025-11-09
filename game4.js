// game4.js - Lucky Wheel Game
/* ====================================
   GAME 4: LUCKY WHEEL
   ==================================== */

window.Game4 = {
    luckyWheelGame: function() {
        if (GameSystem.player.credits === 0) {
            GameSystem.showNotification('You don\'t have any credits to wager!', 'lose');
            GameSystem.backToMenu();
            return;
        }

        GameSystem.luckyWheelState = { wager: 0, spinning: false, rotation: 0 };

        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = `
            <section class="game-container glass-card">
                <h3>Lucky Wheel</h3>
                <p class="game-description">
                    Spin the wheel of fortune! The wheel has different prize multipliers:
                    <strong>0x (lose all)</strong>, <strong>0.5x</strong>, <strong>1x (return)</strong>, 
                    <strong>2x</strong>, <strong>5x</strong>, and the rare <strong>10x jackpot</strong>!
                    The bigger the prize, the smaller the section on the wheel.
                </p>
                <input type="number" id="wheelWager" min="1" max="${GameSystem.player.credits}" placeholder="Enter your wager" autofocus>
                <button onclick="Game4.spinWheel()" class="btn-primary" style="width: 100%; margin-top: 12px;">
                    Spin the Wheel
                </button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary" style="width: 100%; margin-top: 12px;">
                    Back to Menu
                </button>
                <div id="wheelContainer"></div>
                <div id="wheelResult"></div>
            </section>
        `;
    },

    spinWheel: function() {
        if (GameSystem.luckyWheelState.spinning) return;
        
        const wagerInput = document.getElementById('wheelWager');
        const wager = parseInt(wagerInput.value);
        
        if (!wager || wager < 1 || wager > GameSystem.player.credits) {
            GameSystem.showNotification('Please enter a valid wager amount', 'lose');
            wagerInput.focus();
            return;
        }

        GameSystem.luckyWheelState.wager = wager;
        GameSystem.luckyWheelState.spinning = true;
        GameSystem.player.gamesPlayed++;
        
        wagerInput.disabled = true;
        
        const segments = [
            { multiplier: 0, weight: 30, color: 'var(--accent-lose)' },
            { multiplier: 0.5, weight: 25, color: '#3a2a2a' },
            { multiplier: 1, weight: 20, color: '#2a2a3a' },
            { multiplier: 2, weight: 15, color: '#2a3a2a' },
            { multiplier: 5, weight: 8, color: '#3a3a2a' },
            { multiplier: 10, weight: 2, color: 'var(--accent-win)' }
        ];
        
        const totalWeight = segments.reduce((sum, seg) => sum + seg.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedSegment = segments[0];
        
        for (let seg of segments) {
            random -= seg.weight;
            if (random <= 0) {
                selectedSegment = seg;
                break;
            }
        }
        
        const wheelContainer = document.getElementById('wheelContainer');
        wheelContainer.innerHTML = `
            <div style="position: relative; margin: 40px auto; width: 280px; height: 280px;">
                <div id="wheelPointer" style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent; border-top: 30px solid var(--text-primary); z-index: 10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));"></div>
                <svg id="wheelSVG" width="280" height="280" style="transform: rotate(0deg); transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);">
                    ${this.createWheelSegments(segments)}
                </svg>
            </div>
        `;
        
        setTimeout(() => {
            const wheelSVG = document.getElementById('wheelSVG');
            const spins = 5 + Math.random() * 3;
            const segmentAngle = 360 / segments.length;
            const targetIndex = segments.indexOf(selectedSegment);
            const targetAngle = 360 * spins + (targetIndex * segmentAngle) + (segmentAngle / 2);
            
            wheelSVG.style.transform = `rotate(${targetAngle}deg)`;
            
            setTimeout(() => {
                this.showWheelResult(selectedSegment);
            }, 4000);
        }, 100);
    },

    createWheelSegments: function(segments) {
        const total = segments.length;
        const anglePerSegment = 360 / total;
        let currentAngle = 0;
        let svg = '';
        
        segments.forEach((seg, i) => {
            const x1 = 140 + 120 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 140 + 120 * Math.sin((currentAngle * Math.PI) / 180);
            const nextAngle = currentAngle + anglePerSegment;
            const x2 = 140 + 120 * Math.cos((nextAngle * Math.PI) / 180);
            const y2 = 140 + 120 * Math.sin((nextAngle * Math.PI) / 180);
            
            const largeArc = anglePerSegment > 180 ? 1 : 0;
            
            svg += `
                <path d="M 140 140 L ${x1} ${y1} A 120 120 0 ${largeArc} 1 ${x2} ${y2} Z" 
                      fill="${seg.color}" 
                      stroke="var(--border-medium)" 
                      stroke-width="2"/>
                <text x="140" y="140" 
                      fill="var(--text-primary)" 
                      font-size="16" 
                      font-weight="bold"
                      text-anchor="middle" 
                      transform="rotate(${currentAngle + anglePerSegment / 2} 140 140) translate(0 -75)">
                    ${seg.multiplier}x
                </text>
            `;
            
            currentAngle = nextAngle;
        });
        
        return svg;
    },

    showWheelResult: function(segment) {
        const resultDiv = document.getElementById('wheelResult');
        const winAmount = Math.floor(GameSystem.luckyWheelState.wager * segment.multiplier);
        
        let resultHTML = '<div class="result-message ';
        
        if (segment.multiplier === 0) {
            GameSystem.player.credits -= GameSystem.luckyWheelState.wager;
            resultHTML += 'lose"><span class="emoji">💸</span>';
            resultHTML += `The wheel landed on <strong>0x</strong>! You lost ${GameSystem.luckyWheelState.wager} credits.`;
        } else if (segment.multiplier < 1) {
            const lostAmount = GameSystem.luckyWheelState.wager - winAmount;
            GameSystem.player.credits -= lostAmount;
            resultHTML += 'lose"><span class="emoji">😕</span>';
            resultHTML += `The wheel landed on <strong>${segment.multiplier}x</strong>! You lost ${lostAmount} credits.`;
        } else if (segment.multiplier === 1) {
            resultHTML += 'info"><span class="emoji">😐</span>';
            resultHTML += `The wheel landed on <strong>1x</strong>! You got your ${GameSystem.luckyWheelState.wager} credits back.`;
        } else {
            const profit = winAmount - GameSystem.luckyWheelState.wager;
            GameSystem.player.credits += profit;
            GameSystem.player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎉</span>';
            resultHTML += `The wheel landed on <strong>${segment.multiplier}x</strong>! You won ${profit} credits!`;
            GameSystem.showNotification(`🎰 Won ${profit} credits!`, 'win');
        }
        
        resultHTML += '</div>';
        resultHTML += `
            <div class="action-buttons mt-4">
                <button onclick="Game4.luckyWheelGame()" class="btn-primary">Spin Again</button>
                <button onclick="GameSystem.backToMenu()" class="btn-secondary">Back to Menu</button>
            </div>
        `;
        
        resultDiv.innerHTML = resultHTML;
        GameSystem.luckyWheelState.spinning = false;
        GameSystem.updateHighscore();
        GameSystem.savePlayer();
    }
};