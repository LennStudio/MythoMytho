import { DIFFICULTY_LABELS, MAX_WORD_LENGTH } from './constants';
import { normalizeWord, pickOne, squashSpaces, type Rng } from './text';
import type { Difficulty, DifficultyFilter, DrawnPair, WordPair, WordTheme } from './types';

export function toDifficulty(value: unknown): Difficulty {
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return n === 1 || n === 3 ? n : 2;
}

/** Nettoie une paire saisie ou importée ; `null` si elle est invalide. */
export function sanitizePair(raw: unknown): WordPair | null {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const a = squashSpaces(String(raw[0] ?? ''));
  const b = squashSpaces(String(raw[1] ?? ''));
  if (!a || !b || a.length > MAX_WORD_LENGTH || b.length > MAX_WORD_LENGTH) return null;
  if (normalizeWord(a) === normalizeWord(b)) return null;
  return [a, b, toDifficulty(raw[2])];
}

/** Clé indépendante de l'ordre des mots, des accents et de la casse (détection de doublons). */
export function pairKey(pair: readonly [string, string, ...unknown[]]): string {
  return [normalizeWord(pair[0]), normalizeWord(pair[1])].sort().join('|');
}

export function pairId(themeKey: string, pair: WordPair): string {
  return `${themeKey}::${pair[0]}::${pair[1]}`;
}

/** Valide la forme de words.json ; lève une erreur si elle est inexploitable. */
export function parseWordsFile(raw: unknown): WordTheme[] {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as { themes?: unknown }).themes)) {
    throw new Error('words.json : format invalide');
  }
  const themes: WordTheme[] = [];
  for (const t of (raw as { themes: unknown[] }).themes) {
    if (typeof t !== 'object' || t === null) continue;
    const obj = t as { key?: unknown; label?: unknown; desc?: unknown; pairs?: unknown };
    if (typeof obj.key !== 'string' || !Array.isArray(obj.pairs)) continue;
    const pairs: WordPair[] = [];
    for (const p of obj.pairs) {
      if (!Array.isArray(p) || p.length < 2) continue;
      pairs.push([String(p[0]), String(p[1]), toDifficulty(p[2])]);
    }
    if (pairs.length === 0) continue;
    themes.push({
      key: obj.key,
      label: String(obj.label ?? obj.key),
      desc: String(obj.desc ?? ''),
      pairs,
    });
  }
  if (themes.length === 0) throw new Error('words.json : aucun thème exploitable');
  return themes;
}

export function countPairs(theme: WordTheme, difficulty: DifficultyFilter): number {
  return difficulty === 0 ? theme.pairs.length : theme.pairs.filter((p) => p[2] === difficulty).length;
}

export type UsedPairs = Readonly<Record<string, true>>;

export interface DrawResult {
  readonly pair: DrawnPair;
  readonly used: UsedPairs;
  /** Messages à afficher à l'utilisateur (repli de difficulté, stock réinitialisé…). */
  readonly notices: readonly string[];
}

interface Candidate {
  readonly id: string;
  readonly themeKey: string;
  readonly pair: WordPair;
}

function candidates(
  themes: readonly WordTheme[],
  keys: readonly string[],
  difficulty: DifficultyFilter,
): Candidate[] {
  const out: Candidate[] = [];
  for (const key of keys) {
    const theme = themes.find((t) => t.key === key);
    if (!theme) continue;
    for (const pair of theme.pairs) {
      if (difficulty !== 0 && pair[2] !== difficulty) continue;
      out.push({ id: pairId(key, pair), themeKey: key, pair });
    }
  }
  return out;
}

export function pickWordPair(args: {
  readonly themes: readonly WordTheme[];
  readonly selectedKeys: readonly string[];
  readonly difficulty: DifficultyFilter;
  readonly used: UsedPairs;
  readonly rng?: Rng;
}): DrawResult | null {
  const rng = args.rng ?? Math.random;
  const notices: string[] = [];
  const keys = args.selectedKeys.length > 0 ? args.selectedKeys : ['classique'];

  let pool = candidates(args.themes, keys, args.difficulty);
  if (pool.length === 0 && args.difficulty !== 0) {
    pool = candidates(args.themes, keys, 0);
    if (pool.length > 0) {
      notices.push(
        `Aucune paire « ${DIFFICULTY_LABELS[args.difficulty].toLowerCase()} » dans les thèmes choisis — toutes les difficultés sont utilisées.`,
      );
    }
  }
  if (pool.length === 0) {
    pool = candidates(args.themes, ['classique'], 0);
    notices.push('Aucune paire disponible pour cette sélection — le thème Général est utilisé.');
  }
  if (pool.length === 0) return null;

  let used: Record<string, true> = { ...args.used };
  let fresh = pool.filter((c) => !used[c.id]);
  if (fresh.length === 0) {
    for (const c of pool) delete used[c.id];
    fresh = pool.slice();
    notices.push('Toutes les paires des thèmes sélectionnés ont été utilisées — le stock repart à zéro.');
  }

  const chosen = pickOne(fresh, rng);
  if (!chosen) return null;
  used = { ...used, [chosen.id]: true };

  const swap = rng() < 0.5;
  return {
    pair: {
      civilWord: swap ? chosen.pair[0] : chosen.pair[1],
      undercoverWord: swap ? chosen.pair[1] : chosen.pair[0],
      themeKey: chosen.themeKey,
      difficulty: chosen.pair[2],
    },
    used,
    notices,
  };
}
