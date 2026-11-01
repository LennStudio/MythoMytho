import type { Difficulty } from './types';

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const MIN_UNDERCOVER = 1;
export const MAX_WORD_LENGTH = 40;
export const MAX_CUSTOM_PAIRS = 300;
export const MAX_GROUPS = 20;
export const MAX_GROUP_NAME = 24;
export const MAX_PLAYER_NAME = 20;
export const MAX_SCORE_LOG = 200;
export const TIMER_MIN_MINUTES = 1;
export const TIMER_MAX_MINUTES = 15;
export const AUTO_HIDE_CHOICES = [5, 8, 12, 20] as const;
export const CUSTOM_THEME_KEY = 'perso';

export const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  1: 'Facile',
  2: 'Moyenne',
  3: 'Difficile',
};

/**
 * Clés de persistance. Le préfixe `undercover_` est volontairement conservé :
 * sur le web, AsyncStorage s'appuie sur localStorage avec la même clé, donc les
 * réglages, groupes, paires et journaux déjà enregistrés par l'ancienne PWA
 * sont relus tels quels.
 */
export const STORAGE_KEYS = {
  theme: 'undercover_theme_v1',
  options: 'undercover_options_v1',
  groups: 'undercover_groups_v1',
  timer: 'undercover_timer_settings_v1',
  usedPairs: 'undercover_used_pairs_v1',
  customPairs: 'undercover_custom_pairs_v1',
  scoreLog: 'undercover_score_log_v1',
} as const;
