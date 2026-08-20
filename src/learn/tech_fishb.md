# Basic Fish

## Table of Contents

- [X-Wing](#bf2)
- [Swordfish](#bf3)
- [Jellyfish](#bf4)
- [Larger Basic Fish](#bf5)

------------------------------------------------------------------------

For a general description of fishing techniques including explanations for all necessary terms please see [Fish (general)](tech_fishg.md). For all examples please note that it is not necessary for every intersection between a base and a cover set to contain a fish digit. It is however necessary that every base and every cover set contains at least one fish digit.

# <span id="bf2"></span>X-Wing

Take two rows (the base sets). If you can find two columns, such that all candidates of a specific digit (the fish digit) in both rows are containd in the columns (the cover sets), all fish candidates in the columns that are not part of the rows can be eliminated. The result is called an X-Wing in the rows.

If you exchange the terms rows and columns in the description above, you get an X-Wing in the columns.

![Sudoku technique: Example for X-Wing](images/bf201.png) ![Sudoku technique: Example for X-Wing](images/bf202.png)

Take the example on the left: The base sets are the rows 2 and 5 (they have candidate 5 at r2c58 and r5c58. Columns 5 and 8 are the cover sets: All candidates from the base sets are contained in that columns. What's left is a 5 in r4c5: It is part of a cover set, but not of a base set. That candidate can be eliminated.

The logic behind that works as follows: Rows 2 and 5 both have only two candidates 5. If r2c5=5, r2c8 and r5c5 cannot be 5. That leaves r5c8 as last possibility for a 5 in row 5. If r2c8=5 the same argument leads to r5c5=5. No matter how you look at it, either r2c5 or r5c5 must be 5. r4c5 can therefore not be 5.

The example on the right shows an X-Wing in the columns: The base sets are columns 1 and 5, the cover sets are rows 2 and 5. All candidates in the rows that are not in the columns can be eliminated.

------------------------------------------------------------------------

# <span id="bf3"></span>Swordfish

Swordfishes work exactly the same way as X-Wings, just with three base and three cover sets instead of only two.

![Sudoku technique: Example for Swordfish](images/bf301.png) ![Sudoku technique: Example for Swordfish](images/bf302.png)

On the left the base sets are rows 1, 2, and 9. The cover sets are columns 1, 5, and 8, the fish digit is 2. Candidates 2 in r7c1 and in r6c8 are cover candidates that are not base candidates and can be eliminated.

On the right base sets r247 are combined with cover sets c235 to eliminate 4 from r3c235, r6c235, r8c235 and r9c23.

------------------------------------------------------------------------

# <span id="bf4"></span>Jellyfish

Jellyfishes need four base and four cover sets. Both examples below are taken from the [Pure Jellyfish Collection](http://forum.enjoysudoku.com/viewtopic.php?t=5776) in the [New Sudoku Player's Forum](http://forum.enjoysudoku.com).

![Sudoku technique: Example for Jellyfish](images/bf401.png) ![Sudoku technique: Example for Jellyfish](images/bf402.png)

On the left we have a Jellyfish in r3467/c1259 for digit 7, eliminating all the candidates marked in red. On the right the Jellyfish is in r1367/c2589, also for digit 7.

------------------------------------------------------------------------

# <span id="bf5"></span>Larger Basic Fish

Basic Fish larger than Jellyfish are of course possible, but unnecessary: For any larger fish a complementary smaller one will exist.

------------------------------------------------------------------------
