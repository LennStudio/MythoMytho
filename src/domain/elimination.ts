import { isAlive, isImpostorTeam, isTraitor } from './roles';
import type { Player, PlayerId, WinReason, Winner } from './types';

export function alivePlayers(players: readonly Player[]): Player[] {
  return players.filter(isAlive);
}

/** Sans Procureur vivant ni Fantôme en jeu, la règle d'impasse s'applique. */
export function deadlockRuleActive(players: readonly Player[]): boolean {
  const procureurAlive = players.some((p) => p.procureur && !p.eliminated);
  const fantomeInGame = players.some((p) => p.fantome);
  return !procureurAlive && !fantomeInGame;
}

export interface EliminationOutcome {
  readonly players: readonly Player[];
  /** Joueurs éliminés par cette action : la cible, plus son/sa partenaire Amoureux(se). */
  readonly victims: readonly Player[];
}

/** Élimine un joueur ; son Amoureux(se) encore en vie le/la suit. */
export function eliminate(players: readonly Player[], victimId: PlayerId): EliminationOutcome {
  const victim = players.find((p) => p.id === victimId);
  if (!victim || victim.eliminated) return { players, victims: [] };
  const ids = new Set<PlayerId>([victimId]);
  if (victim.loverId !== null) {
    const lover = players.find((p) => p.id === victim.loverId);
    if (lover && !lover.eliminated) ids.add(lover.id);
  }
  const next = players.map((p) => (ids.has(p.id) ? { ...p, eliminated: true } : p));
  return { players: next, victims: next.filter((p) => ids.has(p.id)) };
}

export interface ResolveContext {
  /** true si l'élimination vient d'un vote (et non d'un tir d'Orion). */
  readonly fromVote: boolean;
  /** Nombre de votes déjà tenus dans la manche, celui-ci compris. */
  readonly voteCount: number;
  /** Joueurs déjà éliminés plus tôt dans la même chaîne (vote → tirs successifs). */
  readonly earlier: readonly Player[];
}

export interface Resolution {
  /** Orion vient d'être éliminé : il doit désigner une cible avant toute autre étape. */
  readonly orionPending: Player | null;
  readonly winner: Winner | null;
  /** Nom de l'Idiot vainqueur, le cas échéant. */
  readonly winnerDetail: string;
  readonly winnerReason: WinReason;
  /** Mr. White éliminés dans la chaîne : chacun a droit à une dernière chance. */
  readonly guessQueue: readonly Player[];
  /** Prométhée éliminé alors que la partie continue : doit désigner un joueur. */
  readonly prometheusPending: Player | null;
  /** Tous les imposteurs sont tombés mais un traître reste en vie. */
  readonly traitorStillHidden: boolean;
  /** Tous les joueurs éliminés dans la chaîne (cette action incluse). */
  readonly chain: readonly Player[];
}

function amoureuxWin(players: readonly Player[], alive: readonly Player[]): { reason: WinReason } | null {
  if (deadlockRuleActive(players) && alive.length === 4) {
    const coupleAlive = alive.some((p) => {
      if (p.loverId === null) return false;
      const lover = players.find((x) => x.id === p.loverId);
      return lover !== undefined && !lover.eliminated;
    });
    if (coupleAlive) return { reason: 'deadlock4' };
  }
  const lover = players.find((p) => {
    if (p.eliminated || p.loverId === null) return false;
    const partner = players.find((x) => x.id === p.loverId);
    return partner !== undefined && !partner.eliminated;
  });
  if (lover) {
    const others = players.filter((p) => p.id !== lover.id && p.id !== lover.loverId);
    if (others.length > 0 && others.every((p) => p.eliminated)) return { reason: null };
  }
  return null;
}

/**
 * Évalue la situation après une élimination. `players` est l'état APRÈS
 * l'élimination, `victims` les joueurs tombés lors de cette action.
 */
export function resolveElimination(
  players: readonly Player[],
  victims: readonly Player[],
  ctx: ResolveContext,
): Resolution {
  const chain = [...ctx.earlier, ...victims];
  const alive = alivePlayers(players);

  const orion = victims.find((p) => p.orion && !p.orionDone) ?? null;
  if (orion && alive.length > 0) {
    return {
      orionPending: orion, winner: null, winnerDetail: '', winnerReason: null,
      guessQueue: [], prometheusPending: null, traitorStillHidden: false, chain,
    };
  }

  let winner: Winner | null = null;
  let winnerDetail = '';
  let winnerReason: WinReason = null;

  const idiot = victims.find((p) => p.idiot);
  if (ctx.fromVote && ctx.voteCount === 1 && idiot) {
    winner = 'idiot';
    winnerDetail = idiot.name;
  } else {
    const love = amoureuxWin(players, alive);
    if (love) {
      winner = 'amoureux';
      winnerReason = love.reason;
    }
    if (!winner && deadlockRuleActive(players) && alive.length === 2 && alive.some(isImpostorTeam)) {
      winner = 'undercover';
      winnerReason = 'deadlock2';
    }
    if (!winner) {
      const impostors = alive.filter(isImpostorTeam).length;
      const civils = alive.filter((p) => !isImpostorTeam(p)).length;
      if (impostors === 0) winner = 'civils';
      else if (civils === 0) winner = 'undercover';
    }
  }

  const guessQueue = winner === 'idiot' ? [] : chain.filter((p) => p.baseRole === 'mrwhite');
  const prometheus = chain.find((p) => p.prometheus && !p.prometheusDone) ?? null;
  const prometheusPending = prometheus && !winner && alive.length > 0 ? prometheus : null;

  const traitorAlive = players.some((p) => isTraitor(p) && !p.eliminated);
  const realImpostorAlive = players.some((p) => !p.eliminated && p.baseRole !== 'civil');

  return {
    orionPending: null, winner, winnerDetail, winnerReason, guessQueue,
    prometheusPending, traitorStillHidden: traitorAlive && !realImpostorAlive, chain,
  };
}

/* ------------------------- Textes de l'annonce ------------------------- */

export function revealText(p: Player): string {
  if (p.traitor === 'judas') return `${p.name} était Judas`;
  if (p.traitor === 'fauxfrere') return `${p.name} était le Faux-Frère`;
  if (p.baseRole === 'mrwhite') return `${p.name} était Mr. White`;
  if (p.baseRole === 'espion') return `${p.name} était l'Espion`;
  if (p.baseRole === 'undercover') return `${p.name} était l'Undercover`;
  return `${p.name} était Civil`;
}

export function eliminationHeadline(victims: readonly Player[], shotBy: Player | null): string {
  const names = victims.map((p) => p.name).join(' et ');
  if (shotBy) return `${shotBy.name} emporte ${names} avec lui/elle !`;
  return names + (victims.length > 1 ? ' ont été éliminés' : ' a été éliminé(e)');
}

export function eliminationNotes(victims: readonly Player[]): string[] {
  const notes: string[] = [];
  for (const p of victims) {
    if (p.fantome) notes.push(`👻 ${p.name} est le Fantôme — il/elle continue de voter aux prochains tours !`);
    if (p.orion) notes.push(`🏹 ${p.name} est Orion, le Chasseur — il/elle emporte un joueur avec lui/elle !`);
    if (p.prometheus) notes.push(`🔥 ${p.name} est Prométhée — il/elle éclaire le groupe en révélant le camp d'un joueur !`);
  }
  return notes;
}

export function traitorNames(players: readonly Player[]): string[] {
  const out: string[] = [];
  if (players.some((p) => p.traitor === 'fauxfrere')) out.push('le Faux-Frère');
  if (players.some((p) => p.traitor === 'judas')) out.push('Judas');
  return out;
}

export function continueText(r: Resolution, players: readonly Player[]): { text: string; button: string } {
  if (r.prometheusPending) {
    return {
      text: `Prométhée (${r.prometheusPending.name}) se sacrifie pour éclairer le groupe : il/elle désigne un joueur dont le camp sera révélé à tous.`,
      button: 'Désigner un joueur',
    };
  }
  if (r.guessQueue.length > 0) {
    return {
      text: `${r.guessQueue.length > 1 ? 'Les Mr. White ont' : 'Mr. White a'} une dernière chance : deviner le mot des Civils.`,
      button: 'Tenter sa chance',
    };
  }
  switch (r.winner) {
    case 'civils': {
      const t = traitorNames(players);
      return {
        text: t.length > 0
          ? `Tous les imposteurs et ${t.join(' et ')} ont été démasqués !`
          : 'Tous les imposteurs ont été démasqués !',
        button: 'Voir le résultat',
      };
    }
    case 'undercover':
      return {
        text: r.winnerReason === 'deadlock2'
          ? "Il ne reste plus que 2 joueurs : l'Undercover/Mr. White l'emporte automatiquement !"
          : 'Il ne reste plus aucun Civil !',
        button: 'Voir le résultat',
      };
    case 'idiot':
      return { text: `${r.winnerDetail} était l'Idiot du village et remporte la partie dès le premier vote !`, button: 'Voir le résultat' };
    case 'amoureux':
      return {
        text: r.winnerReason === 'deadlock4'
          ? "Il ne reste plus que 4 joueurs : les Amoureux l'emportent automatiquement !"
          : 'Les Amoureux sont les deux derniers survivants !',
        button: 'Voir le résultat',
      };
    default:
      break;
  }
  if (r.traitorStillHidden) {
    return {
      text: "Tous les imposteurs ont été démasqués, mais la partie n'est pas terminée : un traître se cache encore parmi vous !",
      button: 'Continuer',
    };
  }
  return { text: 'La partie continue — au prochain vote.', button: 'Continuer' };
}

export interface GameOverText {
  readonly title: string;
  readonly subtitle: string;
}

export function gameOverText(
  winner: Winner,
  reason: WinReason,
  detail: string,
  players: readonly Player[],
  civilWord: string,
): GameOverText {
  const manyImpostors = players.filter((p) => p.baseRole !== 'civil').length > 1;
  const traitors = players.filter(isTraitor);
  const traitorSuffix = (verb: string): string =>
    traitors.map((t) => ` ${t.traitor === 'judas' ? 'Judas' : 'Le Faux-Frère'} (${t.name}) ${verb}`).join('');

  switch (winner) {
    case 'civils':
      return {
        title: 'Les Civils ont gagné !',
        subtitle:
          (manyImpostors ? 'Tous les imposteurs ont été démasqués et éliminés.' : "L'imposteur a été démasqué et éliminé.") +
          traitorSuffix('aussi.'),
      };
    case 'undercover':
      return {
        title: manyImpostors ? 'Les Undercovers ont gagné !' : "L'Undercover a gagné !",
        subtitle:
          (reason === 'deadlock2'
            ? "Il ne restait plus que 2 joueurs : la situation était dans l'impasse, l'imposteur l'emporte automatiquement."
            : "Tous les Civils ont été éliminés avant d'avoir démasqué l'imposteur.") + traitorSuffix('gagne avec eux.'),
      };
    case 'idiot':
      return {
        title: "L'Idiot du village a gagné !",
        subtitle: `${detail} a été éliminé(e) dès le tout premier vote et remporte la partie à lui/elle seul(e) !`,
      };
    case 'mrwhite':
      return {
        title: 'Mr. White a gagné !',
        subtitle: `${detail} a deviné le mot des Civils${civilWord ? ` (« ${civilWord} »)` : ''} et remporte la partie à lui/elle seul(e) !`,
      };
    case 'amoureux':
      return {
        title: 'Les Amoureux ont gagné !',
        subtitle:
          reason === 'deadlock4'
            ? "Il ne restait plus que 4 joueurs : la situation était dans l'impasse, les Amoureux l'emportent automatiquement."
            : 'Peu importe leurs camps respectifs, ils ont survécu ensemble à tous les autres joueurs !',
      };
  }
}
