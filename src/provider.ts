import {
  Board,
  generate as hodokuGenerate,
  hint as hodokuHint,
  rate as hodokuRate,
  type Difficulty,
  type Hint,
} from "hodoku-ts";
import type {
  EngineManifest,
  EngineProvider,
  GenerateResult,
  HintCandidateHighlight,
  HintCellHighlight,
  HintLink,
  HintPlacement,
  HintResult,
  RateResult,
} from "savor-sudoku-plugin-api";
import { CATALOG } from "./catalog.js";
import { explanationFor } from "./learn.js";
import { mulberry32 } from "./rng.js";
import { EXCLUDED, TECHNIQUES } from "./techniques.js";
import { PLUGIN_VERSION } from "./version.js";

export const ENGINE_ID = "hodoku";

const MANIFEST: EngineManifest = {
  id: ENGINE_ID,
  name: "HoDoKu",
  version: PLUGIN_VERSION,
  license: "GPL-3.0-or-later",
  capabilities: ["generate", "rate", "hint"],
  difficulties: CATALOG,
  techniques: TECHNIQUES,
};

function toPlacements(
  refs: readonly { index: number; value: number }[],
): HintPlacement[] {
  return refs.map((r) => ({ cell: r.index, digit: r.value }));
}

function toHighlights(step: Hint): HintResult["highlights"] {
  const cells: HintCellHighlight[] = step.raw.indices.map((cell) => ({
    cell,
    color: "green" as const,
  }));

  const candidates: HintCandidateHighlight[] = [
    ...step.eliminations.map((e) => ({
      cell: e.index,
      digit: e.value,
      color: "red" as const,
    })),
    ...[...step.raw.fins, ...step.raw.endoFins].map((f) => ({
      cell: f.index,
      digit: f.value,
      color: "blue" as const,
    })),
  ];

  // HoDoKu knows strong from weak for every link it reports, so none of these
  // go over unsaid. A group or ALS node reports the first of its cells, which is
  // what hodoku-ts hands over, so the arrow points at that corner of the node
  // rather than at all of it.
  const links: HintLink[] = step.links.map((l) => ({
    from: { cell: l.from.index, digit: l.from.value },
    to: { cell: l.to.index, digit: l.to.value },
    strong: l.strong,
  }));

  // No houses: HoDoKu's base/cover entities carry a numeric name constant
  // (BLOCK/LINE/COL) that hodoku-ts does not export, and reading it would
  // couple this plugin to an upstream internal.
  return {
    ...(cells.length === 0 ? {} : { cells }),
    ...(candidates.length === 0 ? {} : { candidates }),
    ...(links.length === 0 ? {} : { links }),
  };
}

/**
 * The board the solver reasons from. `hint()` accepts a Board as-is and does
 * not rebuild its candidates, so the player's marks survive the call.
 *
 * The host's mask only ever narrows what HoDoKu derived: a mark the board has
 * already ruled out - a stale one left behind after the player placed a digit -
 * is dropped rather than restored. Emptying a cell means the marks contradict
 * the board, which is the player's error to fix and not something to solve
 * around.
 */
function toBoard(grid: string, candidates: readonly number[]): Board {
  const board = Board.fromString(grid);
  for (let cell = 0; cell < 81; cell++) {
    if (board.getValue(cell) !== 0) continue;
    const mask = candidates[cell] ?? 0;
    for (let digit = 1; digit <= 9; digit++) {
      if ((mask & (1 << (digit - 1))) !== 0) continue;
      if (!board.isCandidate(cell, digit)) continue;
      if (!board.delCandidate(cell, digit)) {
        throw new Error(
          `cell ${cell} has no candidates left after applying pencil marks`,
        );
      }
    }
  }
  return board;
}

// hodoku-ts names its levels in lowercase; the catalog already carries the
// display form, so a rating reads the same as the difficulty that produced it.
function ratingLabel(difficulty: string): string {
  return CATALOG.find((d) => d.id === difficulty)?.label ?? difficulty;
}

export const hodokuProvider: EngineProvider = {
  manifest: () => MANIFEST,

  generate: ({ difficultyId, seed }): GenerateResult => {
    if (!CATALOG.some((d) => d.id === difficultyId)) {
      throw new Error(`unknown difficulty "${difficultyId}"`);
    }
    // shouldCancel / onAttempt stay inside the worker; they are callbacks and
    // the wire protocol forbids callbacks across the boundary.
    const result = hodokuGenerate({
      difficulty: difficultyId as Difficulty,
      rng: mulberry32(seed),
    });
    if (!result) {
      throw new Error(`hodoku-ts failed to generate a "${difficultyId}" puzzle`);
    }
    return { givens: result.givens };
  },

  rate: ({ givens }): RateResult => {
    const result = hodokuRate(givens);
    if (!result.solved || result.difficulty === "incomplete") {
      return { ok: false, label: "" };
    }
    return {
      ok: true,
      label: `${ratingLabel(result.difficulty)}: ${result.score}`,
    };
  },

  hint: ({ grid, candidates }): HintResult | null => {
    const step = hodokuHint(
      candidates === undefined ? grid : toBoard(grid, candidates),
    );
    if (!step) return null;
    // INCOMPLETE and GIVE_UP are solver outcomes, not techniques, and are not
    // in the manifest, so a hint carrying one is no hint at all.
    if (EXCLUDED.has(step.technique)) return null;
    // Every type maps to one of the 54 documented anchors, held in place by
    // test/learn.test.ts. If one ever slips through the host falls back to the
    // technique's reference URL, which is the same page this text came from.
    const explanation = explanationFor(step.technique);
    return {
      techniqueId: step.technique,
      text: step.explanation,
      ...(explanation === undefined ? {} : { explanation }),
      placements: toPlacements(step.placements),
      eliminations: toPlacements(step.eliminations),
      highlights: toHighlights(step),
    };
  },
};
