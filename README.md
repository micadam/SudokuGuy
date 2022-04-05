# Sudoku Guy

This is an app I'm developing to teach myself how to solve difficult Sudoku puzzles.

What it does currently:
* generate sudoku board solvable with the following strategies:
* * look at each cell and fill it in if only one number is possible
* * look at each cell and fill it in if one of its possible numbers is possible nowhere else in one of its units
* * "Cross-unit-elimination" -- look at possible numbers in a unit to see if they're all in the same row/column/square. If they are, eliminate them from all cells in the row/column/square that aren't in this unit.
* automatically check for mistakes (optionally)
* automatically mark the puzzle as complete

What is planned (ETA: some day):
* More solving algorithms (and by extension, generate more difficult boards)
* Textual hints/solutions to support learnig
* Inputting a custom board and seeing what the algorithms would do
