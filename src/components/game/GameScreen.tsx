import { useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { allViewed } from '@/state/gameReducer';
import { useGame } from '@/state/game';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { AppText, Button } from '../ui/primitives';
import { DiscussionTimer } from './DiscussionTimer';
import { AnnounceModal, ConfirmModal, GuessModal, PickModal, SecretCardModal, SummaryModal } from './GameModals';
import { GameOverPhase, RevealPhase, VotePhase } from './GamePanels';

const WAKE_TAG = 'mythomytho-game';

export function GameScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { settings } = useSettings();
  const { state, dispatch, nextRound, quit } = useGame();
  const [timerRunning, setTimerRunning] = useState(false);

  // Si on arrive ici sans manche (rechargement de page), retour à la configuration.
  useEffect(() => { if (!state.active) router.replace('/'); }, [state.active, router]);

  // Garde l'écran allumé pendant les cartes et le minuteur.
  useEffect(() => {
    if (state.phase === 'reveal' || timerRunning) void activateKeepAwakeAsync(WAKE_TAG);
    else void deactivateKeepAwake(WAKE_TAG);
    return () => { void deactivateKeepAwake(WAKE_TAG); };
  }, [state.phase, timerRunning]);

  const leave = (): void => { quit(); router.replace('/'); };
  const title = state.phase === 'reveal' ? 'Distribution des cartes' : state.phase === 'vote' ? 'Vote' : 'Fin de manche';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center', paddingBottom: 48 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <AppText tone="gold" size={13}>{`Manche ${state.round}`}</AppText>
            <AppText title size={28}>{title}</AppText>
          </View>
          <Button small variant="ghost" label="Récap" onPress={() => dispatch({ type: 'OPEN_SUMMARY' })} />
          <Button small variant="ghost" label="Quitter" onPress={leave} />
        </View>

        {settings.timerEnabled && state.phase !== 'gameover' ? (
          <DiscussionTimer minutes={settings.timerDurationMin} sound={settings.timerSound}
            active={state.phase === 'reveal' && allViewed(state)} resetKey={state.round} onRunningChange={setTimerRunning} />
        ) : null}

        {state.phase === 'reveal' ? <RevealPhase state={state} dispatch={dispatch} /> : null}
        {state.phase === 'vote' ? <VotePhase state={state} dispatch={dispatch} /> : null}
        {state.phase === 'gameover' ? (
          <GameOverPhase state={state} dispatch={dispatch} onNextRound={() => { nextRound(); }} onQuit={leave} onScores={() => router.push('/scores')} />
        ) : null}
      </ScrollView>

      <SecretCardModal state={state} dispatch={dispatch} />
      <ConfirmModal state={state} dispatch={dispatch} />
      <AnnounceModal state={state} dispatch={dispatch} />
      <PickModal state={state} dispatch={dispatch} />
      <GuessModal state={state} dispatch={dispatch} />
      <SummaryModal state={state} dispatch={dispatch} />
    </View>
  );
}
