import React from 'react';
import { Pressable, View } from 'react-native';
import { gameOverText, type Player } from '@/domain';
import { alive, type GameAction, type GameState } from '@/state/gameReducer';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { AppText, Button, Panel } from '../ui/primitives';

type D = React.Dispatch<GameAction>;

export function PlayerTile({ player, onPress, dimmed, label }: {
  player: Player; onPress?: () => void; dimmed?: boolean; label?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress || dimmed} accessibilityRole="button" accessibilityLabel={label ?? player.name}
      accessibilityState={{ disabled: !onPress || !!dimmed }}
      style={({ pressed }) => ({
        flexBasis: '47%', flexGrow: 1, minHeight: 72, borderRadius: radius.sm, padding: 12, justifyContent: 'center',
        backgroundColor: dimmed ? 'transparent' : colors.paper, borderWidth: 1, borderColor: dimmed ? colors.line : colors.paperShade,
        opacity: dimmed ? 0.5 : pressed ? 0.85 : 1,
      })}>
      <AppText bold size={17} style={{ color: dimmed ? colors.muted : colors.ink }} numberOfLines={1}>{player.name}</AppText>
      {label ? <AppText size={12} style={{ color: dimmed ? colors.muted : colors.inkSoft }}>{label}</AppText> : null}
    </Pressable>
  );
}

export function RevealPhase({ state, dispatch }: { state: GameState; dispatch: D }): React.JSX.Element {
  const seen = state.players.filter((p) => p.viewed).length;
  const all = seen === state.players.length;
  return (
    <View style={{ gap: 12 }}>
      <AppText tone="muted">{`Chaque joueur découvre sa carte à tour de rôle. Cartes vues : ${seen}/${state.players.length}`}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {state.players.map((p) => (
          <PlayerTile key={p.id} player={p} dimmed={p.viewed} label={p.viewed ? 'Carte vue ✓' : 'Toucher pour voir'}
            onPress={() => dispatch({ type: 'OPEN_CARD', id: p.id })} />
        ))}
      </View>
      <Button label="Commencer le vote" disabled={!all} onPress={() => dispatch({ type: 'START_VOTE' })} />
    </View>
  );
}

export function VotePhase({ state, dispatch }: { state: GameState; dispatch: D }): React.JSX.Element {
  const out = state.players.filter((p) => p.eliminated);
  return (
    <View style={{ gap: 12 }}>
      <AppText tone="muted">{`Vote n°${state.voteCount + 1} — touchez le joueur désigné par le groupe.`}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {alive(state).map((p) => <PlayerTile key={p.id} player={p} onPress={() => dispatch({ type: 'ASK_ELIMINATE', id: p.id })} />)}
      </View>
      {out.length > 0 ? <AppText tone="muted" size={13}>{`Éliminés : ${out.map((p) => p.name).join(', ')}`}</AppText> : null}
    </View>
  );
}

export function GameOverPhase({ state, dispatch, onNextRound, onQuit, onScores }: {
  state: GameState; dispatch: D; onNextRound: () => void; onQuit: () => void; onScores: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  if (!state.winner) return <View />;
  const text = gameOverText(state.winner, state.winnerReason, state.winnerDetail, state.players, state.civilWord);
  const mytho = state.players.find((p) => p.mytho);
  const hercule = state.players.find((p) => p.hercule);
  return (
    <View style={{ gap: 12 }}>
      <Panel style={{ alignItems: 'center', gap: 8, borderColor: colors.gold }}>
        <AppText title size={32} center>{text.title.replace(/ ([!?:;])/g, '\u00A0$1')}</AppText>
        <AppText center tone="muted">{text.subtitle}</AppText>
        <AppText center tone="gold" bold>{`Civils : ${state.civilWord} · Undercover : ${state.undercoverWord}`}</AppText>
      </Panel>
      {mytho ? (
        <Panel style={{ gap: 8 }}>
          <AppText bold>{`Le groupe a-t-il repéré le mensonge de ${mytho.name} ?`}</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small variant={state.lie === 'spotted' ? 'primary' : 'ghost'} label="Repéré" onPress={() => dispatch({ type: 'ANSWER_LIE', value: 'spotted' })} />
            <Button small variant={state.lie === 'passed' ? 'primary' : 'ghost'} label="Passé inaperçu" onPress={() => dispatch({ type: 'ANSWER_LIE', value: 'passed' })} />
          </View>
        </Panel>
      ) : null}
      {hercule ? (
        <Panel style={{ gap: 8 }}>
          <AppText bold>{`${hercule.name} a-t-il/elle accompli sa mission ?`}</AppText>
          <AppText tone="muted" size={13}>{hercule.mission}</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button small variant={state.mission === 'success' ? 'primary' : 'ghost'} label="Accomplie" onPress={() => dispatch({ type: 'ANSWER_MISSION', value: 'success' })} />
            <Button small variant={state.mission === 'fail' ? 'primary' : 'ghost'} label="Ratée" onPress={() => dispatch({ type: 'ANSWER_MISSION', value: 'fail' })} />
          </View>
        </Panel>
      ) : null}
      <Button label="Nouvelle manche" onPress={onNextRound} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button small variant="ghost" label="Récapitulatif" onPress={() => dispatch({ type: 'OPEN_SUMMARY' })} />
        <Button small variant="ghost" label="Scores" onPress={onScores} />
        <Button small variant="ghost" label="Changer les réglages" onPress={onQuit} />
      </View>
    </View>
  );
}
