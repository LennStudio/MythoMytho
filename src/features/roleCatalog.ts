import type { SpecialKey } from '@/domain';

export interface RoleCatalogItem { readonly key: SpecialKey; readonly label: string; readonly desc: string }

/** Rôles spéciaux activables (libellés et ordre de l'écran de configuration d'origine). */
export const ROLE_CATALOG: readonly RoleCatalogItem[] = [
  { key: 'idiot', label: 'Idiot du village', desc: "Gagne seul s'il est éliminé dès le tout premier vote." },
  { key: 'fantome', label: 'Fantôme', desc: 'Peut continuer à voter même après avoir été éliminé.' },
  { key: 'mime', label: 'Mime', desc: 'Doit décrire son mot uniquement par gestes, sans parler.' },
  { key: 'procureur', label: 'Procureur', desc: 'Tranche lui-même en cas d\'égalité au vote.' },
  { key: 'amoureux', label: 'Les Amoureux', desc: "Liés à un autre joueur : si l'un est éliminé, l'autre l'est aussi. Ils gagnent à deux s'ils sont les derniers survivants." },
  { key: 'mytho', label: 'Le Mytho', desc: "Civil qui doit placer UN mensonge dans ses indices sans se faire repérer. En fin de manche, le groupe dit s'il l'a repéré : statistique « mensonges réussis » au journal." },
  { key: 'voyeur', label: 'Le Voyeur', desc: 'Civil qui reçoit 3 noms dont exactement un imposteur : il doit convaincre les autres. Conseillé à partir de 8 joueurs.' },
  { key: 'janus', label: 'Janus', desc: 'Civil qui reçoit les deux mots (Civils et Undercover) dans un ordre aléatoire, sans savoir lequel est le bon.' },
  { key: 'fauxfrere', label: 'Le Faux-Frère', desc: "A le mot des Civils mais gagne avec les imposteurs : les Civils ne gagnent que s'il est éliminé aussi. Compte comme un imposteur de plus. Conseillé à partir de 8 joueurs." },
  { key: 'jumeaux', label: 'Les Jumeaux (Castor et Pollux)', desc: "Deux Civils qui se connaissent : chacun voit le nom de l'autre sur sa carte. Information forte, conseillée à partir de 8 joueurs." },
  { key: 'tiresias', label: 'Tirésias', desc: 'Civil sans mot : il reçoit seulement les 2 premières lettres et le nombre de lettres du mot des Civils. Difficile à jouer, plutôt pour les groupes aguerris.' },
  { key: 'orion', label: 'Orion (le Chasseur)', desc: 'Civil qui, une fois éliminé, désigne un joueur encore en vie qui est éliminé avec lui.' },
  { key: 'hercule', label: 'Hercule', desc: "Civil qui tire une mission secrète (faire dire un mot, terminer un indice par une question…). En fin de manche, le groupe dit s'il l'a accomplie : statistique « missions réussies »." },
  { key: 'prometheus', label: 'Prométhée', desc: "Civil qui, une fois éliminé, désigne un joueur encore en vie : l'appli révèle à tous son camp (Civil ou imposteur). Information forte, conseillée à partir de 8 joueurs." },
  { key: 'judas', label: 'Judas', desc: "Un Faux-Frère informé : il a le mot des Civils, gagne avec les imposteurs et connaît le nom d'un imposteur. Compte comme un imposteur de plus. Conseillé à partir de 8 joueurs." },
];

export const MR_WHITE_DESC = "Ne reçoit aucun mot : il doit improviser pour ne pas se faire repérer. S'il est éliminé, il a toujours une dernière chance : saisir le mot des Civils pour gagner seul.";
export const ESPION_DESC = 'Ne reçoit aucun mot lui non plus, mais est autorisé à connaître la première lettre du mot des Civils — un indice discret pour se fondre dans la masse.';
export const RULES_TEXT = "Chaque joueur reçoit un mot en secret. Tous les civils reçoivent le même mot ; l'Undercover reçoit un mot différent, mais proche. À vous de démasquer l'imposteur avant qu'il ne devine votre mot.";
