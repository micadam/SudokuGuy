const cellToString = function(row, col) {
    return `${row},${col}`;
}

const stringToCell = function(str) {
    const [row, col] = str.split(',');
    return [parseInt(row), parseInt(col)];
}

class Board {
    constructor(board, numSquares, squareSize) {
        this.board = board.map(row => row.slice());
        this.numSquares = numSquares;
        this.squareSize = squareSize;
        this.size = numSquares * squareSize;
        this.validNumbers = new Array(this.size).fill().map((_, i) => String(i + 1));
        this.rowUnits = new Array(this.size).fill(0).map(() => new Set());
        this.columnUnits = new Array(this.size).fill(0).map(() => new Set());
        this.squareUnits = new Array(this.size).fill(0).map(() => new Set());
        this.allUnits = [...this.rowUnits, ...this.columnUnits, ...this.squareUnits];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.rowUnits[i].add(cellToString(i, j));
                this.columnUnits[j].add(cellToString(i, j));
            }
        }
        for (let i = 0; i < this.numSquares; i++) {
            for (let j = 0; j < this.numSquares; j++) {
                const x = i * this.squareSize;
                const y = j * this.squareSize;
                for (let k = 0; k < this.squareSize; k++) {
                    for (let l = 0; l < this.squareSize; l++) {
                        this.squareUnits[numSquares * i + j].add(cellToString(x + k, y + l));
                    }
                }
            }
        }
        this.numbersInUnits = new Array(3 * this.size).fill(0).map(() => new Set());
        for (let i = 0; i < this.allUnits.length; i++) {
            for (let unit of this.allUnits[i]) {
                let [row, col] = stringToCell(unit);
                this.numbersInUnits[i].add(this.board[row][col]);
            }
        }
        this.allUnits = [...this.rowUnits, ...this.columnUnits, ...this.squareUnits];
    }

    placeNumber(row, col, number) {
        const squareIndex = Math.floor(row / this.squareSize) * this.numSquares + Math.floor(col / this.squareSize);
        this.board[row][col] = number;
        this.numbersInUnits[row].add(number);
        this.numbersInUnits[this.size + col].add(number);
        this.numbersInUnits[2 * this.size + squareIndex].add(number);
    }
}

class Move {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
    }
}

/**
 * A Sudoku strategy that looks at each cell in turn, and checks if it legally can
 * only be one number. If so, it will fill in that number.
 * @param {*} board
 */
const oneMissingFromUnit = function(board) {
    const moves = [];
    for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
            if (board.board[i][j] === '.') {
                const squareIndex = Math.floor(i / board.squareSize) * board.numSquares + Math.floor(j / board.squareSize);
                const missing = board.validNumbers.filter(num => !board.numbersInUnits[i].has(num)
                    && !board.numbersInUnits[board.size + j].has(num)
                    && !board.numbersInUnits[2 * board.size + squareIndex].has(num));
                if (missing.length === 1) {
                    moves.push(new Move(i, j, missing[0]));
                }
            }
        }
    }
    return moves;
}

const SudokuStrategies = [
    oneMissingFromUnit,
];

const solve = function(rawBoard, numSquares, squareSize) {
    const board = new Board(rawBoard, numSquares, squareSize);
    let numMissingSquares = rawBoard.reduce((acc, row) => acc + row.filter(cell => cell === '.').length, 0);
    let moveMade = true;
    while (moveMade && numMissingSquares > 0) {
        moveMade = false;
        for (let strategy of SudokuStrategies) {
            const moves = strategy(board, numSquares, squareSize);
            if (moves.length > 0) {
                const move = moves[0];
                board.placeNumber(move.row, move.col, move.value);
                moveMade = true;
                numMissingSquares--;
                break;
            }
        }
    }
    console.log(`${numMissingSquares} squares left to fill`);
    return board.board;
}

const step = function(rawBoard, numSquares, squareSize) {
    const board = new Board(rawBoard, numSquares, squareSize);
    for (let strategy of SudokuStrategies) {
        const moves = strategy(board, numSquares, squareSize);
        if (moves.length > 0) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            board.placeNumber(move.row, move.col, move.value);
            break;
        }
    }
    return board.board;
}

export {solve, step};