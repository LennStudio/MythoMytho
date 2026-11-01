import type { Player, RoleKey, TiresiasHint, SpecialKey } from './types';

/* ------------------------------ Prédicats ------------------------------ */

/** Imposteur « de base » : Undercover, Mr. White ou Espion. */
export const isImpostor = (p: Player): boolean => p.baseRole !== 'civil';
/** Faux-Frère ou Judas : ont le mot des Civils mais gagnent avec les imposteurs. */
export const isTraitor = (p: Player): boolean => p.traitor !== null;
export const isImpostorTeam = (p: Player): boolean => isImpostor(p) || isTraitor(p);

export const isAlive = (p: Player): boolean => !p.eliminated;

/** Rôle principal tel que journalisé (traîtres prioritaires). */
export function baseRoleKey(p: Player): RoleKey {
  return p.traitor ?? p.baseRole;
}

export const ROLE_NAMES: Readonly<Record<RoleKey, string>> = {
  civil: 'Civil',
  undercover: 'Undercover',
  mrwhite: 'Mr. White',
  espion: 'Espion',
  fauxfrere: 'Faux-Frère',
  judas: 'Judas',
};

/** Libellés des rôles spéciaux (journal, récapitulatif). */
export function specialLabels(p: Player): string[] {
  const out: string[] = [];
  if (p.idiot) out.push('Idiot du village');
  if (p.fantome) out.push('Fantôme');
  if (p.mime) out.push('Mime');
  if (p.procureur) out.push('Procureur');
  if (p.mytho) out.push('Mytho');
  if (p.voyeur) out.push('Voyeur');
  if (p.janus) out.push('Janus');
  if (p.tiresias) out.push('Tirésias');
  if (p.orion) out.push('Orion');
  if (p.prometheus) out.push('Prométhée');
  if (p.hercule) out.push('Hercule');
  if (p.twin) out.push('Jumeaux');
  if (p.loverId !== null) out.push('Amoureux');
  return out;
}

/** Même liste, mais le jumeau est précisé (Castor / Pollux) pour le récapitulatif de fin. */
export function specialLabelsDetailed(p: Player): string[] {
  return specialLabels(p).map((l) => (l === 'Jumeaux' && p.twin ? `${p.twin.title} (Jumeaux)` : l));
}

/* --------------------------- Textes d'aide --------------------------- */

export interface RoleInfo {
  readonly label: string;
  readonly desc: string;
}

export type InfoKey = Exclude<SpecialKey, 'amoureux' | 'voyeur' | 'jumeaux'>;

export const ROLE_INFO: Readonly<Record<InfoKey, RoleInfo>> = {
  idiot: { label: 'Idiot du village', desc: 'Si tu es éliminé dès le tout premier vote, tu gagnes la partie à toi seul !' },
  fantome: { label: 'Fantôme', desc: 'Même éliminé, tu pourras continuer à voter aux prochains tours.' },
  mime: { label: 'Mime', desc: 'Décris ton mot uniquement par gestes, sans jamais parler.' },
  procureur: { label: 'Procureur', desc: "En cas d'égalité au vote, c'est toi qui trancheras qui est éliminé." },
  mytho: { label: 'Mensonge réussi ?', desc: "En fin de manche, le groupe dira s'il a repéré ton mensonge : le résultat alimente tes statistiques. Tu gagnes avec les Civils." },
  janus: { label: 'Les deux visages', desc: "L'un des deux mots est celui des Civils, l'autre celui de l'Undercover. Repère qui parle de l'un ou de l'autre, mais tes indices doivent coller aux deux mots. Tu gagnes avec les Civils." },
  hercule: { label: 'Mission secrète', desc: 'En fin de manche, le groupe dira si tu as accompli ta mission : le résultat alimente tes statistiques. Tu gagnes avec les Civils.' },
  prometheus: { label: 'Sacrifice', desc: "Éliminé, tu désignes un joueur encore en vie : l'appli révèle à tous s'il est Civil ou imposteur (le Faux-Frère et Judas comptent comme imposteurs). Tu gagnes avec les Civils." },
  judas: { label: 'Traître informé', desc: 'Les Civils ne gagnent que lorsque tous les imposteurs ET les traîtres sont éliminés. Tu comptes avec les imposteurs pour les conditions « plus de Civils » et d\'impasse.' },
  tiresias: { label: 'Sans mot', desc: "Tu n'as pas de mot à toi : fonds-toi parmi les Civils grâce à cet indice, sans te faire passer pour un imposteur. Tu gagnes avec les Civils." },
  orion: { label: 'Dernier tir', desc: 'Éliminé (par un vote ou autrement), tu désignes publiquement un joueur encore en vie, qui est éliminé avec toi. Tu gagnes avec les Civils.' },
  fauxfrere: { label: 'Traître', desc: "Les Civils ne gagnent que lorsque tous les imposteurs ET toi êtes éliminés. Tu comptes avec les imposteurs pour les conditions « plus de Civils » et d'impasse." },
};

/**
 * Indice de Tirésias : 2 premiers caractères « lettre/chiffre » (1 si le mot a
 * 3 lettres ou moins) conservés tels quels, et nombre de lettres/chiffres.
 */
export function makeTiresiasHint(word: string): TiresiasHint {
  const chars = Array.from(word);
  // Lettre (toute écriture à casse) ou chiffre — sans propriété Unicode `\p{…}`, dont le support Hermes n'est pas garanti.
  const isLetter = (c: string): boolean => c.toLowerCase() !== c.toUpperCase() || (c >= '0' && c <= '9');
  const count = chars.filter(isLetter).length;
  const wanted = count <= 3 ? 1 : 2;
  let prefix = '';
  let taken = 0;
  for (let i = 0; i < chars.length && taken < wanted; i++) {
    const c = chars[i] as string;
    prefix += c;
    if (isLetter(c)) taken += 1;
  }
  return { prefix, count };
}

/* ------------------------- Carte secrète d'un joueur ------------------------- */

export interface CardBadge {
  readonly label: string;
  readonly desc: string;
}

export interface CardView {
  readonly owner: string;
  /** Ligne « Tu es … » ; chaîne vide si masquée par l'option « Tu es [rôle] ». */
  readonly roleLine: string;
  /** Texte affiché dans l'encadré du mot (deux lignes pour Janus). */
  readonly wordText: string;
  readonly isJanus: boolean;
  readonly badges: readonly CardBadge[];
}

export interface CardContext {
  readonly players: readonly Player[];
  readonly showRole: boolean;
  readonly civilWordHint: string;
}

const NO_WORD = 'Aucun mot';

/** Reproduit à l'identique la logique d'affichage de l'ancienne modale « carte ». */
export function describeCard(p: Player, ctx: CardContext): CardView {
  const partner = p.twin ? ctx.players.find((x) => x.id === p.twin?.partnerId) : undefined;
  let roleLine: string;
  let wordText = p.word;

  if (p.baseRole === 'mrwhite') {
    roleLine = "Tu es Mr. White — improvise, tu n'as pas de mot !";
    wordText = NO_WORD;
  } else if (p.baseRole === 'espion') {
    roleLine = "Tu es l'Espion — tu n'as pas de mot, mais un indice t'attend ci-dessous";
    wordText = NO_WORD;
  } else if (p.traitor === 'fauxfrere') {
    roleLine = 'Tu es le Faux-Frère : tu as le mot des Civils, mais tu gagnes si les imposteurs gagnent.';
  } else if (p.traitor === 'judas') {
    roleLine = `Tu es Judas : tu as le mot des Civils, mais tu gagnes si les imposteurs gagnent. ${p.judasKnows} est un imposteur.`;
  } else if (p.mytho) {
    roleLine = 'Tu es le Mytho : place UN mensonge dans tes indices, sans te faire repérer.';
  } else if (p.voyeur) {
    const [a = '', b = '', c = ''] = p.voyeurNames;
    roleLine = `Tu es le Voyeur — ${a}, ${b} ou ${c} : l'un d'eux est un imposteur. À toi de convaincre les autres.`;
  } else if (p.janus) {
    roleLine = 'Tu es Janus — tu as reçu les deux mots, à toi de deviner lequel est le bon.';
    wordText = `Mot A : ${p.janusWords[0] ?? ''}\nMot B : ${p.janusWords[1] ?? ''}`;
  } else if (p.tiresias && p.tiresiasHint) {
    roleLine = `Tu es Tirésias — le mot des Civils commence par « ${p.tiresiasHint.prefix} » et compte ${p.tiresiasHint.count} lettres.`;
    wordText = NO_WORD;
  } else if (p.orion) {
    roleLine = 'Tu es Orion, le Chasseur : si tu es éliminé, tu emportes un joueur avec toi.';
  } else if (p.prometheus) {
    roleLine = 'Tu es Prométhée : si tu es éliminé, tu désignes un joueur et son camp est révélé à tous.';
  } else if (p.hercule) {
    roleLine = `Tu es Hercule — ta mission secrète : ${p.mission}`;
  } else if (p.twin && partner?.twin) {
    roleLine = `Tu es ${p.twin.title} — ton jumeau ${partner.twin.title} est ${partner.name}. Vous êtes tous deux Civils.`;
  } else if (p.baseRole === 'undercover') {
    roleLine = "Tu es l'Undercover — fonds-toi dans la masse";
  } else {
    roleLine = 'Tu es Civil — retrouve l\'imposteur';
  }

  const alwaysShowRole =
    p.baseRole === 'mrwhite' || p.baseRole === 'espion' || p.mytho || p.voyeur || p.janus ||
    p.traitor !== null || p.tiresias || p.orion || p.twin !== null || p.prometheus || p.hercule;
  const hideRole = !ctx.showRole && !alwaysShowRole;

  return {
    owner: `Carte de ${p.name}`,
    roleLine: hideRole ? '' : roleLine,
    wordText,
    isJanus: p.janus,
    badges: cardBadges(p, ctx),
  };
}

function cardBadges(p: Player, ctx: CardContext): CardBadge[] {
  const out: CardBadge[] = [];
  if (p.baseRole === 'mrwhite') {
    out.push({
      label: 'Dernière chance',
      desc: 'Si tu es éliminé, tu pourras tenter de deviner le mot des Civils : si tu le trouves, tu gagnes seul(e).',
    });
  }
  if (p.baseRole === 'espion') {
    out.push({ label: "Indice d'Espion", desc: `Le mot des Civils commence par la lettre « ${ctx.civilWordHint} ».` });
  }
  if (p.traitor === 'fauxfrere') out.push(ROLE_INFO.fauxfrere);
  if (p.traitor === 'judas') out.push(ROLE_INFO.judas);
  if (p.prometheus) out.push(ROLE_INFO.prometheus);
  if (p.hercule) out.push(ROLE_INFO.hercule);
  if (p.mytho) out.push(ROLE_INFO.mytho);
  if (p.tiresias) out.push(ROLE_INFO.tiresias);
  if (p.orion) out.push(ROLE_INFO.orion);
  if (p.janus) out.push(ROLE_INFO.janus);
  if (p.idiot) out.push(ROLE_INFO.idiot);
  if (p.fantome) out.push(ROLE_INFO.fantome);
  if (p.mime) out.push(ROLE_INFO.mime);
  if (p.procureur) out.push(ROLE_INFO.procureur);
  if (p.loverId !== null) {
    const lover = ctx.players.find((x) => x.id === p.loverId);
    if (lover) {
      out.push({
        label: `Amoureux de ${lover.name}`,
        desc: "Si l'un de vous deux est éliminé, l'autre l'est aussi. Peu importe vos camps respectifs, vous devez être les deux derniers survivants pour gagner ensemble.",
      });
    }
  }
  return out;
}
