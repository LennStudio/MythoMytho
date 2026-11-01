import { maxImpostors } from './balance';
import { MIN_UNDERCOVER } from './constants';
import { isImpostor, makeTiresiasHint } from './roles';
import { clamp, normalizeWord, pickOne, shuffle, type Rng } from './text';
import type {
  AssignWarning, BaseRole, DrawnPair, MissionPool, Player, SpecialRolesConfig,
} from './types';

/* ------------------------------ Missions ------------------------------ */

/**
 * Tire une mission. Si elle contient « {mot} », le mot imposé n'est jamais l'un
 * des deux mots de la manche (comparaison sans accents ni casse).
 */
export function pickMission(
  pool: MissionPool | null,
  forbiddenWords: readonly string[],
  rng: Rng = Math.random,
): string {
  if (!pool || pool.missions.length === 0) return '';
  let mission = pickOne(pool.missions, rng) ?? '';
  if (mission.includes('{mot}') && pool.words.length > 0) {
    const banned = forbiddenWords.map(normalizeWord);
    const allowed = pool.words.filter((w) => !banned.includes(normalizeWord(w)));
    const word = pickOne(allowed.length > 0 ? allowed : pool.words, rng) ?? '';
    mission = mission.replace(/\{mot\}/g, word);
  }
  return mission;
}

/* ----------------------------- Attribution ----------------------------- */

type Draft = { -readonly [K in keyof Player]: Player[K] };

export interface AssignInput {
  readonly names: readonly string[];
  readonly undercoverCount: number;
  readonly mrWhiteCount: number;
  readonly espionCount: number;
  readonly roles: SpecialRolesConfig;
  readonly pair: DrawnPair;
  readonly missions: MissionPool | null;
  readonly rng?: Rng;
}

export interface AssignResult {
  readonly players: readonly Player[];
  readonly civilWord: string;
  readonly undercoverWord: string;
  /** Première lettre (majuscule) du mot des Civils, pour l'Espion. */
  readonly civilWordHint: string;
  readonly warnings: readonly AssignWarning[];
}

function blankPlayer(id: number, name: string, baseRole: BaseRole, word: string): Draft {
  return {
    id, name, baseRole, traitor: null, word, viewed: false, eliminated: false,
    idiot: false, fantome: false, mime: false, procureur: false, mytho: false,
    janus: false, voyeur: false, tiresias: false, orion: false, orionDone: false,
    prometheus: false, prometheusDone: false, hercule: false,
    loverId: null, twin: null, mission: '', tiresiasHint: null,
    voyeurNames: [], janusWords: [], judasKnows: '',
  };
}

export function assignRound(input: AssignInput): AssignResult {
  const rng = input.rng ?? Math.random;
  const { pair, roles } = input;
  const n = input.names.length;

  const cap = maxImpostors(n);
  const undercover = clamp(input.undercoverCount, MIN_UNDERCOVER, cap);
  const mrWhite = clamp(input.mrWhiteCount, 0, Math.max(0, cap - undercover));
  const espion = clamp(input.espionCount, 0, Math.max(0, cap - undercover - mrWhite));

  const impostorIds = shuffle(input.names.map((_, i) => i), rng).slice(0, undercover + mrWhite + espion);
  const baseRoleById = new Map<number, BaseRole>();
  impostorIds.forEach((id, i) => {
    baseRoleById.set(id, i < undercover ? 'undercover' : i < undercover + mrWhite ? 'mrwhite' : 'espion');
  });

  const players: Draft[] = input.names.map((name, id) => {
    const role = baseRoleById.get(id) ?? 'civil';
    const word = role === 'mrwhite' || role === 'espion' ? '' : role === 'undercover' ? pair.undercoverWord : pair.civilWord;
    return blankPlayer(id, name, role, word);
  });

  const warnings: AssignWarning[] = [];
  const taken = new Set<number>();
  const free = (list: readonly Draft[]): Draft[] => list.filter((p) => !taken.has(p.id));
  const notImpostors = (): Draft[] => players.filter((p) => !isImpostor(p));
  const missing = (label: string): void => {
    warnings.push({ kind: 'insufficient-players', role: label });
  };
  /** Tire un joueur libre non imposteur et le marque comme pris. */
  const draw = (label: string): Draft | null => {
    const candidates = free(notImpostors());
    const chosen = pickOne(shuffle(candidates, rng), rng);
    if (!chosen) {
      missing(label);
      return null;
    }
    taken.add(chosen.id);
    return chosen;
  };
  const release = (p: Draft): void => {
    taken.delete(p.id);
  };

  // Idiot du village : jamais un imposteur.
  if (roles.idiot) {
    const p = draw('Idiot du village');
    if (p) p.idiot = true;
  }
  if (roles.fauxfrere) {
    const p = draw('Faux-Frère');
    if (p) p.traitor = 'fauxfrere';
  }
  if (roles.judas) {
    const p = draw('Judas');
    if (p) {
      p.traitor = 'judas';
      p.judasKnows = pickOne(shuffle(players.filter(isImpostor).map((x) => x.name), rng), rng) ?? '';
    }
  }
  if (roles.mytho) {
    const p = draw('Mytho');
    if (p) p.mytho = true;
  }
  if (roles.janus) {
    const p = draw('Janus');
    if (p) {
      p.janus = true;
      p.janusWords = shuffle([pair.civilWord, pair.undercoverWord], rng);
    }
  }
  if (roles.orion) {
    const p = draw('Orion');
    if (p) p.orion = true;
  }
  if (roles.prometheus) {
    const p = draw('Prométhée');
    if (p) p.prometheus = true;
  }
  if (roles.hercule) {
    const p = draw('Hercule');
    if (p) {
      p.hercule = true;
      p.mission = pickMission(input.missions, [pair.civilWord, pair.undercoverWord], rng);
      if (!p.mission) {
        p.hercule = false;
        release(p);
        warnings.push({ kind: 'missions-unavailable' });
      }
    }
  }
  if (roles.tiresias) {
    const p = draw('Tirésias');
    if (p) {
      p.tiresias = true;
      p.tiresiasHint = makeTiresiasHint(pair.civilWord);
    }
  }
  if (roles.jumeaux) {
    const twins = shuffle(free(notImpostors()), rng).slice(0, 2);
    const [a, b] = twins;
    if (!a || !b) {
      missing('Jumeaux');
    } else {
      a.twin = { partnerId: b.id, title: 'Castor' };
      b.twin = { partnerId: a.id, title: 'Pollux' };
      taken.add(a.id);
      taken.add(b.id);
    }
  }
  if (roles.voyeur) {
    const p = draw('Voyeur');
    if (p) {
      const impostorNames = players.filter(isImpostor).map((x) => x.name);
      const othersNames = players.filter((x) => x.id !== p.id && !isImpostor(x)).map((x) => x.name);
      const real = pickOne(shuffle(impostorNames, rng), rng);
      if (real !== undefined && othersNames.length >= 2) {
        p.voyeur = true;
        p.voyeurNames = shuffle([real, ...shuffle(othersNames, rng).slice(0, 2)], rng);
      } else {
        release(p);
        missing('Voyeur');
      }
    }
  }

  // Rôles sans contrainte de camp : n'importe quel joueur encore libre.
  if (roles.fantome) {
    const p = pickOne(shuffle(free(players), rng), rng);
    if (p) {
      p.fantome = true;
      taken.add(p.id);
    } else missing('Fantôme');
  }
  if (roles.mime) {
    const p = pickOne(shuffle(free(players), rng), rng);
    if (p) {
      p.mime = true;
      taken.add(p.id);
    } else missing('Mime');
  }
  if (roles.procureur) {
    const p = pickOne(shuffle(free(players), rng), rng);
    if (p) {
      p.procureur = true;
      taken.add(p.id);
    } else missing('Procureur');
  }
  if (roles.amoureux) {
    const [a, b] = shuffle(free(players), rng).slice(0, 2);
    if (a && b) {
      a.loverId = b.id;
      b.loverId = a.id;
      taken.add(a.id);
      taken.add(b.id);
    } else missing('Les Amoureux');
  }

  return {
    players,
    civilWord: pair.civilWord,
    undercoverWord: pair.undercoverWord,
    civilWordHint: pair.civilWord.charAt(0).toUpperCase(),
    warnings,
  };
}

/** Message utilisateur pour un avertissement d'attribution. */
export function describeWarning(w: AssignWarning): string {
  return w.kind === 'missions-unavailable'
    ? "Missions indisponibles : Hercule n'a pas été attribué cette manche."
    : `Pas assez de joueurs disponibles pour attribuer : ${w.role}.`;
}

/** Récupère un joueur d'une liste (utile aux appelants avec noUncheckedIndexedAccess). */
export function playerById(players: readonly Player[], id: number): Player | undefined {
  return players.find((p) => p.id === id);
}
