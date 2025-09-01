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
        
        const player1Input = document.getElementById('player1');
        const player2Input = document.getElementById('player2');
        
        player1Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                player2Input.focus();
            }
        });
        
        player2Input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
        
        this.cleanOldHistory();
    }

    startGame() {
        const p1 = document.getElementById('player1').value.trim() || 'Player 1';
        const p2 = document.getElementById('player2').value.trim() || 'Player 2';
        
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
        
        for (let i = 0; i < 9; i++) {
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

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
            return false;
        });
    }

    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                this.cells[index].classList.add('winner');
            });
            this.drawWinLine();
        }
    }
    
    drawWinLine() {
        const winLine = document.getElementById('winLine');
        winLine.className = 'win-line';
        
        const [a, b, c] = this.winningPattern;
        
        if (a === 0 && b === 1 && c === 2) winLine.classList.add('row-0');
        else if (a === 3 && b === 4 && c === 5) winLine.classList.add('row-1');
        else if (a === 6 && b === 7 && c === 8) winLine.classList.add('row-2');
        else if (a === 0 && b === 3 && c === 6) winLine.classList.add('col-0');
        else if (a === 1 && b === 4 && c === 7) winLine.classList.add('col-1');
        else if (a === 2 && b === 5 && c === 8) winLine.classList.add('col-2');
        else if (a === 0 && b === 4 && c === 8) winLine.classList.add('diag-0');
        else if (a === 2 && b === 4 && c === 6) winLine.classList.add('diag-1');
        
        setTimeout(() => {
            winLine.classList.add('show');
        }, 100);
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    restart() {
        this.board = Array(9).fill(null);
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
}

new TicTacToe();