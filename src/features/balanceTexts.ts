import type { BalanceTier } from '@/domain';

/** Phrase de la jauge (titre) et libellé court (récapitulatif) pour chaque palier d'équilibre. */
export const BALANCE_TEXT: Readonly<Record<BalanceTier, { readonly headline: string; readonly short: string }>> = {
  civils2: { headline: 'Les Civils ont presque gagné', short: 'Très favorable aux Civils' },
  civils1: { headline: 'Ça sent la victoire du village', short: 'Favorable aux Civils' },
  even: { headline: 'Tout le monde peut gagner (en théorie)', short: 'Équilibrée' },
  impostors1: { headline: 'Ça sent le coup fourré', short: 'Favorable aux imposteurs' },
  impostors2: { headline: 'Les Undercover font la loi', short: 'Très favorable aux imposteurs' },
};

/** 1 imposteur contre 19 Civils ou plus. */
export const LONE_HERO_TEXT = 'Force, honneur et courage !';
