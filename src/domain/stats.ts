import { DIFFICULTY_LABELS, MAX_CUSTOM_PAIRS } from './constants';
import { ROLE_NAMES } from './roles';
import { pairKey, sanitizePair, toDifficulty } from './words';
import type { Difficulty, RoleKey, ScoreEntry, WordPair } from './types';

/* -------------------------------- Stats -------------------------------- */

export interface PlayerStat { games: number; wins: number; streak: number; best: number }
export interface RoleStat { games: number; wins: number }
export interface LieStat { games: number; passed: number }
export interface MissionStat { games: number; success: number }

export interface Stats {
  readonly byPlayer: Readonly<Record<string, PlayerStat>>;
  readonly byRole: Readonly<Record<string, RoleStat>>;
  readonly lies: Readonly<Record<string, LieStat>>;
  readonly missions: Readonly<Record<string, MissionStat>>;
  /** Nombre de manches détaillées (les anciennes entrées sans joueurs sont exclues). */
  readonly tracked: number;
}

export const percent = (part: number, total: number): number => (total ? Math.round((part / total) * 100) : 0);

/** `entries` : du plus récent au plus ancien (ordre de stockage). */
export function computeStats(entries: readonly ScoreEntry[]): Stats {
  const byPlayer: Record<string, PlayerStat> = {};
  const byRole: Record<string, RoleStat> = {};
  const lies: Record<string, LieStat> = {};
  const missions: Record<string, MissionStat> = {};
  let tracked = 0;

  for (const entry of entries.slice().reverse()) {
    if (!Array.isArray(entry.players) || entry.players.length === 0) continue;
    tracked += 1;
    for (const p of entry.players) {
      const ps = (byPlayer[p.name] ??= { games: 0, wins: 0, streak: 0, best: 0 });
      ps.games += 1;
      if (p.won) {
        ps.wins += 1;
        ps.streak += 1;
        if (ps.streak > ps.best) ps.best = ps.streak;
      } else ps.streak = 0;

      const rs = (byRole[p.role] ??= { games: 0, wins: 0 });
      rs.games += 1;
      if (p.won) rs.wins += 1;

      if (p.lie === 'spotted' || p.lie === 'passed') {
        const ls = (lies[p.name] ??= { games: 0, passed: 0 });
        ls.games += 1;
        if (p.lie === 'passed') ls.passed += 1;
      }
      if (p.mission === 'success' || p.mission === 'fail') {
        const ms = (missions[p.name] ??= { games: 0, success: 0 });
        ms.games += 1;
        if (p.mission === 'success') ms.success += 1;
      }
    }
  }
  return { byPlayer, byRole, lies, missions, tracked };
}

export interface LeaderRow {
  readonly name: string;
  readonly wins: number;
  readonly stat: PlayerStat | null;
}

export function leaderboard(entries: readonly ScoreEntry[], stats: Stats): LeaderRow[] {
  const wins = new Map<string, number>();
  for (const e of entries) for (const n of e.winnerNames ?? []) wins.set(n, (wins.get(n) ?? 0) + 1);
  const rate = (s: PlayerStat | null): number => (s ? percent(s.wins, s.games) : 0);
  return [...wins.entries()]
    .map(([name, w]) => ({ name, wins: w, stat: stats.byPlayer[name] ?? null }))
    .sort((a, b) => (b.wins !== a.wins ? b.wins - a.wins : rate(b.stat) - rate(a.stat)));
}

export const FILTER_ALL = 'all';
export const FILTER_NONE = '__none';

export function filterByGroup(entries: readonly ScoreEntry[], group: string): ScoreEntry[] {
  if (group === FILTER_ALL) return entries.slice();
  return entries.filter((e) => (group === FILTER_NONE ? !e.group : e.group === group));
}

export function groupNames(entries: readonly ScoreEntry[]): string[] {
  return [...new Set(entries.map((e) => e.group).filter(Boolean))].sort();
}

/* -------------------------------- Exports -------------------------------- */

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const ROLE_LABEL = (r: RoleKey): string => ROLE_NAMES[r] ?? r;

/** CSV (séparateur « ; », BOM UTF-8) : s'ouvre directement dans Excel en français. */
export function buildCsv(entries: readonly ScoreEntry[]): string {
  const rows: unknown[][] = [[
    'date', 'manche', 'nb_joueurs', 'vainqueur', 'groupe', 'joueur', 'role', 'roles_speciaux',
    'victoire', 'elimine', 'difficulte_paire', 'theme', 'mensonge', 'mission',
  ]];
  for (const e of entries.slice().reverse()) {
    const head = [e.date || '', e.round, e.playerCount, e.winnerLabel, e.group || ''];
    const diff = e.pairDifficulty ? DIFFICULTY_LABELS[toDifficulty(e.pairDifficulty)] : '';
    const theme = e.theme || '';
    if (Array.isArray(e.players) && e.players.length > 0) {
      for (const p of e.players) {
        rows.push([
          ...head, p.name, ROLE_LABEL(p.role), (p.specials ?? []).join(' + '),
          p.won ? 'oui' : 'non', p.eliminated ? 'oui' : 'non', diff, theme,
          p.lie === 'passed' ? 'réussi' : p.lie === 'spotted' ? 'repéré' : '',
          p.mission === 'success' ? 'accomplie' : p.mission === 'fail' ? 'ratée' : '',
        ]);
      }
    } else {
      rows.push([...head, (e.winnerNames ?? []).join(', '), '', '', 'oui', '', diff, theme, '', '']);
    }
  }
  return `\uFEFF${rows.map((r) => r.map(csvCell).join(';')).join('\r\n')}`;
}

export function buildScoreJson(entries: readonly ScoreEntry[], now: Date = new Date()): string {
  const s = computeStats(entries);
  return JSON.stringify(
    {
      app: 'mythomytho',
      kind: 'score-log',
      version: 1,
      exportedAt: now.toISOString(),
      entries,
      stats: {
        players: Object.entries(s.byPlayer).map(([name, v]) => ({
          name, games: v.games, wins: v.wins, winRate: percent(v.wins, v.games),
          currentStreak: v.streak, bestStreak: v.best,
        })),
        roles: Object.entries(s.byRole).map(([role, v]) => ({
          role, games: v.games, wins: v.wins, winRate: percent(v.wins, v.games),
        })),
        missions: Object.entries(s.missions).map(([name, v]) => ({
          name, games: v.games, successful: v.success, successRate: percent(v.success, v.games),
        })),
        lies: Object.entries(s.lies).map(([name, v]) => ({
          name, games: v.games, passed: v.passed, successRate: percent(v.passed, v.games),
        })),
      },
    },
    null,
    2,
  );
}

/* --------------------------- Paires personnalisées --------------------------- */

export function sanitizeCustomPairs(raw: unknown): WordPair[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: WordPair[] = [];
  for (const item of raw) {
    const pair = sanitizePair(item);
    if (!pair) continue;
    const key = pairKey(pair);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pair);
  }
  return out.slice(0, MAX_CUSTOM_PAIRS);
}

export type AddPairResult =
  | { readonly ok: true; readonly pairs: readonly WordPair[] }
  | { readonly ok: false; readonly reason: 'invalid' | 'duplicate' | 'full' };

export function addCustomPair(
  current: readonly WordPair[],
  wordA: string,
  wordB: string,
  difficulty: Difficulty,
): AddPairResult {
  const pair = sanitizePair([wordA, wordB, difficulty]);
  if (!pair) return { ok: false, reason: 'invalid' };
  if (current.length >= MAX_CUSTOM_PAIRS) return { ok: false, reason: 'full' };
  const key = pairKey(pair);
  if (current.some((p) => pairKey(p) === key)) return { ok: false, reason: 'duplicate' };
  return { ok: true, pairs: [...current, pair] };
}

export interface MergeResult {
  readonly pairs: readonly WordPair[];
  readonly added: number;
  readonly ignored: number;
}

/** Fusionne sans écraser : ignore doublons, paires invalides et dépassement de limite. */
export function mergeCustomPairs(current: readonly WordPair[], incoming: readonly unknown[]): MergeResult {
  const keys = new Set(current.map((p) => pairKey(p)));
  const pairs = [...current];
  let added = 0;
  let ignored = 0;
  for (const item of incoming) {
    const pair = sanitizePair(item);
    if (!pair || pairs.length >= MAX_CUSTOM_PAIRS) {
      ignored += 1;
      continue;
    }
    const key = pairKey(pair);
    if (keys.has(key)) {
      ignored += 1;
      continue;
    }
    keys.add(key);
    pairs.push(pair);
    added += 1;
  }
  return { pairs, added, ignored };
}

export function buildPairsExport(pairs: readonly WordPair[]): string {
  return JSON.stringify({ app: 'mythomytho', kind: 'custom-pairs', version: 1, pairs }, null, 2);
}

/** Accepte un export de l'application ou un simple tableau `[["a","b",2], …]`. */
export function parsePairsImport(text: string): unknown[] | null {
  try {
    const data: unknown = JSON.parse(text);
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && data !== null && Array.isArray((data as { pairs?: unknown }).pairs)) {
      return (data as { pairs: unknown[] }).pairs;
    }
  } catch {
    /* JSON invalide */
  }
  return null;
}

/* ------------------------------ Lien de partage ------------------------------ */

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function utf8Encode(text: string): number[] {
  const bytes: number[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x80) bytes.push(cp);
    else if (cp < 0x800) bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
  }
  return bytes;
}

function utf8Decode(bytes: readonly number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++] as number;
    let cp: number;
    if (b < 0x80) cp = b;
    else if (b < 0xe0) cp = ((b & 31) << 6) | ((bytes[i++] ?? 0) & 63);
    else if (b < 0xf0) cp = ((b & 15) << 12) | (((bytes[i++] ?? 0) & 63) << 6) | ((bytes[i++] ?? 0) & 63);
    else cp = ((b & 7) << 18) | (((bytes[i++] ?? 0) & 63) << 12) | (((bytes[i++] ?? 0) & 63) << 6) | ((bytes[i++] ?? 0) & 63);
    out += String.fromCodePoint(cp);
  }
  return out;
}

/** base64url sans padding, identique à l'ancien format `#paires=…`. */
export function encodeShared(pairs: readonly WordPair[]): string {
  const bytes = utf8Encode(JSON.stringify(pairs));
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] as number;
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2] as string;
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)] as string;
    if (b !== undefined) out += B64[((b & 15) << 2) | ((c ?? 0) >> 6)] as string;
    if (c !== undefined) out += B64[c & 63] as string;
  }
  return out;
}

export function decodeShared(code: string): WordPair[] | null {
  try {
    const clean = code.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const bytes: number[] = [];
    let buffer = 0;
    let bits = 0;
    for (const ch of clean) {
      const v = B64.indexOf(ch);
      if (v < 0) return null;
      buffer = (buffer << 6) | v;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes.push((buffer >> bits) & 255);
      }
    }
    const data: unknown = JSON.parse(utf8Decode(bytes));
    return Array.isArray(data) ? sanitizeCustomPairs(data) : null;
  } catch {
    return null;
  }
}
