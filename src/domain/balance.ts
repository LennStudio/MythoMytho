import { MIN_UNDERCOVER } from './constants';
import { clamp, normalizeWord, plural } from './text';
import type { GameSettings, SpecialRolesConfig } from './types';

/** Nombre maximal d'imposteurs (Undercover + Mr. White + Espion), au moins 1. */
export function maxImpostors(playerCount: number): number {
  return Math.max(MIN_UNDERCOVER, Math.ceil(playerCount / 2) - 1);
}

/** Imposteurs conseillés : environ 1 pour 4 joueurs. */
export function recommendedImpostors(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount + 1) / 4));
}

type CountsInput = Pick<GameSettings, 'playerCount' | 'mrWhiteCount' | 'espionCount'> & {
  readonly roles: Pick<SpecialRolesConfig, 'fauxfrere' | 'judas'>;
};

/** Nombre d'Undercovers conseillé une fois Mr. White, Espion et traîtres décomptés. */
export function recommendedUndercovers(s: CountsInput): number {
  const cap = maxImpostors(s.playerCount);
  const others = s.mrWhiteCount + s.espionCount + (s.roles.fauxfrere ? 1 : 0) + (s.roles.judas ? 1 : 0);
  return clamp(
    recommendedImpostors(s.playerCount) - others,
    MIN_UNDERCOVER,
    Math.max(MIN_UNDERCOVER, cap - others),
  );
}

/** Nombre de joueurs distincts mobilisés par les rôles spéciaux activés. */
export function specialSeatsNeeded(roles: SpecialRolesConfig): number {
  const one = (on: boolean): number => (on ? 1 : 0);
  const two = (on: boolean): number => (on ? 2 : 0);
  return (
    one(roles.idiot) + one(roles.fantome) + one(roles.mime) + one(roles.procureur) +
    two(roles.amoureux) + one(roles.mytho) + one(roles.voyeur) + one(roles.janus) +
    one(roles.fauxfrere) + two(roles.jumeaux) + one(roles.tiresias) + one(roles.orion) +
    one(roles.hercule) + one(roles.prometheus) + one(roles.judas)
  );
}

export type BalanceLevel = 'warn' | 'info';
export interface BalanceItem {
  readonly level: BalanceLevel;
  readonly text: string;
}

export function duplicateNames(names: readonly string[]): string[] {
  const seen = new Map<string, number>();
  const dups: string[] = [];
  for (const n of names) {
    if (!n) continue;
    const key = normalizeWord(n);
    if (!key) continue;
    if (seen.get(key) === 1) dups.push(n);
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  return dups;
}

function joinFrench(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1] as string}`;
}

export function checkBalance(s: GameSettings, names: readonly string[]): BalanceItem[] {
  const out: BalanceItem[] = [];
  const n = s.playerCount;
  const baseImpostors = s.undercoverCount + s.mrWhiteCount + s.espionCount;
  const totalImpostors = baseImpostors + (s.roles.fauxfrere ? 1 : 0) + (s.roles.judas ? 1 : 0);
  const recommended = recommendedImpostors(n);
  const seats = specialSeatsNeeded(s.roles);

  if (seats > n) {
    out.push({
      level: 'warn',
      text: `Les rôles spéciaux activés demandent ${seats} joueurs différents : avec ${n} joueurs, certains ne pourront pas être attribués.`,
    });
  } else if (seats > 0 && seats / n > 0.4) {
    out.push({
      level: 'warn',
      text: `Beaucoup de rôles spéciaux (${seats} joueurs concernés sur ${n}) : la partie risque de devenir confuse. Désactivez-en quelques-uns.`,
    });
  }

  if (totalImpostors > recommended + 1) {
    const withTraitors = s.roles.fauxfrere || s.roles.judas ? ', traîtres compris' : '';
    out.push({
      level: 'warn',
      text: `Beaucoup d'imposteurs (${totalImpostors} sur ${n}${withTraitors}) : les Civils auront du mal à gagner. Recommandé : ${recommended}.`,
    });
  } else if (totalImpostors < recommended) {
    out.push({
      level: 'info',
      text: `Peu d'imposteurs pour ${n} joueurs : la manche risque d'être longue. Recommandé : ${recommended}.`,
    });
  }

  if (s.roles.amoureux && n < 8) {
    out.push({
      level: 'warn',
      text: 'Les Amoureux sont conçus pour 8 joueurs ou plus : en dessous, la partie peut être déséquilibrée.',
    });
  }

  const bigTable: string[] = [];
  if (s.roles.voyeur) bigTable.push('le Voyeur');
  if (s.roles.jumeaux) bigTable.push('les Jumeaux');
  if (s.roles.fauxfrere) bigTable.push('le Faux-Frère');
  if (s.roles.judas) bigTable.push('Judas');
  if (s.roles.prometheus) bigTable.push('Prométhée');
  if (bigTable.length > 0 && n < 8) {
    const phrase = joinFrench(bigTable);
    const plurals = bigTable.length > 1 || bigTable[0] === 'les Jumeaux';
    out.push({
      level: 'warn',
      text: `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} ${plurals ? 'sont conçus' : 'est conçu'} pour 8 joueurs ou plus : en dessous, la partie peut être déséquilibrée.`,
    });
  }

  if (s.roles.tiresias) {
    out.push({
      level: 'info',
      text: "Tirésias n'a pas de mot : rôle difficile à jouer, plutôt pour des groupes aguerris.",
    });
  }
  if (s.roles.voyeur && n - baseImpostors - 1 < 2) {
    out.push({
      level: 'warn',
      text: "Le Voyeur a besoin d'au moins 2 joueurs non imposteurs en plus de lui : il ne pourra pas recevoir ses 3 noms.",
    });
  }
  if (n <= 4 && (s.mrWhiteCount > 0 || s.espionCount > 0 || s.roles.idiot)) {
    out.push({
      level: 'info',
      text: "À 4 joueurs ou moins, Mr. White, l'Espion et l'Idiot du village sont très exposés dès le premier vote.",
    });
  }

  const dups = duplicateNames(names);
  if (dups.length > 0) {
    out.push({
      level: 'warn',
      text: `Deux joueurs portent le même nom (${dups[0] as string}) : leurs statistiques seront confondues.`,
    });
  }
  return out;
}

export function balanceOk(n: number): string {
  return `Configuration équilibrée pour ${n} joueurs.`;
}

export function recommendationHint(n: number): string {
  const r = recommendedImpostors(n);
  return `Recommandé pour ${n} joueurs : ${r} ${plural(r, 'imposteur', 'imposteurs')} au total (Undercover, Mr. White et Espion compris).`;
}
