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

    getSquareIndex(row, col) {
        return Math.floor(row / this.squareSize) * this.numSquares + Math.floor(col / this.squareSize);
    }

    getPossibleNumbers(row, col) {
        return new Set(this.validNumbers.filter(num => !this.numbersInUnits[row].has(num) &&
                !this.numbersInUnits[this.size + col].has(num) &&
                !this.numbersInUnits[2 * this.size + this.getSquareIndex(row, col)].has(num)));
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
    constructor(row, col, value, source) {
        this.row = row;
        this.col = col;
        this.value = value;
        this.source = source;
    }

    static fromString(str) {
        const [row, col, value, source] = str.split(',');
        return new Move(parseInt(row), parseInt(col), value, source);
    }

    static str(row, col, value, source) {
        return `${row},${col},${value},${source}`;
    }
}

/**
 * A Sudoku strategy that looks at each cell in turn, and checks if it legally can
 * only be one number. If so, it will fill in that number.
 */
const oneMissingFromUnit = function(board) {
    const source = "oneMissingFromUnit";
    const moves = [];
    for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
            if (board.board[i][j] !== '.') {
                continue;
            }
            const possibleNumbers = board.getPossibleNumbers(i, j);
            if (possibleNumbers.size === 1) {
                moves.push(Move.str(i, j, [...possibleNumbers][0], source));
            }
        }
    }
    return moves;
}

/**
 * A sudoku strategy that for each cell, for each possible number there, checks if
 * it is the only possible cell for that number in that unit.
 */
const cantBeAnywhereElseInUnit = function(board) {
    const source = "cantBeAnywhereElseInUnit";
    const moves = [];
    const possibleNumbers = board.board.map((row, i) => row.map((_, j) => board.getPossibleNumbers(i, j)));

    for (let i = 0; i < board.size; i++) {
        for (let j = 0; j < board.size; j++) {
            if (board.board[i][j] !== '.') {
                continue;
            }
            const possible = possibleNumbers[i][j];
            for (let num of possible) {
                const unitGroups = [board.rowUnits[i], board.columnUnits[j], board.squareUnits[board.getSquareIndex(i, j)]];
                for (let unitGroup of unitGroups) {
                    for (let unit of unitGroup) {
                        let numInUnit = 0;
                        const [row, col] = stringToCell(unit);
                        if (possibleNumbers[row][col].has(num)) {
                            numInUnit++;
                        }
                        if (numInUnit === 1) {
                            moves.push(Move.str(i, j, num, source));
                        }
                    }
                }
            }
        }
    }
    return moves;
}


const SudokuStrategies = [
    oneMissingFromUnit,
    cantBeAnywhereElseInUnit,
];

const solve = function(rawBoard, numSquares, squareSize, log=false) {
    if (log) {
        console.log("Solving...");
    }
    const board = new Board(rawBoard, numSquares, squareSize);
    let numMissingSquares = rawBoard.reduce((acc, row) => acc + row.filter(cell => cell === '.').length, 0);
    let moveMade = true;
    while (moveMade && numMissingSquares > 0) {
        moveMade = false;
        for (let strategy of SudokuStrategies) {
            const moves = strategy(board, numSquares, squareSize);
            if (moves.length > 0) {
                const randomIndex = Math.floor(Math.random() * moves.length);
                const move = Move.fromString(moves[randomIndex]);
                if (log) {
                    console.log(`${move.source}: ${Move.str(move.row, move.col, move.value)}`);
                }
                board.placeNumber(move.row, move.col, move.value);
                moveMade = true;
                numMissingSquares--;
                break;
            }
        }
    }
    return board.board;
}

const step = function(rawBoard, numSquares, squareSize) {
    const board = new Board(rawBoard, numSquares, squareSize);
    for (let strategy of SudokuStrategies) {
        const moves = strategy(board, numSquares, squareSize);
        if (moves.length > 0) {
            const move = Move.fromString(moves[Math.floor(Math.random() * moves.length)]);
            board.placeNumber(move.row, move.col, move.value);
            break;
        }
    }
    return board.board;
}

export {solve, step};