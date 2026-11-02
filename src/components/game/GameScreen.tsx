import { useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { allViewed } from '@/state/gameReducer';
import { useGame } from '@/state/game';
import { useSettings } from '@/state/settings';
import { Page, Screen } from '../ui/Screen';
import { DiscussionTimer } from './DiscussionTimer';
import { AnnounceModal, ConfirmModal, GuessModal, PickModal, SecretCardModal, SummaryModal } from './GameModals';
import { GameHeader, GameOverPhase, RevealPhase, VotePhase, type BottomActions } from './GamePanels';

const WAKE_TAG = 'mythomytho-game';

export function GameScreen(): React.JSX.Element {
  const router = useRouter();
  const { settings } = useSettings();
  const { state, dispatch, nextRound, quit } = useGame();
  const [timerRunning, setTimerRunning] = useState(false);
  const [armed, setArmed] = useState<'round' | 'game' | null>(null);

  // Si on arrive ici sans manche (rechargement de page), retour à la configuration.
  useEffect(() => { if (!state.active) router.replace('/'); }, [state.active, router]);
  // Confirmation en deux temps : un seul toucher accidentel ne doit pas perdre la manche.
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(null), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  // Garde l'écran allumé pendant les cartes et le minuteur.
  useEffect(() => {
    if (state.phase === 'reveal' || timerRunning) void activateKeepAwakeAsync(WAKE_TAG);
    else void deactivateKeepAwake(WAKE_TAG);
    return () => { void deactivateKeepAwake(WAKE_TAG); };
  }, [state.phase, timerRunning]);

  const gameOver = state.phase === 'gameover';
  const newGame = (): void => {
    if (gameOver || armed === 'game') { setArmed(null); quit(); router.replace('/'); } else setArmed('game');
  };
  const newRound = (): void => {
    if (gameOver || armed === 'round') { setArmed(null); nextRound(); } else setArmed('round');
  };
  const actions: BottomActions = { onScores: () => router.push('/scores'), onNewRound: newRound, onNewGame: newGame, armed };

  return (
    <Screen>
      <Page>
        <GameHeader state={state} />
        {state.phase === 'reveal' && settings.timerEnabled ? (
          <View>
            <DiscussionTimer minutes={settings.timerDurationMin} sound={settings.timerSound}
              active={allViewed(state)} resetKey={state.round} onRunningChange={setTimerRunning} />
          </View>
        ) : null}
        {state.phase === 'reveal' ? <RevealPhase state={state} dispatch={dispatch} actions={actions} /> : null}
        {state.phase === 'vote' ? <VotePhase state={state} dispatch={dispatch} actions={actions} /> : null}
        {gameOver ? <GameOverPhase state={state} dispatch={dispatch} actions={actions} onNextRound={() => { nextRound(); }} /> : null}
      </Page>

      <SecretCardModal state={state} dispatch={dispatch} />
      <ConfirmModal state={state} dispatch={dispatch} />
      <AnnounceModal state={state} dispatch={dispatch} />
      <PickModal state={state} dispatch={dispatch} />
      <GuessModal state={state} dispatch={dispatch} />
      <SummaryModal state={state} dispatch={dispatch} onNextRound={() => { nextRound(); }} />
    </Screen>
  );
}
