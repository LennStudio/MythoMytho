import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  AUTO_HIDE_CHOICES, MAX_PLAYERS, MIN_PLAYERS, STORAGE_KEYS, SPECIAL_KEYS, TIMER_MAX_MINUTES, TIMER_MIN_MINUTES,
  clamp, maxImpostors, recommendedUndercovers,
  type Difficulty, type GameSettings, type PrivacyMode, type SpecialKey, type SpecialRolesConfig,
} from '@/domain';
import { loadJson, saveJson } from '@/services/storage';

const NO_ROLES = Object.fromEntries(SPECIAL_KEYS.map((k) => [k, false])) as unknown as SpecialRolesConfig;

export const defaultSettings: GameSettings = {
  playerCount: 6, undercoverCount: 1, mrWhiteCount: 0, espionCount: 0, autoUndercover: true,
  roles: NO_ROLES, selectedThemes: { classique: true }, difficulty: 0, difficultyLevel: 2,
  privacy: 'standard', autoHideSec: 8, showRole: true, timerEnabled: false, timerDurationMin: 3, timerSound: true,
};

const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const bool = (v: unknown, d: boolean): boolean => (typeof v === 'boolean' ? v : d);

/** Relecture tolérante des réglages (y compris ceux enregistrés par l'ancienne PWA). */
export function sanitizeSettings(raw: unknown, timerRaw?: unknown): GameSettings {
  const o = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const t = (typeof timerRaw === 'object' && timerRaw !== null ? timerRaw : {}) as Record<string, unknown>;
  const d = defaultSettings;
  const rolesRaw = (typeof o.roles === 'object' && o.roles !== null ? o.roles : {}) as Record<string, unknown>;
  const roles = Object.fromEntries(SPECIAL_KEYS.map((k) => [k, bool(rolesRaw[k], false)])) as unknown as SpecialRolesConfig;
  const themesRaw = (typeof o.selectedThemes === 'object' && o.selectedThemes !== null ? o.selectedThemes : {}) as Record<string, unknown>;
  const themes: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(themesRaw)) if (v === true) themes[k] = true;
  const privacy: PrivacyMode = o.privacy === 'auto' || o.privacy === 'hold' ? o.privacy : 'standard';
  const diff = num(o.difficulty, 0);
  const level = num(o.difficultyLevel, 2);
  const playerCount = clamp(Math.round(num(o.playerCount, d.playerCount)), MIN_PLAYERS, MAX_PLAYERS);
  return {
    playerCount,
    undercoverCount: clamp(Math.round(num(o.undercoverCount, 1)), 1, maxImpostors(playerCount)),
    mrWhiteCount: clamp(Math.round(num(o.mrWhiteCount, 0)), 0, 5),
    espionCount: clamp(Math.round(num(o.espionCount, 0)), 0, 5),
    autoUndercover: bool(o.autoUndercover, true),
    roles,
    selectedThemes: Object.keys(themes).length > 0 ? themes : d.selectedThemes,
    difficulty: diff === 1 || diff === 2 || diff === 3 ? diff : 0,
    difficultyLevel: (level === 1 || level === 3 ? level : 2) as Difficulty,
    privacy,
    autoHideSec: (AUTO_HIDE_CHOICES as readonly number[]).includes(num(o.autoHideSec, 8)) ? num(o.autoHideSec, 8) : 8,
    showRole: bool(o.showRole, true),
    timerEnabled: bool(t.enabled ?? o.timerEnabled, false),
    timerDurationMin: clamp(Math.round(num(t.durationMin ?? t.duration ?? o.timerDurationMin, 3)), TIMER_MIN_MINUTES, TIMER_MAX_MINUTES),
    timerSound: bool(t.sound ?? o.timerSound, true),
  };
}

export type SettingsAction =
  | { type: 'HYDRATE'; value: GameSettings }
  | { type: 'SET_PLAYERS'; value: number }
  | { type: 'SET_COUNT'; key: 'undercoverCount' | 'mrWhiteCount' | 'espionCount'; value: number }
  | { type: 'SET_AUTO_UNDERCOVER'; value: boolean }
  | { type: 'TOGGLE_ROLE'; key: SpecialKey }
  | { type: 'TOGGLE_THEME'; key: string }
  | { type: 'SET_DIFFICULTY'; value: 0 | Difficulty }
  | { type: 'PATCH'; value: Partial<GameSettings> };

/** Recalcule l'Undercover conseillé si le mode automatique est actif, puis borne les compteurs. */
function normalize(s: GameSettings): GameSettings {
  const cap = maxImpostors(s.playerCount);
  const undercoverCount = s.autoUndercover ? recommendedUndercovers(s) : clamp(s.undercoverCount, 1, cap);
  const mrWhiteCount = clamp(s.mrWhiteCount, 0, Math.max(0, cap - undercoverCount));
  const espionCount = clamp(s.espionCount, 0, Math.max(0, cap - undercoverCount - mrWhiteCount));
  return { ...s, undercoverCount, mrWhiteCount, espionCount };
}

export function settingsReducer(s: GameSettings, a: SettingsAction): GameSettings {
  switch (a.type) {
    case 'HYDRATE': return normalize(a.value);
    case 'SET_PLAYERS': return normalize({ ...s, playerCount: clamp(a.value, MIN_PLAYERS, MAX_PLAYERS) });
    case 'SET_COUNT': return normalize({ ...s, [a.key]: Math.max(0, a.value), autoUndercover: a.key === 'undercoverCount' ? false : s.autoUndercover });
    case 'SET_AUTO_UNDERCOVER': return normalize({ ...s, autoUndercover: a.value });
    case 'TOGGLE_ROLE': return normalize({ ...s, roles: { ...s.roles, [a.key]: !s.roles[a.key] } });
    case 'TOGGLE_THEME': {
      const next = { ...s.selectedThemes };
      if (next[a.key]) delete next[a.key]; else next[a.key] = true;
      return Object.keys(next).length === 0 ? s : { ...s, selectedThemes: next }; // au moins un thème
    }
    case 'SET_DIFFICULTY':
      return { ...s, difficulty: a.value, difficultyLevel: a.value === 0 ? s.difficultyLevel : a.value };
    case 'PATCH': return normalize({ ...s, ...a.value });
  }
}

interface SettingsValue { readonly settings: GameSettings; readonly dispatch: React.Dispatch<SettingsAction>; readonly ready: boolean }
const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const ready = useRef(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    void (async () => {
      const raw = await loadJson<unknown>(STORAGE_KEYS.options, (r) => r, null);
      const timer = await loadJson<unknown>(STORAGE_KEYS.timer, (r) => r, null);
      dispatch({ type: 'HYDRATE', value: sanitizeSettings(raw, timer) });
      ready.current = true;
      setTick((n) => n + 1);
    })();
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    void saveJson(STORAGE_KEYS.options, settings);
    void saveJson(STORAGE_KEYS.timer, { enabled: settings.timerEnabled, durationMin: settings.timerDurationMin, sound: settings.timerSound });
  }, [settings]);

  const value = useMemo(() => ({ settings, dispatch, ready: ready.current }), [settings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const v = useContext(SettingsContext);
  if (!v) throw new Error('useSettings doit être utilisé sous <SettingsProvider>');
  return v;
}

/** Raccourci : actions courantes sans manipuler le dispatch. */
export function useSettingsActions(): {
  setPlayers(n: number): void; setCount(k: 'undercoverCount' | 'mrWhiteCount' | 'espionCount', n: number): void;
  toggleRole(k: SpecialKey): void; toggleTheme(k: string): void; patch(p: Partial<GameSettings>): void;
  setAutoUndercover(b: boolean): void; setDifficulty(d: 0 | Difficulty): void;
} {
  const { dispatch } = useSettings();
  return useMemo(() => ({
    setPlayers: (value) => dispatch({ type: 'SET_PLAYERS', value }),
    setCount: (key, value) => dispatch({ type: 'SET_COUNT', key, value }),
    toggleRole: (key) => dispatch({ type: 'TOGGLE_ROLE', key }),
    toggleTheme: (key) => dispatch({ type: 'TOGGLE_THEME', key }),
    patch: (value) => dispatch({ type: 'PATCH', value }),
    setAutoUndercover: (value) => dispatch({ type: 'SET_AUTO_UNDERCOVER', value }),
    setDifficulty: (value) => dispatch({ type: 'SET_DIFFICULTY', value }),
  }), [dispatch]);
}
