document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    let currentPlayer = 'X';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let gameActive = true;
    let gameMode = 'pvp'; // 'pvp' or 'pvc'
    let difficulty = 'medium';
    let scores = {
        'X': 0,
        'O': 0,
        'tie': 0
    };

    // DOM elements
    const cells = document.querySelectorAll('.cell');
    const playerTurnElement = document.getElementById('player-turn');
    const scoreXElement = document.getElementById('score-x');
    const scoreOElement = document.getElementById('score-o');
    const scoreTieElement = document.getElementById('score-tie');
    const restartBtn = document.getElementById('restart-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const messageOverlay = document.getElementById('message-overlay');
    const messageText = document.getElementById('message-text');
    const closeMessage = document.getElementById('close-message');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const difficultySelect = document.getElementById('difficulty');
    const difficultyContainer = document.getElementById('difficulty-container');
    const winningLine = document.getElementById('winning-line');

    // Winning combinations
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    // Initialize the game
    function initGame() {
        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
            cell.classList.remove('x', 'o', 'win');
        });
        
        restartBtn.addEventListener('click', restartGame);
        newGameBtn.addEventListener('click', newGame);
        closeMessage.addEventListener('click', hideMessage);
        
        pvpBtn.addEventListener('click', () => switchMode('pvp'));
        pvcBtn.addEventListener('click', () => switchMode('pvc'));
        difficultySelect.addEventListener('change', () => {
            difficulty = difficultySelect.value;
        });
        
        updatePlayerTurn();
        hideMessage();
    }

    // Handle cell click
    function handleCellClick(e) {
        const cell = e.target;
        const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
        
        // Check if cell is already taken or game is not active
        if (gameBoard[cellIndex] !== '' || !gameActive) return;
        
        // Make move for human player
        makeMove(cellIndex);
        
        // If playing against computer and game is still active
        if (gameMode === 'pvc' && gameActive && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 600); // Add delay for better UX
        }
    }

    // Make a move
    function makeMove(cellIndex) {
        // Update game board
        gameBoard[cellIndex] = currentPlayer;
        
        // Update UI
        const cell = document.querySelector(`[data-cell-index="${cellIndex}"]`);
        cell.classList.add(currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (checkWin()) {
            endGame(false);
            highlightWinningCells();
            return;
        }
        
        if (checkDraw()) {
            endGame(true);
            return;
        }
        
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerTurn();
    }

    // Make computer move
    function makeComputerMove() {
        if (!gameActive) return;
        
        let cellIndex;
        
        switch(difficulty) {
            case 'easy':
                cellIndex = getRandomMove();
                break;
            case 'hard':
                cellIndex = getBestMove();
                break;
            case 'medium':
            default:
                // 50% chance for best move, 50% for random move
                cellIndex = Math.random() < 0.5 ? getBestMove() : getRandomMove();
        }
        
        makeMove(cellIndex);
    }

    // Get a random available move
    function getRandomMove() {
        const availableMoves = gameBoard
            .map((value, index) => value === '' ? index : null)
            .filter(index => index !== null);
        
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    // Get the best move using minimax algorithm
    function getBestMove() {
        // Simple strategy for medium/hard difficulty
        // 1. Check for winning move
        // 2. Block opponent's winning move
        // 3. Choose center if available
        // 4. Choose a corner if available
        // 5. Choose a random move
        
        // Check for winning move
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = 'O';
                if (checkWin()) {
                    gameBoard[i] = '';
                    return i;
                }
                gameBoard[i] = '';
            }
        }
        
        // Block opponent's winning move
        for (let i = 0; i < gameBoard.length; i++) {
            if (gameBoard[i] === '') {
                gameBoard[i] = 'X';
                if (checkWin()) {
                    gameBoard[i] = '';
                    return i;
                }
                gameBoard[i] = '';
            }
        }
        
        // Choose center if available
        if (gameBoard[4] === '') return 4;
        
        // Choose a corner if available
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => gameBoard[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Otherwise, choose a random move
        return getRandomMove();
    }

    // Check for win
    function checkWin() {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                return pattern;
            }
        }
        return false;
    }

    // Check for draw
    function checkDraw() {
        return !gameBoard.includes('') && !checkWin();
    }

    // End the game
    function endGame(isDraw) {
        gameActive = false;
        
        if (isDraw) {
            scores.tie++;
            scoreTieElement.querySelector('span:last-child').textContent = scores.tie;
            showMessage("It's a Draw!");
        } else {
            scores[currentPlayer]++;
            const scoreElement = currentPlayer === 'X' ? scoreXElement : scoreOElement;
            scoreElement.querySelector('span:last-child').textContent = scores[currentPlayer];
            showMessage(`Player ${currentPlayer} Wins!`);
        }
    }

    // Highlight winning cells
    function highlightWinningCells() {
        const winPattern = checkWin();
        if (!winPattern) return;
        
        const [a, b, c] = winPattern;
        
        // Add win class to winning cells
        document.querySelector(`[data-cell-index="${a}"]`).classList.add('win');
        document.querySelector(`[data-cell-index="${b}"]`).classList.add('win');
        document.querySelector(`[data-cell-index="${c}"]`).classList.add('win');
        
        // Draw winning line
        drawWinningLine(winPattern);
    }

    // Draw winning line
    function drawWinningLine(pattern) {
        const [a, b, c] = pattern;
        const cellSize = cells[0].offsetWidth;
        const boardRect = document.querySelector('.game-board').getBoundingClientRect();
        
        // Get positions of first and last cell in the pattern
        const firstCell = cells[a].getBoundingClientRect();
        const lastCell = cells[c].getBoundingClientRect();
        
        // Calculate line position and dimensions
        let lineStyle = '';
        
        if (pattern[0] === 0 && pattern[2] === 8) {
            // Diagonal from top-left to bottom-right
            lineStyle = `
                width: ${Math.sqrt(2) * cellSize * 3}px;
                height: 8px;
                top: ${cellSize * 1.5}px;
                left: ${cellSize * 0.3}px;
                transform: rotate(45deg);
            `;
        } else if (pattern[0] === 2 && pattern[2] === 6) {
            // Diagonal from top-right to bottom-left
            lineStyle = `
                width: ${Math.sqrt(2) * cellSize * 3}px;
                height: 8px;
                top: ${cellSize * 1.5}px;
                right: ${cellSize * 0.3}px;
                transform: rotate(-45deg);
            `;
        } else if (pattern[0] === 0 && pattern[2] === 2) {
            // Top row
            lineStyle = `
                width: ${cellSize * 3 + 24}px;
                height: 8px;
                top: ${cellSize / 2}px;
                left: ${cellSize * 0.1}px;
            `;
        } else if (pattern[0] === 3 && pattern[2] === 5) {
            // Middle row
            lineStyle = `
                width: ${cellSize * 3 + 24}px;
                height: 8px;
                top: ${cellSize * 1.5 + 12}px;
                left: ${cellSize * 0.1}px;
            `;
        } else if (pattern[0] === 6 && pattern[2] === 8) {
            // Bottom row
            lineStyle = `
                width: ${cellSize * 3 + 24}px;
                height: 8px;
                top: ${cellSize * 2.5 + 24}px;
                left: ${cellSize * 0.1}px;
            `;
        } else if (pattern[0] === 0 && pattern[2] === 6) {
            // Left column
            lineStyle = `
                width: 8px;
                height: ${cellSize * 3 + 24}px;
                left: ${cellSize / 2}px;
                top: ${cellSize * 0.1}px;
            `;
        } else if (pattern[0] === 1 && pattern[2] === 7) {
            // Middle column
            lineStyle = `
                width: 8px;
                height: ${cellSize * 3 + 24}px;
                left: ${cellSize * 1.5 + 12}px;
                top: ${cellSize * 0.1}px;
            `;
        } else if (pattern[0] === 2 && pattern[2] === 8) {
            // Right column
            lineStyle = `
                width: 8px;
                height: ${cellSize * 3 + 24}px;
                left: ${cellSize * 2.5 + 24}px;
                top: ${cellSize * 0.1}px;
            `;
        }
        
        winningLine.style.cssText = lineStyle;
        winningLine.style.opacity = '1';
    }

    // Update player turn display
    function updatePlayerTurn() {
        playerTurnElement.querySelector('span').textContent = `Player ${currentPlayer}'s Turn`;
        playerTurnElement.style.background = currentPlayer === 'X' ? '#3498db' : '#e74c3c';
    }

    // Show message
    function showMessage(text) {
        messageText.textContent = text;
        messageOverlay.classList.add('active');
    }

    // Hide message
    function hideMessage() {
        messageOverlay.classList.remove('active');
        winningLine.style.opacity = '0';
    }

    // Restart game (reset board but keep scores)
    function restartGame() {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        currentPlayer = 'X';
        
        cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'win');
        });
        
        updatePlayerTurn();
        hideMessage();
    }

    // New game (reset everything)
    function newGame() {
        scores = {
            'X': 0,
            'O': 0,
            'tie': 0
        };
        
        scoreXElement.querySelector('span:last-child').textContent = '0';
        scoreOElement.querySelector('span:last-child').textContent = '0';
        scoreTieElement.querySelector('span:last-child').textContent = '0';
        
        restartGame();
    }

    // Switch between PvP and PvC modes
    function switchMode(mode) {
        gameMode = mode;
        
        if (mode === 'pvp') {
            pvpBtn.classList.add('active');
            pvcBtn.classList.remove('active');
            difficultyContainer.style.display = 'none';
        } else {
            pvpBtn.classList.remove('active');
            pvcBtn.classList.add('active');
            difficultyContainer.style.display = 'flex';
        }
        
        restartGame();
    }

    // Initialize the game
    initGame();
});