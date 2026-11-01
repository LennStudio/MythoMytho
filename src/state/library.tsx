import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  CUSTOM_THEME_KEY, MAX_GROUPS, STORAGE_KEYS, prependEntry, sanitizeCustomPairs, sanitizeGroups, sanitizeScoreLog,
  type GroupDef, type ScoreEntry, type WordPair, type WordTheme, type LieOutcome, type MissionOutcome, type UsedPairs,
} from '@/domain';
import { BUILTIN_THEMES } from '@/data/library';
import { loadJson, saveJson } from '@/services/storage';

interface LibraryValue {
  readonly loaded: boolean;
  readonly customPairs: readonly WordPair[];
  readonly groups: readonly GroupDef[];
  readonly usedPairs: UsedPairs;
  readonly scoreLog: readonly ScoreEntry[];
  /** Thèmes intégrés + thème « perso » s'il contient des paires. */
  readonly themes: readonly WordTheme[];
  setCustomPairs(p: readonly WordPair[]): void;
  saveGroup(name: string, players: readonly string[]): void;
  deleteGroup(id: string): void;
  setUsedPairs(u: UsedPairs): void;
  recordEntry(e: ScoreEntry): void;
  patchLatestEntry(p: { lie?: LieOutcome; mission?: MissionOutcome }): void;
  clearScoreLog(): void;
}
const Ctx = createContext<LibraryValue | null>(null);

const parseUsed = (r: unknown): UsedPairs => {
  if (Array.isArray(r)) return Object.fromEntries(r.filter((x): x is string => typeof x === 'string').map((k) => [k, true as const]));
  if (typeof r !== 'object' || r === null) return {};
  return Object.fromEntries(Object.keys(r).map((k) => [k, true as const]));
};

export function LibraryProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [loaded, setLoaded] = useState(false);
  const [customPairs, setCustom] = useState<readonly WordPair[]>([]);
  const [groups, setGroups] = useState<readonly GroupDef[]>([]);
  const [usedPairs, setUsed] = useState<UsedPairs>({});
  const [scoreLog, setLog] = useState<readonly ScoreEntry[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    void (async () => {
      const [c, g, u, l] = await Promise.all([
        loadJson(STORAGE_KEYS.customPairs, sanitizeCustomPairs, []),
        loadJson(STORAGE_KEYS.groups, sanitizeGroups, []),
        loadJson(STORAGE_KEYS.usedPairs, parseUsed, {}),
        loadJson(STORAGE_KEYS.scoreLog, sanitizeScoreLog, []),
      ]);
      setCustom(c); setGroups(g); setUsed(u); setLog(l);
      hydrated.current = true; setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (hydrated.current) void saveJson(STORAGE_KEYS.customPairs, customPairs); }, [customPairs]);
  useEffect(() => { if (hydrated.current) void saveJson(STORAGE_KEYS.groups, groups); }, [groups]);
  useEffect(() => { if (hydrated.current) void saveJson(STORAGE_KEYS.usedPairs, usedPairs); }, [usedPairs]);
  useEffect(() => { if (hydrated.current) void saveJson(STORAGE_KEYS.scoreLog, scoreLog); }, [scoreLog]);

  const themes = useMemo<readonly WordTheme[]>(
    () => (customPairs.length > 0
      ? [...BUILTIN_THEMES, { key: CUSTOM_THEME_KEY, label: 'Mes paires', desc: 'Vos paires personnalisées', pairs: customPairs, custom: true }]
      : BUILTIN_THEMES),
    [customPairs],
  );

  const saveGroup = useCallback((name: string, players: readonly string[]) => {
    const [clean] = sanitizeGroups([{ id: `g${Date.now()}`, name, players }]);
    if (!clean) return;
    setGroups((cur) => [...cur.filter((g) => g.name.toLowerCase() !== clean.name.toLowerCase()), clean].slice(-MAX_GROUPS));
  }, []);

  const value: LibraryValue = {
    loaded, customPairs, groups, usedPairs, scoreLog, themes,
    setCustomPairs: setCustom, saveGroup,
    deleteGroup: (id) => setGroups((cur) => cur.filter((g) => g.id !== id)),
    setUsedPairs: setUsed,
    recordEntry: (e) => setLog((cur) => prependEntry(cur, e)),
    patchLatestEntry: (p) => setLog((cur) => {
      const [first, ...rest] = cur;
      if (!first) return cur;
      const players = first.players.map((pl) => ({
        ...pl,
        ...(p.lie !== undefined && pl.lie !== undefined ? { lie: p.lie } : {}),
        ...(p.mission !== undefined && pl.mission !== undefined ? { mission: p.mission } : {}),
      }));
      return [{ ...first, players }, ...rest];
    }),
    clearScoreLog: () => setLog([]),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLibrary(): LibraryValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLibrary doit être utilisé sous <LibraryProvider>');
  return v;
}
