class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells = [];
        this.player1Name = '';
        this.player2Name = '';
        this.player1Score = 0;
        this.player2Score = 0;
        this.gameHistory = this.loadHistory();
        this.isVsBot = false;
        this.botDifficulty = 'hard';
        this.boardSize = 3;
        this.winCondition = 3;
        this.init();
    }

    init() {
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('restart').addEventListener('click', () => this.restart());
        document.getElementById('resetScore').addEventListener('click', () => this.resetScore());
        document.getElementById('showHistory').addEventListener('click', () => this.showHistory());
        document.getElementById('closeHistory').addEventListener('click', () => this.closeHistory());
        document.getElementById('playAgain').addEventListener('click', () => this.playAgain());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());
        document.getElementById('backToModes').addEventListener('click', () => this.backToModes());
        document.getElementById('humanVsHuman').addEventListener('click', () => this.setGameMode(false));
        document.getElementById('humanVsBot').addEventListener('click', () => this.setGameMode(true));
        
        // Board size selection
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBoardSize(parseInt(e.target.dataset.size)));
        });
        
        const player1Input = document.getElementById('player1');
        const player2Input = document.getElementById('player2');
        
        player1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (!this.isVsBot) {
                    player2Input.focus();
                } else {
                    this.startGame();
                }
            }
        });
        
        player2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
        
        this.cleanOldHistory();
    }
    
    setGameMode(vsBot) {
        this.isVsBot = vsBot;
        const humanBtn = document.getElementById('humanVsHuman');
        const botBtn = document.getElementById('humanVsBot');
        const player2Input = document.getElementById('player2');
        const boardSizeSelection = document.getElementById('boardSizeSelection');
        
        if (vsBot) {
            humanBtn.classList.remove('active');
            botBtn.classList.add('active');
            player2Input.style.display = 'none';
            player2Input.value = 'Bot';
        } else {
            botBtn.classList.remove('active');
            humanBtn.classList.add('active');
            player2Input.style.display = 'block';
            player2Input.value = '';
            player2Input.placeholder = 'Player 2 (O)';
        }
        
        // Show board size selection after mode is chosen
        boardSizeSelection.style.display = 'block';
    }
    
    setBoardSize(size) {
        this.boardSize = size;
        this.winCondition = size === 3 ? 3 : 4;
        
        // Update active button
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.size) === size) {
                btn.classList.add('active');
            }
        });
    }

    startGame() {
        const p1 = document.getElementById('player1').value.trim() || 'Player 1';
        const p2 = this.isVsBot ? '🤖 Bot' : (document.getElementById('player2').value.trim() || 'Player 2');
        
        this.player1Name = p1;
        this.player2Name = p2;
        
        // Load history for these players
        this.gameHistory = this.loadHistoryForPlayers(p1, p2);
        
        const savedScore = this.loadScore();
        if (savedScore && this.isSamePlayerPair(savedScore.p1, savedScore.p2, p1, p2)) {
            this.player1Score = savedScore.score1;
            this.player2Score = savedScore.score2;
        }
        
        document.getElementById('playerSetup').style.display = 'none';
        document.getElementById('gameArea').style.display = 'block';
        
        this.updateScore();
        this.createBoard();
        this.updateStatus(`${this.getCurrentPlayerName()}'s turn`);
    }

    getCurrentPlayerName() {
        return this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '<div class="win-line" id="winLine"></div>';
        this.cells = [];
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        
        // Update board CSS grid and size class
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        boardElement.className = `board size-${this.boardSize}`;
        
        // Update board info
        const winText = this.winCondition === 3 ? '3 in a row' : '4 in a row';
        document.getElementById('boardInfo').textContent = `${this.boardSize}x${this.boardSize} - ${winText}`;
        
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            boardElement.appendChild(cell);
            this.cells.push(cell);
        }
    }

    handleCellClick(index) {
        if (this.board[index] || !this.gameActive) return;

        this.makeMove(index);
        
        if (this.gameActive && this.isVsBot && this.currentPlayer === 'O') {
            setTimeout(() => {
                this.makeBotMove();
            }, 500);
        }
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase(), 'taken');

        if (this.checkWinner()) {
            const winner = this.getCurrentPlayerName();
            this.updateStatus(`🎉 ${winner} wins! 🎉`);
            this.gameActive = false;
            this.highlightWinningCells();
            
            if (this.currentPlayer === 'X') {
                this.player1Score++;
            } else {
                this.player2Score++;
            }
            
            this.updateScore();
            this.saveScore();
            this.addToHistory(winner, 'win');
            this.showEndOptions();
            
        } else if (this.board.every(cell => cell)) {
            this.updateStatus("🤝 It's a draw! 🤝");
            this.gameActive = false;
            this.addToHistory('Draw', 'draw');
            this.showEndOptions();
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus(`${this.getCurrentPlayerName()}'s turn`);
        }
    }
    
    makeBotMove() {
        if (!this.gameActive) return;
        
        const bestMove = this.getBestMove();
        if (bestMove !== -1) {
            this.makeMove(bestMove);
        }
    }
    
    getBestMove() {
        // For larger boards, use balanced strategy
        if (this.boardSize > 3) {
            return this.getBalancedMove();
        }
        
        // For 3x3, use pure minimax (nearly unbeatable)
        if (Math.random() < 0.05) {
            return this.getRandomMove();
        }
        
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    getBalancedMove() {
        const totalCells = this.boardSize * this.boardSize;
        const availableMoves = [];
        
        // Get all available moves
        for (let i = 0; i < totalCells; i++) {
            if (this.board[i] === null) {
                availableMoves.push(i);
            }
        }
        
        if (availableMoves.length === 0) return -1;
        
        // 15% chance to make a random move (bot wins/draws 80%)
        if (Math.random() < 0.15) {
            return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        
        // Shuffle available moves to avoid always picking position 0
        const shuffledMoves = [...availableMoves].sort(() => Math.random() - 0.5);
        
        // Try to win first
        for (const move of shuffledMoves) {
            this.board[move] = 'O';
            if (this.checkWinner()) {
                this.board[move] = null;
                return move;
            }
            this.board[move] = null;
        }
        
        // Block opponent from winning (95% of the time)
        if (Math.random() < 0.95) {
            for (const move of shuffledMoves) {
                this.board[move] = 'X';
                if (this.checkWinner()) {
                    this.board[move] = null;
                    return move;
                }
                this.board[move] = null;
            }
        }
        
        // Strategic positions with randomization
        const center = Math.floor(totalCells / 2);
        const size = this.boardSize;
        const corners = [];
        const edges = [];
        
        for (const move of availableMoves) {
            const row = Math.floor(move / size);
            const col = move % size;
            
            if (move === center && Math.random() < 0.8) {
                return move;
            } else if ((row === 0 || row === size - 1) && (col === 0 || col === size - 1)) {
                corners.push(move);
            } else {
                edges.push(move);
            }
        }
        
        // Prefer corners (70% chance)
        if (corners.length > 0 && Math.random() < 0.7) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        // Return random available move
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    getRandomMove() {
        const availableMoves = [];
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            if (this.board[i] === null) {
                availableMoves.push(i);
            }
        }
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    minimax(board, depth, isMaximizing) {
        const result = this.checkWinnerForMinimax(board);
        
        if (result === 'O') return 10 - depth;
        if (result === 'X') return depth - 10;
        if (board.every(cell => cell !== null)) return 0;
        
        const totalCells = this.boardSize * this.boardSize;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < totalCells; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < totalCells; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    checkWinnerForMinimax(board) {
        // Save current state
        const originalBoard = [...this.board];
        const originalWinningPattern = this.winningPattern;
        
        // Temporarily set board for checking
        this.board = board;
        const hasWinner = this.checkWinner();
        let winner = null;
        
        if (hasWinner && this.winningPattern) {
            winner = board[this.winningPattern[0]];
        }
        
        // Restore original state
        this.board = originalBoard;
        this.winningPattern = originalWinningPattern;
        
        return winner;
    }

    checkWinner() {
        const size = this.boardSize;
        const winLength = this.winCondition;
        
        // Check all possible winning patterns
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const index = row * size + col;
                if (!this.board[index]) continue;
                
                // Check horizontal
                if (col <= size - winLength) {
                    const pattern = [];
                    let isWin = true;
                    for (let i = 0; i < winLength; i++) {
                        const checkIndex = row * size + col + i;
                        pattern.push(checkIndex);
                        if (this.board[checkIndex] !== this.board[index]) {
                            isWin = false;
                            break;
                        }
                    }
                    if (isWin) {
                        this.winningPattern = pattern;
                        return true;
                    }
                }
                
                // Check vertical
                if (row <= size - winLength) {
                    const pattern = [];
                    let isWin = true;
                    for (let i = 0; i < winLength; i++) {
                        const checkIndex = (row + i) * size + col;
                        pattern.push(checkIndex);
                        if (this.board[checkIndex] !== this.board[index]) {
                            isWin = false;
                            break;
                        }
                    }
                    if (isWin) {
                        this.winningPattern = pattern;
                        return true;
                    }
                }
                
                // Check diagonal (top-left to bottom-right)
                if (row <= size - winLength && col <= size - winLength) {
                    const pattern = [];
                    let isWin = true;
                    for (let i = 0; i < winLength; i++) {
                        const checkIndex = (row + i) * size + col + i;
                        pattern.push(checkIndex);
                        if (this.board[checkIndex] !== this.board[index]) {
                            isWin = false;
                            break;
                        }
                    }
                    if (isWin) {
                        this.winningPattern = pattern;
                        return true;
                    }
                }
                
                // Check diagonal (top-right to bottom-left)
                if (row <= size - winLength && col >= winLength - 1) {
                    const pattern = [];
                    let isWin = true;
                    for (let i = 0; i < winLength; i++) {
                        const checkIndex = (row + i) * size + col - i;
                        pattern.push(checkIndex);
                        if (this.board[checkIndex] !== this.board[index]) {
                            isWin = false;
                            break;
                        }
                    }
                    if (isWin) {
                        this.winningPattern = pattern;
                        return true;
                    }
                }
            }
        }
        return false;
    }

    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                this.cells[index].classList.add('winner');
            });
            // Only draw win line for 3-in-a-row (3x3 board)
            if (this.winCondition === 3) {
                this.drawWinLine();
            }
        }
    }
    
    drawWinLine() {
        const winLine = document.getElementById('winLine');
        winLine.className = 'win-line';
        
        const pattern = this.winningPattern;
        const size = this.boardSize;
        
        // Calculate line position and direction
        const startRow = Math.floor(pattern[0] / size);
        const startCol = pattern[0] % size;
        const endRow = Math.floor(pattern[pattern.length - 1] / size);
        const endCol = pattern[pattern.length - 1] % size;
        
        // Determine line type
        if (startRow === endRow) {
            // Horizontal line
            const rowPercent = (startRow + 0.5) / size * 100;
            const colStartPercent = (startCol + 0.5) / size * 100;
            const colEndPercent = (endCol + 0.5) / size * 100;
            const widthPercent = Math.abs(colEndPercent - colStartPercent);
            
            winLine.style.top = `${rowPercent}%`;
            winLine.style.left = `${Math.min(colStartPercent, colEndPercent)}%`;
            winLine.style.width = `${widthPercent}%`;
            winLine.style.height = '6px';
            winLine.style.transform = 'translateY(-50%)';
            winLine.classList.add('horizontal');
            
        } else if (startCol === endCol) {
            // Vertical line
            const colPercent = (startCol + 0.5) / size * 100;
            const rowStartPercent = (startRow + 0.5) / size * 100;
            const rowEndPercent = (endRow + 0.5) / size * 100;
            const heightPercent = Math.abs(rowEndPercent - rowStartPercent);
            
            winLine.style.left = `${colPercent}%`;
            winLine.style.top = `${Math.min(rowStartPercent, rowEndPercent)}%`;
            winLine.style.width = '6px';
            winLine.style.height = `${heightPercent}%`;
            winLine.style.transform = 'translateX(-50%)';
            winLine.classList.add('vertical');
            
        } else {
            // Diagonal line
            const centerRow = (startRow + endRow) / 2 + 0.5;
            const centerCol = (startCol + endCol) / 2 + 0.5;
            const centerRowPercent = centerRow / size * 100;
            const centerColPercent = centerCol / size * 100;
            
            const length = Math.sqrt(Math.pow(endRow - startRow, 2) + Math.pow(endCol - startCol, 2)) + 1;
            const lengthPercent = (length / size) * 100;
            
            const angle = Math.atan2(endRow - startRow, endCol - startCol) * 180 / Math.PI;
            
            winLine.style.top = `${centerRowPercent}%`;
            winLine.style.left = `${centerColPercent}%`;
            winLine.style.width = `${lengthPercent}%`;
            winLine.style.height = '6px';
            winLine.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            winLine.classList.add('diagonal');
        }
        
        setTimeout(() => {
            winLine.classList.add('show');
        }, 100);
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    restart() {
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningPattern = null;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        const winLine = document.getElementById('winLine');
        winLine.className = 'win-line';
        
        this.updateStatus(`${this.getCurrentPlayerName()}'s turn`);
    }
    
    updateScore() {
        document.getElementById('score').textContent = `${this.player1Name}: ${this.player1Score} - ${this.player2Name}: ${this.player2Score}`;
    }
    
    resetScore() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.updateScore();
        this.saveScore();
        this.gameHistory = [];
        this.saveHistory();
    }
    
    saveScore() {
        const scoreData = {
            p1: this.player1Name,
            p2: this.player2Name,
            score1: this.player1Score,
            score2: this.player2Score,
            timestamp: Date.now()
        };
        localStorage.setItem('ticTacToeScore', JSON.stringify(scoreData));
    }
    
    loadScore() {
        const saved = localStorage.getItem('ticTacToeScore');
        if (saved) {
            const data = JSON.parse(saved);
            if (Date.now() - data.timestamp < 3600000) {
                return data;
            } else {
                localStorage.removeItem('ticTacToeScore');
            }
        }
        return null;
    }
    
    addToHistory(result, type) {
        const historyItem = {
            player1: this.player1Name,
            player2: this.player2Name,
            result: result,
            type: type,
            score1: this.player1Score,
            score2: this.player2Score,
            timestamp: Date.now()
        };
        
        this.gameHistory.unshift(historyItem);
        if (this.gameHistory.length > 20) {
            this.gameHistory = this.gameHistory.slice(0, 20);
        }
        
        this.saveHistory();
    }
    
    saveHistory() {
        localStorage.setItem('ticTacToeHistory', JSON.stringify(this.gameHistory));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('ticTacToeHistory');
        return saved ? JSON.parse(saved) : [];
    }
    
    loadHistoryForPlayers(p1, p2) {
        const allHistory = this.loadHistory();
        return allHistory.filter(item => 
            this.isSamePlayerPair(item.player1, item.player2, p1, p2)
        );
    }
    
    isSamePlayerPair(saved1, saved2, current1, current2) {
        return (saved1 === current1 && saved2 === current2) || 
               (saved1 === current2 && saved2 === current1);
    }
    
    cleanOldHistory() {
        const oneHour = 3600000;
        const allHistory = this.loadHistory();
        const cleanHistory = allHistory.filter(item => 
            Date.now() - item.timestamp < oneHour
        );
        localStorage.setItem('ticTacToeHistory', JSON.stringify(cleanHistory));
        this.gameHistory = this.loadHistoryForPlayers(this.player1Name, this.player2Name);
    }
    
    showHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (this.gameHistory.length === 0) {
            historyList.innerHTML = '<div class="history-item">No games played yet</div>';
        } else {
            this.gameHistory.forEach(item => {
                const timeStr = new Date(item.timestamp).toLocaleTimeString();
                const resultText = item.type === 'draw' ? 'Draw' : `${item.result} won`;
                const scoreText = `${item.player1}: ${item.score1} - ${item.player2}: ${item.score2}`;
                
                historyList.innerHTML += `
                    <div class="history-item">
                        <div>${timeStr} - ${resultText}</div>
                        <div style="font-size: 0.8em; opacity: 0.8;">${scoreText}</div>
                    </div>
                `;
            });
        }
        
        document.getElementById('historyModal').style.display = 'flex';
    }
    
    closeHistory() {
        document.getElementById('historyModal').style.display = 'none';
    }
    
    showEndOptions() {
        setTimeout(() => {
            document.getElementById('gameEndOverlay').style.display = 'flex';
        }, 1500);
    }
    
    playAgain() {
        document.getElementById('gameEndOverlay').style.display = 'none';
        this.restart();
    }
    
    backToSetup() {
        document.getElementById('gameEndOverlay').style.display = 'none';
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('playerSetup').style.display = 'block';
        document.getElementById('player1').value = '';
        document.getElementById('player2').value = '';
        
        // Reset game state completely
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells = [];
        this.player1Name = '';
        this.player2Name = '';
        this.player1Score = 0;
        this.player2Score = 0;
        this.winningPattern = null;
        
        // Don't clear localStorage - keep history for same players
        this.gameHistory = this.loadHistory();
    }
    
    backToModes() {
        // Hide game area and show player setup
        document.getElementById('gameArea').style.display = 'none';
        document.getElementById('playerSetup').style.display = 'block';
        
        // Reset input fields
        document.getElementById('player1').value = '';
        document.getElementById('player2').value = '';
        
        // Reset game mode to default (Human vs Human)
        this.setGameMode(false);
        
        // Reset game state
        this.board = Array(this.boardSize * this.boardSize).fill(null);
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells = [];
        this.player1Name = '';
        this.player2Name = '';
        this.winningPattern = null;
        
        // Keep scores and history for continuity
    }
}

new TicTacToe();