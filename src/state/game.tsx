import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  assignRound, buildScoreEntry, describeWarning, pickWordPair,
  type Player, type PlayerId,
} from '@/domain';
import { MISSION_POOL } from '@/data/library';
import { gameReducer, initialGameState, type GameAction, type GameState } from './gameReducer';
import { useLibrary } from './library';
import { useSettings } from './settings';
import { useToast } from './toast';

interface GameValue {
  readonly state: GameState;
  readonly dispatch: React.Dispatch<GameAction>;
  /** Lance la première manche avec ces noms (les vides deviennent « Joueur N »). */
  startGame(names: readonly string[]): boolean;
  nextRound(): boolean;
  quit(): void;
}
const Ctx = createContext<GameValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { settings } = useSettings();
  const lib = useLibrary();
  const toast = useToast();
  const names = useRef<readonly string[]>([]);
  const recorded = useRef(false);

  const launch = useCallback((round: number): boolean => {
    const selected = Object.keys(settings.selectedThemes).filter((k) => lib.themes.some((t) => t.key === k));
    const draw = pickWordPair({ themes: lib.themes, selectedKeys: selected, difficulty: settings.difficulty, used: lib.usedPairs });
    if (!draw) { toast('Aucune paire de mots disponible.'); return false; }
    lib.setUsedPairs(draw.used);
    draw.notices.forEach(toast);
    const assign = assignRound({
      names: names.current, undercoverCount: settings.undercoverCount, mrWhiteCount: settings.mrWhiteCount,
      espionCount: settings.espionCount, roles: settings.roles, pair: draw.pair, missions: MISSION_POOL,
    });
    const w = assign.warnings[0];
    if (w) toast(describeWarning(w));
    recorded.current = false;
    dispatch({ type: 'START', round, assign, pair: draw.pair });
    return true;
  }, [settings, lib, toast]);

  const startGame = useCallback((raw: readonly string[]): boolean => {
    names.current = raw.slice(0, settings.playerCount).map((n, i) => n.trim() || `Joueur ${i + 1}`);
    while (names.current.length < settings.playerCount) names.current = [...names.current, `Joueur ${names.current.length + 1}`];
    return launch(1);
  }, [settings.playerCount, launch]);

  const nextRound = useCallback(() => launch(state.round + 1), [launch, state.round]);
  const quit = useCallback(() => dispatch({ type: 'RESET' }), []);

  // Journalise la manche une seule fois, dès qu'elle est terminée.
  useEffect(() => {
    if (state.phase !== 'gameover' || !state.winner || recorded.current) return;
    recorded.current = true;
    lib.recordEntry(buildScoreEntry({
      players: state.players, winner: state.winner, winnerPlayerId: state.winnerPlayerId, round: state.round,
      theme: state.pairTheme, pairDifficulty: state.pairDifficulty, groups: lib.groups,
    }));
  }, [state, lib]);

  // Reporte les réponses de fin de manche dans l'entrée du journal.
  useEffect(() => {
    if (state.phase === 'gameover' && recorded.current && (state.lie || state.mission)) {
      lib.patchLatestEntry({ lie: state.lie, mission: state.mission });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lie, state.mission]);

  const value = useMemo(() => ({ state, dispatch, startGame, nextRound, quit }), [state, startGame, nextRound, quit]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame(): GameValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGame doit être utilisé sous <GameProvider>');
  return v;
}
export type { Player, PlayerId };
