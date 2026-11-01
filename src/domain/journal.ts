import { MAX_GROUPS, MAX_GROUP_NAME, MAX_PLAYER_NAME, MAX_PLAYERS, MAX_SCORE_LOG, MIN_PLAYERS } from './constants';
import { baseRoleKey, isImpostorTeam, specialLabels } from './roles';
import { normalizeWord, squashSpaces } from './text';
import type { GroupDef, Player, PlayerId, ScoreEntry, ScoreEntryPlayer, Winner } from './types';

/* --------------------- Dernière chance de Mr. White --------------------- */

/** Retire l'article initial ; avec `tolerPlural`, ignore un « s » / « x » final. */
function stripWord(text: string, tolerPlural: boolean): string {
  let out = normalizeWord(text).replace(/^(de la|le|la|les|l|un|une|des|du|d) /, '');
  if (tolerPlural && out.length > 3) out = out.replace(/[sx]$/, '');
  return out;
}

/**
 * Compare la proposition de Mr. White au mot des Civils : insensible à la casse,
 * aux accents et aux articles ; le pluriel est toléré SAUF s'il revient à donner
 * le mot de l'Undercover (ex. Pari / Paris).
 */
export function isCorrectGuess(guess: string, civilWord: string, undercoverWord: string): boolean {
  const g = stripWord(guess, false);
  if (!g) return false;
  if (g === stripWord(civilWord, false)) return true;
  if (g === stripWord(undercoverWord, false)) return false;
  const gp = stripWord(guess, true);
  return gp === stripWord(civilWord, true) && gp !== stripWord(undercoverWord, true);
}

/* --------------------------- Groupes de joueurs --------------------------- */

export function sanitizeGroups(raw: unknown): GroupDef[] {
  if (!Array.isArray(raw)) return [];
  const out: GroupDef[] = [];
  for (const g of raw) {
    if (typeof g !== 'object' || g === null) continue;
    const obj = g as { id?: unknown; name?: unknown; players?: unknown };
    if (typeof obj.name !== 'string' || !Array.isArray(obj.players)) continue;
    const name = squashSpaces(obj.name).slice(0, MAX_GROUP_NAME);
    const players = obj.players
      .map((x) => squashSpaces(String(x ?? '')).slice(0, MAX_PLAYER_NAME))
      .filter(Boolean);
    if (!name || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) continue;
    out.push({ id: String(obj.id ?? `g${out.length}${Date.now()}`), name, players });
  }
  return out.slice(0, MAX_GROUPS);
}

function sameNames(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = a.map(normalizeWord).sort();
  const sb = b.map(normalizeWord).sort();
  return sa.every((v, i) => v === sb[i]);
}

/** Groupe dont la liste de noms correspond (peu importe l'ordre), sinon `null`. */
export function findGroup(groups: readonly GroupDef[], names: readonly string[]): GroupDef | null {
  return groups.find((g) => sameNames(g.players, names)) ?? null;
}

/* ------------------------------ Journal ------------------------------ */

const WINNER_LABELS: Readonly<Record<Winner, string>> = {
  civils: 'Les Civils',
  undercover: 'Les Imposteurs',
  idiot: 'Idiot du village',
  amoureux: 'Les Amoureux',
  mrwhite: 'Mr. White',
};

function playerWon(p: Player, winner: Winner, winnerPlayerId: PlayerId | null): boolean {
  switch (winner) {
    case 'civils': return !isImpostorTeam(p);
    case 'undercover': return isImpostorTeam(p);
    case 'idiot': return p.idiot;
    case 'amoureux': return p.loverId !== null;
    case 'mrwhite': return p.id === winnerPlayerId;
  }
}

export interface BuildEntryInput {
  readonly players: readonly Player[];
  readonly winner: Winner;
  readonly winnerPlayerId: PlayerId | null;
  readonly round: number;
  readonly theme: string;
  readonly pairDifficulty: number;
  readonly groups: readonly GroupDef[];
  readonly now?: Date;
}

export function buildScoreEntry(i: BuildEntryInput): ScoreEntry {
  const players: ScoreEntryPlayer[] = i.players.map((p) => {
    const row: ScoreEntryPlayer = {
      name: p.name,
      role: baseRoleKey(p),
      specials: specialLabels(p),
      won: playerWon(p, i.winner, i.winnerPlayerId),
      eliminated: p.eliminated,
    };
    if (p.mytho) row.lie = null;
    if (p.hercule) {
      row.mission = null;
      row.missionText = p.mission;
    }
    return row;
  });
  return {
    date: (i.now ?? new Date()).toISOString(),
    group: findGroup(i.groups, i.players.map((p) => p.name))?.name ?? '',
    round: i.round,
    playerCount: i.players.length,
    winner: i.winner,
    winnerLabel: WINNER_LABELS[i.winner],
    winnerNames: players.filter((p) => p.won).map((p) => p.name),
    theme: i.theme,
    pairDifficulty: i.pairDifficulty,
    players,
  };
}

/** Ajoute une manche en tête du journal, borné aux 200 dernières. */
export function prependEntry(log: readonly ScoreEntry[], entry: ScoreEntry): ScoreEntry[] {
  return [entry, ...log].slice(0, MAX_SCORE_LOG);
}

export function sanitizeScoreLog(raw: unknown): ScoreEntry[] {
  return Array.isArray(raw) ? (raw as ScoreEntry[]).slice(0, MAX_SCORE_LOG) : [];
}
