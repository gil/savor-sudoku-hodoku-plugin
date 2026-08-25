import { SOLUTION_TYPES, typeName } from "hodoku-ts";
import type { EngineTechnique } from "savor-sudoku-plugin-api";

const BASE =
  "https://web.archive.org/web/20260715214206/https://hodoku.sourceforge.net/en/";

/** Solver outcomes, not techniques. They can never appear in a HintResult. */
export const EXCLUDED: ReadonlySet<string> = new Set(["INCOMPLETE", "GIVE_UP"]);

// 109 techniques onto 54 anchors across 12 pages, hand-written and held in
// place by test/techniques.test.ts. Keys are page + anchor relative to BASE.
export const PAGES: Readonly<Record<string, readonly string[]>> = {
  "tech_singles.php#fh": ["FULL_HOUSE"],
  "tech_singles.php#h1": ["HIDDEN_SINGLE"],
  "tech_singles.php#n1": ["NAKED_SINGLE"],
  "tech_intersections.php#lc1": ["LOCKED_CANDIDATES", "LOCKED_CANDIDATES_1"],
  "tech_intersections.php#lc2": ["LOCKED_CANDIDATES_2"],
  "tech_hidden.php#h2": ["HIDDEN_PAIR"],
  "tech_hidden.php#h3": ["HIDDEN_TRIPLE"],
  "tech_hidden.php#h4": ["HIDDEN_QUADRUPLE"],
  "tech_naked.php#n2": ["NAKED_PAIR", "LOCKED_PAIR"],
  "tech_naked.php#n3": ["NAKED_TRIPLE", "LOCKED_TRIPLE"],
  "tech_naked.php#n4": ["NAKED_QUADRUPLE"],
  "tech_fishb.php#bf2": ["X_WING"],
  "tech_fishb.php#bf3": ["SWORDFISH"],
  "tech_fishb.php#bf4": ["JELLYFISH"],
  "tech_fishb.php#bf5": ["SQUIRMBAG", "WHALE", "LEVIATHAN"],
  "tech_fishfs.php#fbf2": ["FINNED_X_WING", "SASHIMI_X_WING"],
  "tech_fishfs.php#fbf3": ["FINNED_SWORDFISH", "SASHIMI_SWORDFISH"],
  "tech_fishfs.php#fbf4": ["FINNED_JELLYFISH", "SASHIMI_JELLYFISH"],
  "tech_fishfs.php#fbf567": [
    "FINNED_SQUIRMBAG",
    "FINNED_WHALE",
    "FINNED_LEVIATHAN",
    "SASHIMI_SQUIRMBAG",
    "SASHIMI_WHALE",
    "SASHIMI_LEVIATHAN",
  ],
  "tech_fishc.php#ff": [
    "FRANKEN_X_WING",
    "FRANKEN_SWORDFISH",
    "FRANKEN_JELLYFISH",
    "FRANKEN_SQUIRMBAG",
    "FRANKEN_WHALE",
    "FRANKEN_LEVIATHAN",
    "FINNED_FRANKEN_X_WING",
    "FINNED_FRANKEN_SWORDFISH",
    "FINNED_FRANKEN_JELLYFISH",
    "FINNED_FRANKEN_SQUIRMBAG",
    "FINNED_FRANKEN_WHALE",
    "FINNED_FRANKEN_LEVIATHAN",
  ],
  "tech_fishc.php#mf": [
    "MUTANT_X_WING",
    "MUTANT_SWORDFISH",
    "MUTANT_JELLYFISH",
    "MUTANT_SQUIRMBAG",
    "MUTANT_WHALE",
    "MUTANT_LEVIATHAN",
    "FINNED_MUTANT_X_WING",
    "FINNED_MUTANT_SWORDFISH",
    "FINNED_MUTANT_JELLYFISH",
    "FINNED_MUTANT_SQUIRMBAG",
    "FINNED_MUTANT_WHALE",
    "FINNED_MUTANT_LEVIATHAN",
  ],
  "tech_sdp.php#sk": ["SKYSCRAPER"],
  "tech_sdp.php#t2sk": ["TWO_STRING_KITE", "DUAL_TWO_STRING_KITE"],
  "tech_sdp.php#tf": ["TURBOT_FISH"],
  "tech_sdp.php#er": ["EMPTY_RECTANGLE", "DUAL_EMPTY_RECTANGLE"],
  "tech_ur.php#u1": ["UNIQUENESS_1"],
  "tech_ur.php#u2": ["UNIQUENESS_2"],
  "tech_ur.php#u3": ["UNIQUENESS_3"],
  "tech_ur.php#u4": ["UNIQUENESS_4"],
  "tech_ur.php#u5": ["UNIQUENESS_5"],
  "tech_ur.php#u6": ["UNIQUENESS_6"],
  "tech_ur.php#hr": ["HIDDEN_RECTANGLE"],
  "tech_ur.php#ar": ["AVOIDABLE_RECTANGLE_1", "AVOIDABLE_RECTANGLE_2"],
  "tech_ur.php#bug1": ["BUG_PLUS_1"],
  "tech_wings.php#xy": ["XY_WING"],
  "tech_wings.php#xyz": ["XYZ_WING"],
  "tech_wings.php#w": ["W_WING"],
  "tech_misc.php#sdc": ["SUE_DE_COQ"],
  "tech_col.php#sc": [
    "SIMPLE_COLORS",
    "SIMPLE_COLORS_TRAP",
    "SIMPLE_COLORS_WRAP",
  ],
  "tech_col.php#mc": ["MULTI_COLORS", "MULTI_COLORS_1", "MULTI_COLORS_2"],
  "tech_chains.php#rp": ["REMOTE_PAIR"],
  "tech_chains.php#x": ["X_CHAIN"],
  "tech_chains.php#xyc": ["XY_CHAIN"],
  "tech_chains.php#nl": [
    "NICE_LOOP",
    "CONTINUOUS_NICE_LOOP",
    "DISCONTINUOUS_NICE_LOOP",
    "AIC",
  ],
  "tech_chains.php#gnl": [
    "GROUPED_NICE_LOOP",
    "GROUPED_CONTINUOUS_NICE_LOOP",
    "GROUPED_DISCONTINUOUS_NICE_LOOP",
    "GROUPED_AIC",
  ],
  "tech_als.php#axz": ["ALS_XZ"],
  "tech_als.php#axy": ["ALS_XY_WING"],
  "tech_als.php#ach": ["ALS_XY_CHAIN"],
  "tech_als.php#db": ["DEATH_BLOSSOM"],
  "tech_last.php#ts": ["TEMPLATE_SET", "TEMPLATE_DEL"],
  "tech_last.php#fc": [
    "FORCING_CHAIN",
    "FORCING_CHAIN_CONTRADICTION",
    "FORCING_CHAIN_VERITY",
  ],
  "tech_last.php#fn": [
    "FORCING_NET",
    "FORCING_NET_CONTRADICTION",
    "FORCING_NET_VERITY",
  ],
  "tech_last.php#kf": [
    "KRAKEN_FISH",
    "KRAKEN_FISH_TYPE_1",
    "KRAKEN_FISH_TYPE_2",
  ],
  "tech_last.php#bf": ["BRUTE_FORCE"],
};

// Hint penalty tier per anchor, charged as tier*10 seconds (5 for tier 0).
// Keyed by the same anchors as PAGES, which covers all 109 types exactly once,
// so every technique gets a tier by construction rather than by a default.
//
// The scale is the built-in engine's, so the same technique costs the same
// whichever engine found it: a single is 1, a basic fish 2, chains and coloring
// 3, and the things that are closer to searching than reasoning are 5 and 6.
// Sized families climb with their size, and finned variants sit one tier above
// the plain fish they extend.
export const TIERS: Readonly<Record<string, number>> = {
  "tech_singles.php#fh": 0,
  "tech_singles.php#h1": 1,
  "tech_singles.php#n1": 1,
  "tech_intersections.php#lc1": 1,
  "tech_intersections.php#lc2": 1,
  "tech_hidden.php#h2": 2,
  "tech_hidden.php#h3": 3,
  "tech_hidden.php#h4": 4,
  "tech_naked.php#n2": 1,
  "tech_naked.php#n3": 2,
  "tech_naked.php#n4": 3,
  "tech_fishb.php#bf2": 2,
  "tech_fishb.php#bf3": 3,
  "tech_fishb.php#bf4": 4,
  "tech_fishb.php#bf5": 5,
  "tech_fishfs.php#fbf2": 3,
  "tech_fishfs.php#fbf3": 4,
  "tech_fishfs.php#fbf4": 5,
  "tech_fishfs.php#fbf567": 6,
  "tech_fishc.php#ff": 6,
  "tech_fishc.php#mf": 6,
  "tech_sdp.php#sk": 2,
  "tech_sdp.php#t2sk": 2,
  "tech_sdp.php#tf": 2,
  "tech_sdp.php#er": 3,
  "tech_ur.php#u1": 2,
  "tech_ur.php#u2": 2,
  "tech_ur.php#u3": 3,
  "tech_ur.php#u4": 3,
  "tech_ur.php#u5": 3,
  "tech_ur.php#u6": 3,
  "tech_ur.php#hr": 2,
  "tech_ur.php#ar": 4,
  "tech_ur.php#bug1": 2,
  "tech_wings.php#xy": 3,
  "tech_wings.php#xyz": 3,
  "tech_wings.php#w": 1,
  "tech_misc.php#sdc": 4,
  "tech_col.php#sc": 3,
  "tech_col.php#mc": 3,
  "tech_chains.php#rp": 2,
  "tech_chains.php#x": 3,
  "tech_chains.php#xyc": 3,
  "tech_chains.php#nl": 3,
  "tech_chains.php#gnl": 4,
  "tech_als.php#axz": 3,
  "tech_als.php#axy": 4,
  "tech_als.php#ach": 4,
  "tech_als.php#db": 5,
  "tech_last.php#ts": 6,
  "tech_last.php#fc": 5,
  "tech_last.php#fn": 6,
  "tech_last.php#kf": 6,
  "tech_last.php#bf": 6,
};

const URL_BY_TYPE = new Map<string, string>();
const TIER_BY_TYPE = new Map<string, number>();
for (const [page, types] of Object.entries(PAGES)) {
  for (const type of types) {
    URL_BY_TYPE.set(type, BASE + page);
    const tier = TIERS[page];
    if (tier !== undefined) TIER_BY_TYPE.set(type, tier);
  }
}

export const TECHNIQUES: readonly EngineTechnique[] = SOLUTION_TYPES.filter(
  (type) => !EXCLUDED.has(type),
).map((type) => {
  const url = URL_BY_TYPE.get(type);
  const penalty = TIER_BY_TYPE.get(type);
  return {
    id: type,
    name: typeName(type),
    ...(url === undefined ? {} : { url }),
    ...(penalty === undefined ? {} : { penalty }),
  };
});
