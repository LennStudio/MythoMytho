import {
  continueText, eliminate, eliminationHeadline, eliminationNotes, isCorrectGuess, isImpostorTeam,
  resolveElimination, revealText,
  type AssignResult, type DrawnPair, type LieOutcome, type MissionOutcome, type Player, type PlayerId,
  type Resolution, type WinReason, type Winner,
} from '@/domain';

/* ----------------------------------------------------------------------
 *  Réducteur de partie — TypeScript pur : aucune dépendance à React ni à
 *  React Native. L'interface ne fait que lire l'état et envoyer des actions.
 * ---------------------------------------------------------------------- */

export type Phase = 'reveal' | 'vote' | 'gameover';
export type Modal = 'none' | 'card' | 'confirm' | 'announce' | 'pick' | 'guess';
export type PickPurpose = 'orion' | 'prometheus';

export interface Announcement {
  readonly headline: string;
  readonly lines: readonly string[];
  readonly text: string;
  readonly button: string;
}

export type GuessView =
  | { readonly stage: 'asking' }
  | {
      readonly stage: 'result';
      readonly outcome: 'win' | 'miss' | 'skip';
      readonly playerName: string;
      readonly guess: string;
      readonly hasNext: boolean;
    };

export interface GameState {
  readonly active: boolean;
  readonly phase: Phase;
  readonly round: number;
  readonly players: readonly Player[];
  readonly civilWord: string;
  readonly undercoverWord: string;
  readonly civilWordHint: string;
  readonly pairTheme: string;
  readonly pairDifficulty: number;
  readonly voteCount: number;

  readonly winner: Winner | null;
  readonly winnerDetail: string;
  readonly winnerReason: WinReason;
  readonly winnerPlayerId: PlayerId | null;

  readonly modal: Modal;
  readonly summaryOpen: boolean;
  readonly openCardId: PlayerId | null;
  readonly confirmTargetId: PlayerId | null;
  readonly announce: Announcement | null;
  readonly pickPurpose: PickPurpose | null;
  readonly pendingOrionId: PlayerId | null;
  readonly pendingPrometheusId: PlayerId | null;
  /** Éliminés de la chaîne en cours (vote puis tirs successifs). */
  readonly chainIds: readonly PlayerId[];
  readonly guessQueue: readonly PlayerId[];
  readonly guess: GuessView;

  /** Réponses de fin de manche (Mytho / Hercule). */
  readonly lie: LieOutcome;
  readonly mission: MissionOutcome;
}

export const initialGameState: GameState = {
  active: false, phase: 'reveal', round: 1, players: [], civilWord: '', undercoverWord: '',
  civilWordHint: '', pairTheme: '', pairDifficulty: 0, voteCount: 0,
  winner: null, winnerDetail: '', winnerReason: null, winnerPlayerId: null,
  modal: 'none', summaryOpen: false, openCardId: null, confirmTargetId: null, announce: null,
  pickPurpose: null, pendingOrionId: null, pendingPrometheusId: null, chainIds: [],
  guessQueue: [], guess: { stage: 'asking' }, lie: null, mission: null,
};

export type GameAction =
  | { type: 'START'; round: number; assign: AssignResult; pair: DrawnPair }
  | { type: 'RESET' }
  | { type: 'OPEN_CARD'; id: PlayerId }
  | { type: 'CLOSE_CARD' }
  | { type: 'CANCEL_CARD' }
  | { type: 'START_VOTE' }
  | { type: 'ASK_ELIMINATE'; id: PlayerId }
  | { type: 'CANCEL_CONFIRM' }
  | { type: 'CONFIRM_ELIMINATE' }
  | { type: 'ANNOUNCE_CONTINUE' }
  | { type: 'PICK_TARGET'; id: PlayerId }
  | { type: 'GUESS_SUBMIT'; value: string | null }
  | { type: 'GUESS_CONTINUE' }
  | { type: 'OPEN_SUMMARY' }
  | { type: 'CLOSE_SUMMARY' }
  | { type: 'ANSWER_LIE'; value: Exclude<LieOutcome, null> }
  | { type: 'ANSWER_MISSION'; value: Exclude<MissionOutcome, null> };

/* ------------------------------ Sélecteurs ------------------------------ */

export const alive = (s: GameState): Player[] => s.players.filter((p) => !p.eliminated);
export const playerOf = (s: GameState, id: PlayerId | null): Player | undefined =>
  id === null ? undefined : s.players.find((p) => p.id === id);
export const viewedCount = (s: GameState): number => s.players.filter((p) => p.viewed).length;
export const allViewed = (s: GameState): boolean => s.players.length > 0 && viewedCount(s) === s.players.length;

/* ------------------------------- Helpers ------------------------------- */

const withPlayer = (players: readonly Player[], id: PlayerId, patch: Partial<Player>): Player[] =>
  players.map((p) => (p.id === id ? { ...p, ...patch } : p));

function startState(round: number, assign: AssignResult, pair: DrawnPair): GameState {
  return {
    ...initialGameState,
    active: true,
    round,
    players: assign.players,
    civilWord: assign.civilWord,
    undercoverWord: assign.undercoverWord,
    civilWordHint: assign.civilWordHint,
    pairTheme: pair.themeKey,
    pairDifficulty: pair.difficulty,
  };
}

/** Applique le résultat d'une élimination : annonce, étapes en attente ou fin de manche. */
function applyResolution(
  s: GameState,
  players: readonly Player[],
  victims: readonly Player[],
  r: Resolution,
  shotBy: Player | null,
): GameState {
  const lines = [...victims.map(revealText), ...eliminationNotes(victims)];
  const headline = eliminationHeadline(victims, shotBy);
  const base: GameState = { ...s, players, chainIds: r.chain.map((p) => p.id), modal: 'announce' };

  if (r.orionPending) {
    return {
      ...base,
      winner: null, winnerDetail: '', winnerReason: null, guessQueue: [],
      pendingOrionId: r.orionPending.id, pendingPrometheusId: null,
      announce: {
        headline, lines,
        text: `Orion (${r.orionPending.name}) emporte un joueur avec lui/elle : désignez sa cible.`,
        button: 'Désigner la cible',
      },
    };
  }
  const { text, button } = continueText(r, players);
  return {
    ...base,
    winner: r.winner, winnerDetail: r.winnerDetail, winnerReason: r.winnerReason,
    guessQueue: r.guessQueue.map((p) => p.id),
    pendingOrionId: null,
    pendingPrometheusId: r.prometheusPending?.id ?? null,
    announce: { headline, lines, text, button },
  };
}

/** Étape qui suit la fermeture de l'annonce (ou d'une modale intermédiaire). */
function advance(s: GameState): GameState {
  if (s.pendingOrionId !== null) return { ...s, modal: 'pick', pickPurpose: 'orion', announce: null };
  if (s.pendingPrometheusId !== null) return { ...s, modal: 'pick', pickPurpose: 'prometheus', announce: null };
  if (s.guessQueue.length > 0) return { ...s, modal: 'guess', guess: { stage: 'asking' }, announce: null };
  return finishElimination({ ...s, announce: null });
}

function finishElimination(s: GameState): GameState {
  if (s.winner) return { ...s, modal: 'none', phase: 'gameover' };
  return { ...s, modal: 'none', phase: 'vote' };
}

/* ------------------------------- Réducteur ------------------------------- */

export function gameReducer(s: GameState, a: GameAction): GameState {
  switch (a.type) {
    case 'START':
      return startState(a.round, a.assign, a.pair);

    case 'RESET':
      return initialGameState;

    case 'OPEN_CARD': {
      const p = playerOf(s, a.id);
      if (!p || p.viewed || s.phase !== 'reveal') return s;
      return { ...s, modal: 'card', openCardId: a.id };
    }
    case 'CLOSE_CARD': {
      if (s.openCardId === null) return s;
      return { ...s, modal: 'none', openCardId: null, players: withPlayer(s.players, s.openCardId, { viewed: true }) };
    }

    case 'CANCEL_CARD':
      return { ...s, modal: 'none', openCardId: null };

    case 'START_VOTE':
      return allViewed(s) && s.phase === 'reveal' ? { ...s, phase: 'vote' } : s;

    case 'ASK_ELIMINATE': {
      const p = playerOf(s, a.id);
      if (!p || p.eliminated || s.phase !== 'vote') return s;
      return { ...s, modal: 'confirm', confirmTargetId: a.id };
    }
    case 'CANCEL_CONFIRM':
      return { ...s, modal: 'none', confirmTargetId: null };

    case 'CONFIRM_ELIMINATE': {
      if (s.confirmTargetId === null) return s;
      const out = eliminate(s.players, s.confirmTargetId);
      if (out.victims.length === 0) return { ...s, modal: 'none', confirmTargetId: null };
      const voteCount = s.voteCount + 1;
      const r = resolveElimination(out.players, out.victims, { fromVote: true, voteCount, earlier: [] });
      return applyResolution({ ...s, voteCount, confirmTargetId: null }, out.players, out.victims, r, null);
    }

    case 'ANNOUNCE_CONTINUE':
      return advance(s);

    case 'PICK_TARGET': {
      const target = playerOf(s, a.id);
      if (!target || target.eliminated) return s;

      if (s.pickPurpose === 'orion' && s.pendingOrionId !== null) {
        const orion = playerOf(s, s.pendingOrionId);
        if (!orion) return s;
        const marked = withPlayer(s.players, orion.id, { orionDone: true });
        const out = eliminate(marked, target.id);
        const earlier = s.chainIds
          .map((id) => out.players.find((p) => p.id === id))
          .filter((p): p is Player => p !== undefined);
        const r = resolveElimination(out.players, out.victims, { fromVote: false, voteCount: s.voteCount, earlier });
        return applyResolution({ ...s, pickPurpose: null, pendingOrionId: null }, out.players, out.victims, r, orion);
      }

      if (s.pickPurpose === 'prometheus' && s.pendingPrometheusId !== null) {
        const players = withPlayer(s.players, s.pendingPrometheusId, { prometheusDone: true });
        const hasGuess = s.guessQueue.length > 0;
        return {
          ...s,
          players, modal: 'announce', pickPurpose: null, pendingPrometheusId: null,
          announce: {
            headline: `Prométhée éclaire le groupe : ${target.name} est ${isImpostorTeam(target) ? 'un imposteur' : 'un Civil'} !`,
            lines: [],
            text: hasGuess
              ? `${s.guessQueue.length > 1 ? 'Les Mr. White ont' : 'Mr. White a'} une dernière chance : deviner le mot des Civils.`
              : 'La partie continue — au prochain vote.',
            button: hasGuess ? 'Tenter sa chance' : 'Continuer',
          },
        };
      }
      return s;
    }

    case 'GUESS_SUBMIT': {
      const [currentId, ...rest] = s.guessQueue;
      const p = playerOf(s, currentId ?? null);
      if (!p) return s;
      const text = (a.value ?? '').trim();
      const skipped = a.value === null;
      if (!skipped && text === '') return s;
      const correct = !skipped && isCorrectGuess(text, s.civilWord, s.undercoverWord);
      if (correct) {
        return {
          ...s,
          winner: 'mrwhite', winnerDetail: p.name, winnerPlayerId: p.id, winnerReason: null, guessQueue: [],
          guess: { stage: 'result', outcome: 'win', playerName: p.name, guess: text, hasNext: false },
        };
      }
      return {
        ...s,
        guessQueue: rest,
        guess: { stage: 'result', outcome: skipped ? 'skip' : 'miss', playerName: p.name, guess: text, hasNext: rest.length > 0 },
      };
    }

    case 'GUESS_CONTINUE': {
      if (s.guessQueue.length > 0) return { ...s, guess: { stage: 'asking' } };
      return finishElimination({ ...s, guess: { stage: 'asking' } });
    }

    case 'OPEN_SUMMARY':
      return { ...s, summaryOpen: true };
    case 'CLOSE_SUMMARY':
      return { ...s, summaryOpen: false };

    case 'ANSWER_LIE':
      return { ...s, lie: a.value };
    case 'ANSWER_MISSION':
      return { ...s, mission: a.value };
  }
}
