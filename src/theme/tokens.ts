import type { ThemeMode } from '@/domain';

export interface Palette {
  readonly bg: string; readonly glow: string; readonly panel: string; readonly line: string;
  readonly paper: string; readonly paperShade: string; readonly ink: string; readonly inkSoft: string;
  readonly text: string; readonly muted: string; readonly red: string; readonly redDeep: string;
  readonly gold: string; readonly goldSoft: string; readonly ok: string; readonly overlay: string;
  readonly vignette: string; readonly grid: string; readonly tint: string; readonly shadow: string; readonly okText: string;
}

/** Palette « dossier » conservée de l'application d'origine (noir ardoise / papier / rouge tampon / or). */
export const palettes: Readonly<Record<ThemeMode, Palette>> = {
  dark: {
    bg: '#10161a', glow: '#1c262c', panel: '#1a2227', line: '#263038', paper: '#e9e0c6', paperShade: '#cfc3a0',
    ink: '#211d14', inkSoft: '#4a4335', text: '#efe9d8', muted: '#a9b0ad', red: '#a4372a', redDeep: '#7f291f',
    gold: '#b6924e', goldSoft: '#8a7440', ok: '#5c8a5a', overlay: 'rgba(5,8,10,0.78)',
    vignette: '#0a0d0f', grid: 'rgba(255,255,255,0.015)', tint: 'rgba(255,255,255,0.016)', shadow: 'rgba(0,0,0,0.55)', okText: '#bfe0bd',
  },
  light: {
    bg: '#f1ecdd', glow: '#ffffff', panel: '#fffdf8', line: '#ddd2b3', paper: '#e9e0c6', paperShade: '#cfc3a0',
    ink: '#211d14', inkSoft: '#4a4335', text: '#211d14', muted: '#5b5648', red: '#a4372a', redDeep: '#7f291f',
    gold: '#b6924e', goldSoft: '#a3823f', ok: '#4d7a4b', overlay: 'rgba(30,25,15,0.55)',
    vignette: '#e6ddc3', grid: 'rgba(33,29,20,0.035)', tint: 'rgba(255,255,255,0.016)', shadow: 'rgba(0,0,0,0.30)', okText: '#2f5a2d',
  },
};

export const fonts = { body: 'CourierPrime', bold: 'CourierPrime-Bold', italic: 'CourierPrime-Italic', title: 'Sirelia' } as const;
export const radius = { sm: 4, md: 8 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
