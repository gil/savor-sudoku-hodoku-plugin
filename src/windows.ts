import {
  SudokuSolver,
  difficultyOf,
  generateSudoku,
  type Difficulty,
  type Rng,
} from "hodoku-ts";

/**
 * `extreme`'s declared ceiling is MAX_INT, which is not a number to compare
 * against. This sits well above the highest score seen over several hundred
 * generated puzzles and means "no ceiling".
 */
const NO_CEILING = 99_999;

/** A window on the solver's score, inclusive, plus the level to cap it at. */
export interface ScoreWindow {
  readonly min: number;
  readonly max: number;
  readonly maxLevel: Difficulty;
}

/**
 * Where to generate inside a level when the whole level is not what the host's
 * rung wants, keyed `"<difficultyId>:<tier>"`.
 *
 * Measured, not reasoned about; a missing entry means the whole level fits that
 * rung at least as well as any window tried. See
 * docs/investigations/2026-09-12-multi-engine-tiers/findings.md.
 *
 * `extreme` has no upper bound at all, so it is the level that gains most from
 * being clipped: its bottom is rung 5 and its top is past what the built-in
 * engine can solve, which is what rung 6 means.
 *
 * The 5199 ceiling is load-bearing, not tidiness. Without it rung 5's window
 * contains rung 6's, and it is not a rare crossing: of 40 puzzles generated at
 * 2600 and up, 8 scored over 5200 and one reached 10,626. Rung 5 would out-hard
 * rung 6 one tap in five.
 */
const WINDOWS: Readonly<Record<string, ScoreWindow>> = {
  "easy:1": { min: 0, max: 250, maxLevel: "easy" },
  "hard:4": { min: 1250, max: 1600, maxLevel: "hard" },
  "extreme:5": { min: 2600, max: 5199, maxLevel: "extreme" },
  "extreme:6": { min: 5200, max: NO_CEILING, maxLevel: "extreme" },
};

/** The window for a level and rung, or null to generate the whole level. */
export function windowFor(
  difficultyId: string,
  tier: number | undefined,
): ScoreWindow | null {
  if (tier === undefined) return null;
  return WINDOWS[`${difficultyId}:${tier}`] ?? null;
}

// Upstream's own generateByDifficulty gives up after 20,000 tries. The slowest
// window here averages about 350.
const MAX_ATTEMPTS = 20_000;

function toGivens(values: ArrayLike<number>): string {
  let out = "";
  for (let i = 0; i < 81; i++) {
    const v = values[i]!;
    out += v >= 1 && v <= 9 ? String(v) : ".";
  }
  return out;
}

/**
 * A puzzle whose score falls in the window, or null if none turned up.
 *
 * This is `generateByDifficulty`'s loop with its equality test on the level
 * swapped for a range test on the score. The two options are what make it work:
 * `rejectTooLowScore` is the floor that makes a level mean its bracket at all,
 * and is what a plain targeted request already gets; `maxLevel` lets the solver
 * abort the moment a puzzle outgrows the window's ceiling, which is the
 * difference between a tenth of a second and several seconds per accepted
 * puzzle.
 *
 * `accepted` already means solved, within `maxLevel`, and not too easy for its
 * own level, so the score window is the only test left to add.
 *
 * The rng is threaded through every attempt, so the whole loop is one
 * deterministic stream: same seed, same puzzle.
 */
export function generateInWindow(span: ScoreWindow, rng: Rng): string | null {
  const solver = new SudokuSolver();
  const maxLevel = difficultyOf(span.maxLevel);
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const grid = generateSudoku(true, rng);
    const result = solver.solve(grid.board, {
      maxLevel,
      rejectTooLowScore: true,
    });
    if (!result.accepted) continue;
    if (result.score < span.min || result.score > span.max) continue;
    return toGivens(grid.givens);
  }
  return null;
}
