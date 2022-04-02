import React  from "react";
import SudokuCell from "./SudokuCell";

import * as SudokuUtils from "./SudokuUtils";

import "./SudokuGame.css";

const SQUARE_SIZE = 3;
const NUM_SQUARES = 3;
const SIZE = SQUARE_SIZE * NUM_SQUARES;
const EMPTY_SET = new Set();
const EMPTY_VIOLATIONS = {
    rowViolations: EMPTY_SET,
    columnViolations: EMPTY_SET,
    squareViolations: EMPTY_SET
}

const EMPTY = "";
const ALLOWED_VALUES = [EMPTY, "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export default class SudokuGame extends React.Component {
    constructor(props) {
        super(props);
        const board = this.createBoard();
        this.state = {
            board: board,
            autocheck: true,
            violations: EMPTY_VIOLATIONS,
            complete: false,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleAutoCheckChange = this.handleAutoCheckChange.bind(this);
    }

    updateViolations() {
        const violations = SudokuUtils.validateBoard(this.state.board, EMPTY, NUM_SQUARES, SQUARE_SIZE);
        this.setState({
            violations: violations,
        });
    }

    handleChange(row, column, event) {
        let value;
        if (event.nativeEvent.inputType === "deleteContentBackward") {
            value = "";
        } else {
            value = event.target.value[event.target.value.length - 1]
        }
        console.log(event);
        console.log(value);
        const board = this.state.board;
        if (!ALLOWED_VALUES.includes(value)) {
            return;
        }
        board[row][column] = value;
        this.setState({
            board: board,
        });
        if (this.state.autocheck) {
            this.updateViolations();
        }
        this.updateCompletion();
    }

    handleAutoCheckChange(event) {
        const value = event.target.checked;
        console.log(value);
        let violations;
        if (value) {
            violations = SudokuUtils.validateBoard(this.state.board, EMPTY, NUM_SQUARES, SQUARE_SIZE);
        } else {
            violations = EMPTY_VIOLATIONS;
        }
        this.setState({
            autocheck: value,
            violations: violations,
        });
    }

    isFilled() {
        const board = this.state.board;
        for (let i = 0; i < SIZE; i++) {
            for (let j = 0; j < SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    updateCompletion() {
        const board = this.state.board;
        if (!this.isFilled()) {
            this.setState({
                complete: false,
            });
            return;
        }
        const violations = SudokuUtils.validateBoard(board, EMPTY, NUM_SQUARES, SQUARE_SIZE);
        const violationsExist = (violations.rowViolations.size !== 0 || violations.columnViolations.size !== 0
            || violations.squareViolations.size !== 0)
        this.setState({
            complete: !violationsExist,
        });

    }

    renderSquareWithCells(cells) {
        return (
            <div className="board-square" key={cells[0].key}>
                {cells}
            </div>
        );
    }


    render() {
        const board = this.state.board;
        const {rowViolations, columnViolations, squareViolations} = this.state.violations;
        const complete = this.state.complete;
        const squares = []
        for (let i = 0; i < NUM_SQUARES; i++) {
            for (let j = 0; j < NUM_SQUARES; j++) {
                const cellsInSquare = [];
                for (let k = 0; k < SQUARE_SIZE; k++) {
                    for (let l = 0; l < SQUARE_SIZE; l++) {
                        const row = i * SQUARE_SIZE + k;
                        const column = j * SQUARE_SIZE + l;
                        const squareIndex = i * NUM_SQUARES + j;
                        cellsInSquare.push(
                            <SudokuCell
                                key={`${row}-${column}`}
                                value={board[row][column]}
                                onChange={(event) => this.handleChange(row, column, event)}
                                isValid={!rowViolations.has(row) && !columnViolations.has(column)
                                    && !squareViolations.has(squareIndex)}
                                isComplete={complete}
                            />
                        );
                    }
                }
                squares.push(this.renderSquareWithCells(cellsInSquare));
            }
        }
        // should contain a checkbox for enabling/disabling autocheck
        return (
            <div className="sudoku-game">
                <div className="sudoku-board">
                    {squares}
                </div>
                <div className="sudoku-controls">
                    <input type="checkbox" checked={this.state.autocheck} onChange={this.handleAutoCheckChange} />
                    <label>Auto-check</label>
                </div>
            </div>
        );
    }

    createBoard() {
        const board = SudokuUtils.fillBoard(NUM_SQUARES, SQUARE_SIZE);
        return board;
    }

}