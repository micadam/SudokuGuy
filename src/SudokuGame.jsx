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
            modifiable: board.map(row => row.map(cell => cell === EMPTY)),
            autocheck: true,
            violations: EMPTY_VIOLATIONS,
            complete: false,
            focus: `-1,-1`,
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleAutoCheckChange = this.handleAutoCheckChange.bind(this);
        this.updateExtras = this.updateExtras.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    updateViolations() {
        if (!this.state.autocheck) {
            return;
        }
        const violations = SudokuUtils.validateBoard(this.state.board, EMPTY, numSquares, squareSize);
        this.setState({
            violations: violations,
        });
    }

    handleChange(row, column, event) {
        let value;
        if (event.nativeEvent.inputType === "deleteContentBackward") {
            value = EMPTY;
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
        this.updateViolations();
        this.updateCompletion();
    }

    handleKeyDown(event, row, column) {
        const directions = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
        }
        const direction = directions[event.key];
        if (!direction) {
            return;
        }
        const [dx, dy] = direction;
        const newRow = (row + SIZE + dx) % SIZE;
        const newColumn = (column + SIZE + dy) % SIZE;
        this.setState({
            focus: `${newRow},${newColumn}`,
        });
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

    updateExtras() {
        this.updateViolations();
        this.updateCompletion();
    }

    solve() {
        const board = this.state.board;
        const solvedBoard = SudokuStrategies.solve(board, numSquares, squareSize, true);
        this.setState({
            board: solvedBoard,
        }, this.updateExtras);
    }

    step() {
        const board = this.state.board;
        const solvedBoard = SudokuStrategies.step(board, numSquares, squareSize);
        this.setState({
            board: solvedBoard,
        }, this.updateExtras);
    }

    reset() {
        const board = this.createBoard();
        this.setState({
            board: board,
            modifiable: board.map(row => row.map(cell => cell === EMPTY)),
            violations: EMPTY_VIOLATIONS,
            complete: false,
        });
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
                                modifiable={this.state.modifiable[row][column]}
                                focus={this.state.focus === `${row}-${column}`}
                                onKeyDown={(event) => this.handleKeyDown(event, row, column)}
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
                    <br/>
                    <button onClick={() => this.solve()}>Solve</button>
                    <button onClick={() => this.step()}>Step</button>
                    <button onClick={() => this.reset()}>New game</button>
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