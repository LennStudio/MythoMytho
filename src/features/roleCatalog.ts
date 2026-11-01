import type { SpecialKey } from '@/domain';

export interface RoleCatalogItem { readonly key: SpecialKey; readonly label: string; readonly desc: string; readonly group: 'classic' | 'mythology' }

/** Rôles spéciaux activables à l'écran de configuration. */
export const ROLE_CATALOG: readonly RoleCatalogItem[] = [
  { key: 'idiot', label: 'Idiot du village', desc: 'Gagne seul s\'il est éliminé au premier vote.', group: 'classic' },
  { key: 'fantome', label: 'Fantôme', desc: 'Continue de voter après son élimination.', group: 'classic' },
  { key: 'mime', label: 'Mime', desc: 'Décrit son mot par gestes uniquement.', group: 'classic' },
  { key: 'procureur', label: 'Procureur', desc: 'Tranche les égalités au vote.', group: 'classic' },
  { key: 'amoureux', label: 'Amoureux', desc: 'Deux joueurs liés : l\'un tombe, l\'autre aussi.', group: 'classic' },
  { key: 'mytho', label: 'Mytho', desc: 'Glisse un mensonge dans ses indices.', group: 'classic' },
  { key: 'voyeur', label: 'Voyeur', desc: 'Reçoit 3 noms dont un vrai imposteur.', group: 'classic' },
  { key: 'fauxfrere', label: 'Faux-Frère', desc: 'Mot des Civils, mais gagne avec les imposteurs.', group: 'classic' },
  { key: 'judas', label: 'Judas', desc: 'Traître qui connaît l\'identité d\'un imposteur.', group: 'classic' },
  { key: 'janus', label: 'Janus', desc: 'Reçoit les deux mots et doit deviner le bon.', group: 'mythology' },
  { key: 'jumeaux', label: 'Jumeaux', desc: 'Castor et Pollux se connaissent, tous deux Civils.', group: 'mythology' },
  { key: 'tiresias', label: 'Tirésias', desc: 'Sans mot : seulement un indice sur celui des Civils.', group: 'mythology' },
  { key: 'orion', label: 'Orion', desc: 'Éliminé, il emporte un joueur avec lui.', group: 'mythology' },
  { key: 'hercule', label: 'Hercule', desc: 'Doit accomplir une mission secrète.', group: 'mythology' },
  { key: 'prometheus', label: 'Prométhée', desc: 'Éliminé, il révèle le camp d\'un joueur.', group: 'mythology' },
];
