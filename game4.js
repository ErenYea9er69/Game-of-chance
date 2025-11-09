// game4.js - Lucky Wheel Game (FIXED)
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
        GameSystem.luckyWheelState = { wager: 0, spinning: false };
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
            { multiplier: 0, weight: 30, color: 'var(--wheel-color-0x)', label: '0x' },
            { multiplier: 0.5, weight: 25, color: 'var(--wheel-color-0_5x)', label: '0.5x' },
            { multiplier: 1, weight: 20, color: 'var(--wheel-color-1x)', label: '1x' },
            { multiplier: 2, weight: 15, color: 'var(--wheel-color-2x)', label: '2x' },
            { multiplier: 5, weight: 8, color: 'var(--wheel-color-5x)', label: '5x' },
            { multiplier: 10, weight: 2, color: 'var(--wheel-color-10x)', label: '10x' }
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

        this.createWheelVisual(segments, selectedSegment);
    },

    createWheelVisual: function(segments, selectedSegment) {
        const wheelContainer = document.getElementById('wheelContainer');
        wheelContainer.innerHTML = `
            <div class="wheel-wrapper">
                <div class="wheel-pointer"></div>
                <div class="wheel-container-inner">
                    <svg id="wheelSVG" viewBox="0 0 300 300" class="wheel-svg">
                        ${this.createWheelSegments(segments)}
                    </svg>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.animateWheelSpin(segments, selectedSegment);
        }, 100);
    },

    createWheelSegments: function(segments) {
        const totalSegments = segments.length;
        const anglePerSegment = 360 / totalSegments;
        const centerX = 150;
        const centerY = 150;
        const radius = 140;
        const textRadius = 95;

        let svg = '';
        let currentAngle = 0; // Start from right side (0 degrees)

        segments.forEach((seg, index) => {
            const startAngle = currentAngle;
            const endAngle = currentAngle + anglePerSegment;
            
            // Convert angles to radians
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            // Calculate segment path
            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);
            
            const largeArc = anglePerSegment > 180 ? 1 : 0;
            
            svg += `
                <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" 
                      fill="${seg.color}" 
                      stroke="var(--border-medium)" 
                      stroke-width="2"/>
            `;
            
            // Add text in the middle of the segment
            const textAngle = startAngle + anglePerSegment / 2;
            const textRad = (textAngle * Math.PI) / 180;
            const textX = centerX + textRadius * Math.cos(textRad);
            const textY = centerY + textRadius * Math.sin(textRad);
            
            svg += `
                <text x="${textX}" y="${textY}" 
                      fill="var(--text-primary)" 
                      font-size="18" 
                      font-weight="bold"
                      text-anchor="middle" 
                      dominant-baseline="middle"
                      transform="rotate(${textAngle + 90}, ${textX}, ${textY})">
                    ${seg.label}
                </text>
            `;
            
            currentAngle = endAngle;
        });

        // Add center circle
        svg += `
            <circle cx="${centerX}" cy="${centerY}" r="25" 
                    fill="var(--bg-secondary)" 
                    stroke="var(--border-accent)" 
                    stroke-width="2"/>
        `;

        return svg;
    },

    animateWheelSpin: function(segments, selectedSegment) {
        const wheelSVG = document.getElementById('wheelSVG');
        const targetIndex = segments.indexOf(selectedSegment);
        const segmentAngle = 360 / segments.length;
        
        // The pointer is at the top (270 degrees in standard coords, or -90 degrees)
        // Calculate which angle should be at the top to point at the selected segment
        // Segments start at 0 degrees (right side) and go clockwise
        
        // The center of the target segment (in the original coordinate system)
        const segmentCenterAngle = targetIndex * segmentAngle + segmentAngle / 2;
        
        // We want this segment center to be at 270 degrees (top, where pointer is)
        // So we need to rotate: 270 - segmentCenterAngle
        // But we add multiple full rotations for the spin effect
        const fullSpins = 5;
        const targetRotation = fullSpins * 360 + (270 - segmentCenterAngle);
        
        wheelSVG.style.transform = `rotate(${targetRotation}deg)`;
        
        setTimeout(() => {
            this.showWheelResult(selectedSegment);
        }, 4000);
    },

    showWheelResult: function(segment) {
        const resultDiv = document.getElementById('wheelResult');
        const winAmount = Math.floor(GameSystem.luckyWheelState.wager * segment.multiplier);
        
        let resultHTML = '<div class="result-message ';
        let notificationMessage = '';
        
        if (segment.multiplier === 0) {
            GameSystem.player.credits -= GameSystem.luckyWheelState.wager;
            resultHTML += 'lose"><span class="emoji">💸</span>';
            resultHTML += `The wheel landed on <strong>0x</strong>! You lost ${GameSystem.luckyWheelState.wager} credits.`;
            notificationMessage = `Lost ${GameSystem.luckyWheelState.wager} credits`;
        } else if (segment.multiplier < 1) {
            const lostAmount = GameSystem.luckyWheelState.wager - winAmount;
            GameSystem.player.credits -= lostAmount;
            resultHTML += 'lose"><span class="emoji">😕</span>';
            resultHTML += `The wheel landed on <strong>${segment.multiplier}x</strong>! You lost ${lostAmount} credits.`;
            notificationMessage = `Lost ${lostAmount} credits`;
        } else if (segment.multiplier === 1) {
            resultHTML += 'info"><span class="emoji">😐</span>';
            resultHTML += `The wheel landed on <strong>1x</strong>! You got your ${GameSystem.luckyWheelState.wager} credits back.`;
            notificationMessage = 'Got your wager back';
        } else {
            const profit = winAmount - GameSystem.luckyWheelState.wager;
            GameSystem.player.credits += profit;
            GameSystem.player.totalWins++;
            resultHTML += 'win"><span class="emoji">🎉</span>';
            resultHTML += `The wheel landed on <strong>${segment.multiplier}x</strong>! You won ${profit} credits!`;
            notificationMessage = `Won ${profit} credits!`;
            GameSystem.showNotification(`🎰 ${notificationMessage}`, 'win');
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