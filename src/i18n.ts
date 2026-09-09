// What this plugin says in a language other than English.
//
// Only the menu text: the difficulty names the host lists, and the technique
// names its manifest declares. The explanations a hint carries, and the Learn
// pages under src/learn, come out of HoDoKu itself and stay English, which the
// app's manual says.
//
// Deliberately self-contained. This package is mirrored to its own public repo
// under GPL, so it must not reach into the app's own catalog.

export type Locale = "en" | "pt-BR";

const LOCALES: readonly string[] = ["en", "pt-BR"];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value);
}

/**
 * Overrides by locale, keyed by the id in the manifest. A missing entry keeps
 * HoDoKu's own name, which is what every locale but the ones here gets, and
 * what a name that needs no translation gets in any of them.
 *
 * The fish are coined names -- Squirmbag, Whale, Leviathan, Franken, Mutant,
 * Kraken -- and Portuguese-speaking solvers call them the same thing, so only
 * the prefixes that describe something ("Finned", "Sashimi") move.
 */
const TECHNIQUE_NAMES: Readonly<Record<Locale, Readonly<Record<string, string>>>> =
  {
    en: {},
    "pt-BR": {
      FULL_HOUSE: "Casa Completa",
      HIDDEN_SINGLE: "Único Oculto",
      HIDDEN_PAIR: "Par Oculto",
      HIDDEN_TRIPLE: "Trinca Oculta",
      HIDDEN_QUADRUPLE: "Quadra Oculta",
      NAKED_SINGLE: "Único Nu",
      NAKED_PAIR: "Par Nu",
      NAKED_TRIPLE: "Trinca Nua",
      NAKED_QUADRUPLE: "Quadra Nua",
      LOCKED_PAIR: "Par Bloqueado",
      LOCKED_TRIPLE: "Trinca Bloqueada",
      LOCKED_CANDIDATES: "Candidatos Bloqueados",
      LOCKED_CANDIDATES_1: "Candidatos Bloqueados Tipo 1 (Apontamento)",
      LOCKED_CANDIDATES_2: "Candidatos Bloqueados Tipo 2 (Reivindicação)",
      UNIQUENESS_1: "Teste de Unicidade 1",
      UNIQUENESS_2: "Teste de Unicidade 2",
      UNIQUENESS_3: "Teste de Unicidade 3",
      UNIQUENESS_4: "Teste de Unicidade 4",
      UNIQUENESS_5: "Teste de Unicidade 5",
      UNIQUENESS_6: "Teste de Unicidade 6",
      X_CHAIN: "Cadeia X",
      XY_CHAIN: "Cadeia XY",
      REMOTE_PAIR: "Par Remoto",
      CONTINUOUS_NICE_LOOP: "Nice Loop Contínuo",
      DISCONTINUOUS_NICE_LOOP: "Nice Loop Descontínuo",
      FINNED_X_WING: "X-Wing com Barbatana",
      FINNED_SWORDFISH: "Swordfish com Barbatana",
      FINNED_JELLYFISH: "Jellyfish com Barbatana",
      FINNED_SQUIRMBAG: "Squirmbag com Barbatana",
      FINNED_WHALE: "Whale com Barbatana",
      FINNED_LEVIATHAN: "Leviathan com Barbatana",
      SASHIMI_X_WING: "X-Wing Sashimi",
      SASHIMI_SWORDFISH: "Swordfish Sashimi",
      SASHIMI_JELLYFISH: "Jellyfish Sashimi",
      SASHIMI_SQUIRMBAG: "Squirmbag Sashimi",
      SASHIMI_WHALE: "Whale Sashimi",
      SASHIMI_LEVIATHAN: "Leviathan Sashimi",
      FRANKEN_X_WING: "X-Wing Franken",
      FRANKEN_SWORDFISH: "Swordfish Franken",
      FRANKEN_JELLYFISH: "Jellyfish Franken",
      FRANKEN_SQUIRMBAG: "Squirmbag Franken",
      FRANKEN_WHALE: "Whale Franken",
      FRANKEN_LEVIATHAN: "Leviathan Franken",
      FINNED_FRANKEN_X_WING: "X-Wing Franken com Barbatana",
      FINNED_FRANKEN_SWORDFISH: "Swordfish Franken com Barbatana",
      FINNED_FRANKEN_JELLYFISH: "Jellyfish Franken com Barbatana",
      FINNED_FRANKEN_SQUIRMBAG: "Squirmbag Franken com Barbatana",
      FINNED_FRANKEN_WHALE: "Whale Franken com Barbatana",
      FINNED_FRANKEN_LEVIATHAN: "Leviathan Franken com Barbatana",
      MUTANT_X_WING: "X-Wing Mutant",
      MUTANT_SWORDFISH: "Swordfish Mutant",
      MUTANT_JELLYFISH: "Jellyfish Mutant",
      MUTANT_SQUIRMBAG: "Squirmbag Mutant",
      MUTANT_WHALE: "Whale Mutant",
      MUTANT_LEVIATHAN: "Leviathan Mutant",
      FINNED_MUTANT_X_WING: "X-Wing Mutant com Barbatana",
      FINNED_MUTANT_SWORDFISH: "Swordfish Mutant com Barbatana",
      FINNED_MUTANT_JELLYFISH: "Jellyfish Mutant com Barbatana",
      FINNED_MUTANT_SQUIRMBAG: "Squirmbag Mutant com Barbatana",
      FINNED_MUTANT_WHALE: "Whale Mutant com Barbatana",
      FINNED_MUTANT_LEVIATHAN: "Leviathan Mutant com Barbatana",
      ALS_XZ: "Regra XZ de Conjunto Quase Bloqueado",
      ALS_XY_WING: "XY-Wing de Conjunto Quase Bloqueado",
      ALS_XY_CHAIN: "Cadeia XY de Conjunto Quase Bloqueado",
      TEMPLATE_SET: "Template: Colocar",
      TEMPLATE_DEL: "Template: Apagar",
      FORCING_CHAIN: "Cadeia Forçada",
      FORCING_CHAIN_CONTRADICTION: "Cadeia Forçada por Contradição",
      FORCING_CHAIN_VERITY: "Cadeia Forçada por Verdade",
      FORCING_NET: "Rede Forçada",
      FORCING_NET_CONTRADICTION: "Rede Forçada por Contradição",
      FORCING_NET_VERITY: "Rede Forçada por Verdade",
      BRUTE_FORCE: "Força Bruta",
      GROUPED_NICE_LOOP: "Nice Loop/AIC Agrupado",
      GROUPED_CONTINUOUS_NICE_LOOP: "Nice Loop Contínuo Agrupado",
      GROUPED_DISCONTINUOUS_NICE_LOOP: "Nice Loop Descontínuo Agrupado",
      EMPTY_RECTANGLE: "Retângulo Vazio",
      HIDDEN_RECTANGLE: "Retângulo Oculto",
      AVOIDABLE_RECTANGLE_1: "Retângulo Evitável Tipo 1",
      AVOIDABLE_RECTANGLE_2: "Retângulo Evitável Tipo 2",
      GROUPED_AIC: "AIC Agrupado",
      SIMPLE_COLORS: "Cores Simples",
      MULTI_COLORS: "Cores Múltiplas",
      KRAKEN_FISH_TYPE_1: "Kraken Fish Tipo 1",
      KRAKEN_FISH_TYPE_2: "Kraken Fish Tipo 2",
      DUAL_TWO_STRING_KITE: "2-String Kite Duplo",
      DUAL_EMPTY_RECTANGLE: "Retângulo Vazio Duplo",
      SIMPLE_COLORS_TRAP: "Cores Simples (armadilha)",
      SIMPLE_COLORS_WRAP: "Cores Simples (contradição)",
      MULTI_COLORS_1: "Cores Múltiplas 1",
      MULTI_COLORS_2: "Cores Múltiplas 2",
    },
  };

/** The five difficulty ids the catalog declares, by locale. */
const DIFFICULTY_LABELS: Readonly<
  Record<Locale, Readonly<Record<string, string>>>
> = {
  en: {},
  "pt-BR": {
    easy: "Fácil",
    medium: "Médio",
    hard: "Difícil",
    unfair: "Injusto",
    extreme: "Extremo",
  },
};

export function techniqueName(locale: Locale, id: string, fallback: string): string {
  return TECHNIQUE_NAMES[locale][id] ?? fallback;
}

export function difficultyLabel(locale: Locale, id: string, fallback: string): string {
  return DIFFICULTY_LABELS[locale][id] ?? fallback;
}
