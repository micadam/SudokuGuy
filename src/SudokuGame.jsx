import React  from "react";
import SudokuCell from "./SudokuCell";

import * as SudokuUtils from "./SudokuUtils";
import * as SudokuStrategies from "./SudokuStrategies";

import "./SudokuGame.css";

const squareSize = 3;
const numSquares = 3;
const SIZE = squareSize * numSquares;
const EMPTY_SET = new Set();
const EMPTY_VIOLATIONS = {
    rowViolations: EMPTY_SET,
    columnViolations: EMPTY_SET,
    squareViolations: EMPTY_SET
}

const EMPTY = ".";
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
        const violations = SudokuUtils.validateBoard(this.state.board, EMPTY, numSquares, squareSize);
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
            violations = SudokuUtils.validateBoard(this.state.board, EMPTY, numSquares, squareSize);
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
        const violations = SudokuUtils.validateBoard(board, EMPTY, numSquares, squareSize);
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

    solve() {
        const board = this.state.board;
        const solvedBoard = SudokuStrategies.solve(board, numSquares, squareSize);
        this.setState({
            board: solvedBoard,
        });
        this.updateViolations();
        this.updateCompletion();
    }

    step() {
        const board = this.state.board;
        const solvedBoard = SudokuStrategies.step(board, numSquares, squareSize);
        this.setState({
            board: solvedBoard,
        });
        this.updateViolations();
        this.updateCompletion();
    }


    render() {
        const board = this.state.board;
        const {rowViolations, columnViolations, squareViolations} = this.state.violations;
        const complete = this.state.complete;
        const squares = []
        for (let i = 0; i < numSquares; i++) {
            for (let j = 0; j < numSquares; j++) {
                const cellsInSquare = [];
                for (let k = 0; k < squareSize; k++) {
                    for (let l = 0; l < squareSize; l++) {
                        const row = i * squareSize + k;
                        const column = j * squareSize + l;
                        const squareIndex = i * numSquares + j;
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
        // should contain a button to solve the board
        return (
            <div className="sudoku-game">
                <div className="sudoku-board">
                    {squares}
                </div>
                <div className="sudoku-controls">
                    <input type="checkbox" checked={this.state.autocheck} onChange={this.handleAutoCheckChange} />
                    <label>Auto-check</label>
                    <button onClick={() => this.solve()}>Solve</button>
                    <button onClick={() => this.step()}>Step</button>
                </div>
            </div>
        );
    }

    createBoard() {
        let board = SudokuUtils.fillBoard(numSquares, squareSize);
        board = SudokuUtils.removeUntilUnsolvable(board, numSquares, squareSize);
        return board;
    }

}