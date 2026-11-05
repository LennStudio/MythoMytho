import type { BaseRole, SpecialKey } from '@/domain';

/** Tous les rôles qui ont une icône : Civils/Undercover/Mr. White/Espion + les 15 rôles spéciaux. */
export type IconKey = BaseRole | SpecialKey;
/** Camp d'un rôle : détermine la teinte du jeton (vert Civils, rouge imposteurs, or neutre). */
export type Tone = 'civil' | 'impostor' | 'neutral';

export const SHORT_LABEL: Readonly<Record<IconKey, string>> = {
  civil: 'Civils', undercover: 'Undercover', mrwhite: 'Mr. White', espion: 'Espion',
  idiot: 'Idiot', fantome: 'Fantôme', mime: 'Mime', procureur: 'Procureur', amoureux: 'Amoureux',
  mytho: 'Mytho', voyeur: 'Voyeur', janus: 'Janus', fauxfrere: 'Faux-Frère', jumeaux: 'Jumeaux',
  tiresias: 'Tirésias', orion: 'Orion', hercule: 'Hercule', prometheus: 'Prométhée', judas: 'Judas',
};

export const TONE: Readonly<Record<IconKey, Tone>> = {
  civil: 'civil', undercover: 'impostor', mrwhite: 'neutral', espion: 'impostor',
  idiot: 'neutral', fantome: 'neutral', mime: 'neutral', procureur: 'neutral', amoureux: 'neutral',
  mytho: 'civil', voyeur: 'civil', janus: 'civil', fauxfrere: 'impostor', jumeaux: 'civil',
  tiresias: 'civil', orion: 'civil', hercule: 'civil', prometheus: 'civil', judas: 'impostor',
};

export const CIVIL_DESC = 'Tous les Civils reçoivent le même mot et cherchent à démasquer l\'imposteur. Leur nombre se déduit des autres rôles.';
export const UNDERCOVER_DESC = "Reçoit un mot différent, mais proche, de celui des Civils : il doit se fondre dans la masse sans se trahir.";
