import * as SudokuStrategies from "./SudokuStrategies";

const validateBoard = function(board, empty_char, numSquares, squareSize) {
    const size = numSquares * squareSize;
    const rowViolations = new Set();
    const columnViolations = new Set();
    const squareViolations = new Set();

    for (let i = 0; i < size; i++) {
        const row_elements = new Set();
        const column_elements = new Set();
        for (let j = 0; j < size; j++) {
            if (board[i][j] !== empty_char && row_elements.has(board[i][j])) {
                rowViolations.add(i);
            }
            if (board[j][i] !== empty_char && column_elements.has(board[j][i])) {
                columnViolations.add(i);
            }
            row_elements.add(board[i][j]);
            column_elements.add(board[j][i]);
        }
    }
    for (let i = 0; i < numSquares; i += 1) {
        for (let j = 0; j < numSquares; j += 1) {
            const x = i * squareSize;
            const y = j * squareSize;
            const square_elements = new Set();
            for (let k = 0; k < squareSize; k++) {
                for (let l = 0; l < squareSize; l++) {
                    const value = board[x + k][y + l];
                    if (value !== empty_char && square_elements.has(value)) {
                        squareViolations.add(numSquares * i + j);
                    }
                    square_elements.add(board[x + k][y + l]);
                }
            }
        }
    }
    return {
        rowViolations: rowViolations,
        columnViolations: columnViolations,
        squareViolations: squareViolations,
    };
}

const OK = 0;
const INVALID_BOARD = 1;

const fillBoard = function(numSquares, squareSize) {
    const size = numSquares * squareSize;
    const board = new Array(size).fill().map(() => new Array(size).fill(''));
    const validNumbers = new Array(size).fill().map((_, i) => String(i + 1));
    const numbersInColumns = new Array(size).fill(0).map(() => new Set());
    const numbersInRows = new Array(size).fill(0).map(() => new Set());
    const numbersInSquares = new Array(size).fill(0).map(() => new Set());
    fillBoardRecurse(0, 0 , numSquares, squareSize, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares);
    return board;
}

const fillBoardRecurse = function(row, column, numSquares, squareSize, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares, depth=0) {
    depth = depth + 1;
    const size = numSquares * squareSize;
    if (row === size) {
        return OK;
    }
    const squareIndex = Math.floor(row / squareSize) * numSquares + Math.floor(column / squareSize);
    const nextColumn = column === size - 1 ? 0 : column + 1;
    const nextRow = nextColumn === 0 ? row + 1 : row;
    let possibleNumbers = validNumbers.filter(number =>
        !numbersInColumns[column].has(number) && !numbersInRows[row].has(number) && !numbersInSquares[squareIndex].has(number));
    let result = INVALID_BOARD;
    while (possibleNumbers.length > 0 && result === INVALID_BOARD) {
        // Set current row and column to new number
        let randomIndex = Math.floor(Math.random() * possibleNumbers.length);
        let number = possibleNumbers[randomIndex];
        possibleNumbers.splice(randomIndex, 1);
        board[row][column] = number;
        numbersInColumns[column].add(number);
        numbersInRows[row].add(number);
        numbersInSquares[squareIndex].add(number);
        result = fillBoardRecurse(nextRow, nextColumn, numSquares, squareSize, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares, depth);
        if (result === OK) {
            return OK;
        }
        // Remove current row and column from used numbers
        numbersInColumns[column].delete(board[row][column]);
        numbersInRows[row].delete(board[row][column]);
        numbersInSquares[squareIndex].delete(board[row][column]);
    }
    return result;
}

const boardsEqual = function(board, board2) {
    if (board.length !== board2.length) {
        return false;
    }
    for (let i = 0; i < board.length; i++) {
        if (board[i].length !== board2[i].length) {
            return false;
        }
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== board2[i][j]) {
                return false;
            }
        }
    }
    return true;
}

const copyBoard = function(board) {
    return board.map(row => row.slice());
}

const removeUntilUnsolvable = function(board, numSquares, squareSize) {
    let solvable = true;
    const size = numSquares * squareSize;
    const boardCopy = copyBoard(board);
    let lastSolvable = copyBoard(board);
    const allCells = new Array(size * size).fill().map((_, i) => [Math.floor(i / size), i % size]);
    while (solvable) {
        // array of row, column pairs
        let solved = false;
        board = copyBoard(lastSolvable);
        while (allCells.length > 0 && !solved) {
            const randomIndex = Math.floor(Math.random() * allCells.length);
            const [row, col] = allCells[randomIndex];
            board[row][col] = '.';
            allCells.splice(randomIndex, 1);
            let newBoard = SudokuStrategies.solve(board, numSquares, squareSize);
            solved = boardsEqual(boardCopy, newBoard);
        }
        if (solved) {
            lastSolvable = copyBoard(board);
        } else {
            solvable = false;
        }
    }
    console.log(lastSolvable);
    return lastSolvable;
}

export {
    validateBoard,
    fillBoard,
    removeUntilUnsolvable,
};