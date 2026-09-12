import type { EngineDifficulty } from "savor-sudoku-plugin-api";

// `tiers` is which rungs of the host's shared ladder each level serves, read
// only under mixed generation. The numbers are measured rather than taken from
// this list's own order: over 200 generated puzzles per level, rated by three
// engines, HoDoKu's Medium lands beside the built-in engine's Difficult and
// Annoying, and its Hard beside Devious and Fiendish.
// docs/investigations/2026-09-12-multi-engine-tiers/findings.md has the numbers.
//
// `extreme` has no upper bound, so it serves two rungs by clipping the solver's
// score in two places; windows.ts holds where. `unfair` serves none: its 1600
// to 1800 bracket sits between two rungs and is too narrow for a window to
// move, and once `extreme` is clipped to rung 5 there is nothing it adds. It
// stays in the catalog because the plain difficulty list still offers it and
// its id is persisted.
//
// Nothing here serves rung 2. HoDoKu's Easy is capped by technique rather than
// by score, so raising its score buys more easy steps rather than harder ones,
// and every window tried stayed a third of a rung too easy.
export const CATALOG: readonly EngineDifficulty[] = [
  { id: "easy", label: "Easy", order: 0, tiers: [1] },
  { id: "medium", label: "Medium", order: 1, tiers: [3] },
  { id: "hard", label: "Hard", order: 2, tiers: [4] },
  { id: "unfair", label: "Unfair", order: 3 },
  { id: "extreme", label: "Extreme", order: 4, tiers: [5, 6] },
];
