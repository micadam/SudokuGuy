const validateBoard = function(board, empty_char, num_squares, square_size) {
    const size = num_squares * square_size;
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
    for (let i = 0; i < num_squares; i += 1) {
        for (let j = 0; j < num_squares; j += 1) {
            const x = i * square_size;
            const y = j * square_size;
            const square_elements = new Set();
            for (let k = 0; k < square_size; k++) {
                for (let l = 0; l < square_size; l++) {
                    const value = board[x + k][y + l];
                    if (value !== empty_char && square_elements.has(value)) {
                        squareViolations.add(num_squares * i + j);
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

const fillBoard = function(num_squares, square_size) {
    const size = num_squares * square_size;
    const board = new Array(size).fill().map(() => new Array(size).fill(0));
    const validNumbers = new Array(size).fill().map((_, i) => String(i + 1));
    const numbersInColumns = new Array(size).fill(0).map(() => new Set());
    const numbersInRows = new Array(size).fill(0).map(() => new Set());
    const numbersInSquares = new Array(size).fill(0).map(() => new Set());
    fillBoardRecurse(0, 0 , num_squares, square_size, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares);
    return board;
}

const fillBoardRecurse = function(row, column, num_squares, square_size, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares, depth=0) {
    depth = depth + 1;
    const size = num_squares * square_size;
    if (row === size) {
        return OK;
    }
    const squareIndex = Math.floor(row / square_size) * num_squares + Math.floor(column / square_size);
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
        result = fillBoardRecurse(nextRow, nextColumn, num_squares, square_size, board, validNumbers, numbersInColumns, numbersInRows, numbersInSquares, depth);
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

export {
    validateBoard,
    fillBoard
};