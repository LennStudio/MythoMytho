import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadRaw, saveRaw } from '@/services/storage';
import { STORAGE_KEYS, type ThemeMode } from '@/domain';
import { palettes, type Palette } from './tokens';

interface ThemeValue { readonly mode: ThemeMode; readonly colors: Palette; readonly toggle: () => void }
const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [mode, setMode] = useState<ThemeMode>('dark');
  useEffect(() => {
    void loadRaw(STORAGE_KEYS.theme).then((v) => { if (v === 'dark' || v === 'light') setMode(v); });
  }, []);
  const toggle = useCallback(() => {
    setMode((m) => {
      const next: ThemeMode = m === 'dark' ? 'light' : 'dark';
      void saveRaw(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ mode, colors: palettes[mode], toggle }), [mode, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const v = useContext(ThemeContext);
  if (!v) throw new Error('useTheme doit être utilisé sous <ThemeProvider>');
  return v;
}
