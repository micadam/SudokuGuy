# Sudoku Guy

This is an app I'm developing to teach myself how to solve difficult Sudoku puzzles.

What it does currently:
* generate sudoku board solvable with the following strategies:
* * look at each cell and fill it in if only one number is possible
* * look at each cell and fill it in if one of its possible numbers is possible nowhere else in one of its units
* automatically check for mistakes (optionally)
* automatically mark the puzzle as complete

What is planned (ETA: some day):
* More solving algorithms (and by extension, generate more difficult boards)
* Textual hints/solutions to support learnig
* Inputting a custom board and seeing what the algorithms would do
