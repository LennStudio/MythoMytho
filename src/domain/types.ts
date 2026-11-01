/* ------------------------------------------------------------------ *
 *  Types du domaine MythoMytho — aucun import React / React Native.
 * ------------------------------------------------------------------ */

export type Difficulty = 1 | 2 | 3;
export type DifficultyFilter = 0 | Difficulty; // 0 = toutes les paires
export type PrivacyMode = 'standard' | 'auto' | 'hold';
export type ThemeMode = 'light' | 'dark';
export type PlayerId = number;

/** [mot des Civils, mot de l'Undercover, difficulté] */
export type WordPair = readonly [string, string, Difficulty];

export interface WordTheme {
  readonly key: string;
  readonly label: string;
  readonly desc: string;
  readonly pairs: readonly WordPair[];
  readonly custom?: boolean;
}

/** Forme brute de `words.json` (difficulté facultative, validée au chargement). */
export interface WordsFile {
  readonly version: number;
  readonly difficulty: Readonly<Record<string, string>>;
  readonly themes: readonly {
    readonly key: string;
    readonly label: string;
    readonly desc: string;
    readonly pairs: readonly (readonly [string, string, number?])[];
  }[];
}

export interface MissionsFile {
  readonly version: number;
  readonly words: readonly string[];
  readonly missions: readonly string[];
}

export interface MissionPool {
  readonly words: readonly string[];
  readonly missions: readonly string[];
}

/* ------------------------------ Rôles ------------------------------ */

export type BaseRole = 'civil' | 'undercover' | 'mrwhite' | 'espion';
export type TraitorRole = 'fauxfrere' | 'judas';
/** Rôle « de base » tel qu'affiché dans le journal et le récapitulatif. */
export type RoleKey = BaseRole | TraitorRole;

export const SPECIAL_KEYS = [
  'idiot', 'fantome', 'mime', 'procureur', 'amoureux', 'mytho', 'voyeur', 'janus',
  'fauxfrere', 'jumeaux', 'tiresias', 'orion', 'hercule', 'prometheus', 'judas',
] as const;
export type SpecialKey = (typeof SPECIAL_KEYS)[number];
export type SpecialRolesConfig = Readonly<Record<SpecialKey, boolean>>;

export type TwinTitle = 'Castor' | 'Pollux';

export interface TiresiasHint {
  readonly prefix: string;
  readonly count: number;
}

export interface Player {
  readonly id: PlayerId;
  readonly name: string;
  readonly baseRole: BaseRole;
  readonly traitor: TraitorRole | null;
  /** Mot reçu ; chaîne vide si aucun (Mr. White, Espion, Tirésias). */
  readonly word: string;
  readonly viewed: boolean;
  readonly eliminated: boolean;

  readonly idiot: boolean;
  readonly fantome: boolean;
  readonly mime: boolean;
  readonly procureur: boolean;
  readonly mytho: boolean;
  readonly janus: boolean;
  readonly voyeur: boolean;
  readonly tiresias: boolean;
  readonly orion: boolean;
  readonly orionDone: boolean;
  readonly prometheus: boolean;
  readonly prometheusDone: boolean;
  readonly hercule: boolean;

  readonly loverId: PlayerId | null;
  readonly twin: { readonly partnerId: PlayerId; readonly title: TwinTitle } | null;
  readonly mission: string;
  readonly tiresiasHint: TiresiasHint | null;
  readonly voyeurNames: readonly string[];
  readonly janusWords: readonly string[];
  /** Judas : nom d'un vrai imposteur. */
  readonly judasKnows: string;
}

/* ----------------------------- Réglages ----------------------------- */

export interface GameSettings {
  readonly playerCount: number;
  readonly undercoverCount: number;
  readonly mrWhiteCount: number;
  readonly espionCount: number;
  readonly autoUndercover: boolean;
  readonly roles: SpecialRolesConfig;
  readonly selectedThemes: Readonly<Record<string, boolean>>;
  readonly difficulty: DifficultyFilter;
  readonly difficultyLevel: Difficulty;
  readonly privacy: PrivacyMode;
  readonly autoHideSec: number;
  readonly showRole: boolean;
  readonly timerEnabled: boolean;
  readonly timerDurationMin: number;
  readonly timerSound: boolean;
}

/* ------------------------------ Manche ------------------------------ */

export type Winner = 'civils' | 'undercover' | 'idiot' | 'amoureux' | 'mrwhite';
export type WinReason = 'deadlock2' | 'deadlock4' | null;

export interface DrawnPair {
  readonly civilWord: string;
  readonly undercoverWord: string;
  readonly themeKey: string;
  readonly difficulty: Difficulty;
}

export type AssignWarning =
  | { readonly kind: 'insufficient-players'; readonly role: string }
  | { readonly kind: 'missions-unavailable' };

/* ------------------------------ Journal ------------------------------ */

export type LieOutcome = 'spotted' | 'passed' | null;
export type MissionOutcome = 'success' | 'fail' | null;

export interface ScoreEntryPlayer {
  name: string;
  role: RoleKey;
  specials: string[];
  won: boolean;
  eliminated: boolean;
  lie?: LieOutcome;
  mission?: MissionOutcome;
  missionText?: string;
}

export interface ScoreEntry {
  date: string;
  group: string;
  round: number;
  playerCount: number;
  winner: Winner;
  winnerLabel: string;
  winnerNames: string[];
  theme: string;
  pairDifficulty: number;
  players: ScoreEntryPlayer[];
}

export interface GroupDef {
  readonly id: string;
  readonly name: string;
  readonly players: readonly string[];
}
