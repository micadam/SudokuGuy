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

export {
    validateBoard,
};