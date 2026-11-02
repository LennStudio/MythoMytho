import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { gameOverText, type Player, type Winner } from '@/domain';
import { alive, type GameAction, type GameState } from '@/state/gameReducer';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import { AppText, Button, Callout, Panel } from '../ui/primitives';

type D = React.Dispatch<GameAction>;

export interface BottomActions {
  readonly onScores: () => void;
  readonly onNewRound: () => void;
  readonly onNewGame: () => void;
  /** Bouton « armé » : demande une seconde pression pour confirmer. */
  readonly armed: 'round' | 'game' | null;
}

/** Inclinaison fixe et douce par carte (comme la rotation aléatoire de l'original, mais stable). */
const tilt = (i: number): number => (((i * 37) % 7) - 3) * 0.85;

function TargetIcon({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none" style={{ opacity: 0.75 }}>
      <Circle cx={15} cy={15} r={12.5} stroke={color} strokeWidth={1.6} />
      <Circle cx={15} cy={15} r={7.5} stroke={color} strokeWidth={1.6} />
      <Circle cx={15} cy={15} r={2.4} fill={color} />
    </Svg>
  );
}

/** Carte papier inclinée (#n, cible, nom). */
export function PlayerCard({ player, index, onPress, faded, struck, caption }: {
  player: Player; index: number; onPress?: () => void; faded?: boolean; struck?: boolean; caption?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress || faded} accessibilityRole="button"
      accessibilityLabel={caption ? `${player.name} — ${caption}` : player.name} accessibilityState={{ disabled: !onPress || !!faded }}
      style={({ pressed }) => ({
        width: 100, aspectRatio: 3 / 4, minHeight: 64, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.paperShade,
        borderRadius: radius.sm, paddingTop: 10, paddingHorizontal: 6, paddingBottom: 8, alignItems: 'center', justifyContent: 'space-between',
        boxShadow: pressed ? '0 16px 26px -12px rgba(0,0,0,0.6)' : `0 10px 24px -12px ${colors.shadow}`,
        opacity: faded ? 0.45 : 1,
        transform: [{ rotate: pressed ? '0deg' : `${tilt(index)}deg` }, { translateY: pressed ? -4 : 0 }],
      })}>
      <Text style={{ alignSelf: 'flex-start', color: colors.inkSoft, fontFamily: fonts.body, fontSize: 10.5, letterSpacing: 0.9 }}>{`#${index + 1}`}</Text>
      <TargetIcon color={colors.ink} />
      <Text numberOfLines={1} style={{ color: colors.ink, fontFamily: fonts.body, fontSize: 10.9, textAlign: 'center', maxWidth: '100%', textDecorationLine: struck ? 'line-through' : 'none' }}>{player.name}</Text>
    </Pressable>
  );
}

const CardsRow = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>{children}</View>
);

export function GameHeader({ state }: { state: GameState }): React.JSX.Element {
  const { colors } = useTheme();
  const seen = state.players.filter((p) => p.viewed).length;
  const n = state.players.length;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
      <View>
        <AppText title size={25.6}>{`Manche ${state.round}`}</AppText>
        <AppText tone="gold" size={10.9} style={{ letterSpacing: 1.1, marginTop: 4 }}>{`${n} agents en jeu`}</AppText>
      </View>
      {state.phase === 'reveal' ? (
        <View style={{ minWidth: 180 }}>
          <AppText tone="muted" size={10.5} style={{ textAlign: 'right', marginBottom: 6 }}>{`${seen}/${n} cartes consultées`}</AppText>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>
            <View style={{ width: `${n ? (seen / n) * 100 : 0}%`, height: 6, backgroundColor: colors.gold }} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function BottomRow({ actions, extra }: { actions: BottomActions; extra?: React.ReactNode }): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {extra}
      <Button variant="ghost" label="Journal des scores" onPress={actions.onScores} />
      <Button variant="ghost" label={actions.armed === 'round' ? 'Confirmer ?' : 'Nouvelle manche (mêmes joueurs)'} onPress={actions.onNewRound} />
      <Button variant="ghost" label={actions.armed === 'game' ? 'Confirmer ?' : 'Nouvelle partie'} onPress={actions.onNewGame} />
    </View>
  );
}

export function RevealPhase({ state, dispatch, actions }: { state: GameState; dispatch: D; actions: BottomActions }): React.JSX.Element {
  const all = state.players.length > 0 && state.players.every((p) => p.viewed);
  return (
    <View>
      <Callout>
        <AppText tone="muted" size={12.5} style={{ lineHeight: 20 }}>
          {'Faites circuler l\'appareil. Chaque joueur clique sur '}<AppText bold tone="muted" size={12.5}>sa propre carte</AppText>
          {', mémorise son mot en privé, puis appuie sur « Cacher » avant de transmettre l\'appareil au suivant. Une carte déjà consultée ne peut pas être rouverte.'}
        </AppText>
      </Callout>
      <View style={{ height: 22 }} />
      {all ? (
        <View style={{ marginBottom: 18 }}>
          <Callout tone="green"><AppText size={12} style={{ color: '#bfe0bd', lineHeight: 18 }}>Toutes les cartes ont été consultées. La discussion peut commencer, puis lancez le vote.</AppText></Callout>
        </View>
      ) : null}
      {/* Le minuteur s'insère ici (voir GameScreen). */}
      <CardsRow>
        {state.players.map((p, i) => (
          <PlayerCard key={p.id} player={p} index={i} faded={p.viewed} caption={p.viewed ? 'carte vue' : 'toucher pour voir'} onPress={() => dispatch({ type: 'OPEN_CARD', id: p.id })} />
        ))}
      </CardsRow>
      <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(128,128,128,0.35)', paddingTop: 20, gap: 12 }}>
        <Button arrow label="Lancer le vote" disabled={!all} onPress={() => dispatch({ type: 'START_VOTE' })} />
        <BottomRow actions={actions} />
      </View>
    </View>
  );
}

export function VotePhase({ state, dispatch, actions }: { state: GameState; dispatch: D; actions: BottomActions }): React.JSX.Element {
  const { colors } = useTheme();
  const out = state.players.filter((p) => p.eliminated);
  return (
    <View>
      <AppText title size={19.2} style={{ marginBottom: 6 }}>Vote d'elimination</AppText>
      <Callout accent="red">
        <AppText tone="muted" size={12.5} style={{ lineHeight: 20 }}>Le groupe discute, puis désigne d'un commun accord le joueur à éliminer en appuyant sur sa carte.</AppText>
      </Callout>
      <View style={{ height: 18 }} />
      {out.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {out.map((p) => (
            <View key={p.id} style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, paddingVertical: 5, paddingHorizontal: 12 }}>
              <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 10.9, textDecorationLine: 'line-through', textDecorationColor: colors.red }}>{p.name}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <CardsRow>
        {state.players.map((p, i) => alive(state).some((a) => a.id === p.id)
          ? <PlayerCard key={p.id} player={p} index={i} caption="désigner" onPress={() => dispatch({ type: 'ASK_ELIMINATE', id: p.id })} />
          : null)}
      </CardsRow>
      <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(128,128,128,0.35)', paddingTop: 20 }}>
        <BottomRow actions={actions} extra={<Button variant="ghost" label="Voir tous les rôles" onPress={() => dispatch({ type: 'OPEN_SUMMARY' })} />} />
      </View>
    </View>
  );
}

const BANNER: Readonly<Record<Winner, { border: string; bg: string }>> = {
  civils: { border: 'rgba(92,138,90,0.5)', bg: 'rgba(92,138,90,0.10)' },
  undercover: { border: 'rgba(164,55,42,0.5)', bg: 'rgba(164,55,42,0.12)' },
  idiot: { border: 'rgba(182,146,78,0.5)', bg: 'rgba(182,146,78,0.10)' },
  amoureux: { border: 'rgba(182,146,78,0.5)', bg: 'rgba(182,146,78,0.10)' },
  mrwhite: { border: 'rgba(182,146,78,0.5)', bg: 'rgba(182,146,78,0.10)' },
};

export function GameOverPhase({ state, dispatch, actions, onNextRound }: {
  state: GameState; dispatch: D; actions: BottomActions; onNextRound: () => void;
}): React.JSX.Element {
  if (!state.winner) return <View />;
  const text = gameOverText(state.winner, state.winnerReason, state.winnerDetail, state.players, state.civilWord);
  const mytho = state.players.find((p) => p.mytho);
  const hercule = state.players.find((p) => p.hercule);
  const b = BANNER[state.winner];
  return (
    <View style={{ gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 20, borderRadius: radius.md, borderWidth: 1, borderColor: b.border, backgroundColor: b.bg }}>
        <AppText title size={32} center>{text.title.replace(/ ([!?:;])/g, '\u00A0$1')}</AppText>
        <AppText center tone="muted" size={13.5}>{text.subtitle}</AppText>
        <AppText center tone="gold" bold size={13}>{`Civils : ${state.civilWord} · Undercover : ${state.undercoverWord}`}</AppText>
      </View>
      {mytho ? (
        <Panel style={{ gap: 10 }}>
          <AppText bold size={14}>{`Le groupe a-t-il repéré le mensonge de ${mytho.name} ?`}</AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button small variant={state.lie === 'spotted' ? 'primary' : 'ghost'} label="Oui, repéré" onPress={() => dispatch({ type: 'ANSWER_LIE', value: 'spotted' })} />
            <Button small variant={state.lie === 'passed' ? 'primary' : 'ghost'} label="Non, il est passé" onPress={() => dispatch({ type: 'ANSWER_LIE', value: 'passed' })} />
          </View>
        </Panel>
      ) : null}
      {hercule ? (
        <Panel style={{ gap: 10 }}>
          <AppText bold size={14}>{`${hercule.name} a-t-il/elle accompli sa mission ?`}</AppText>
          <AppText tone="muted" size={12.5}>{hercule.mission}</AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Button small variant={state.mission === 'success' ? 'primary' : 'ghost'} label="Accomplie" onPress={() => dispatch({ type: 'ANSWER_MISSION', value: 'success' })} />
            <Button small variant={state.mission === 'fail' ? 'primary' : 'ghost'} label="Ratée" onPress={() => dispatch({ type: 'ANSWER_MISSION', value: 'fail' })} />
          </View>
        </Panel>
      ) : null}
      <View style={{ gap: 12 }}>
        <Button arrow label="Nouvelle manche" onPress={onNextRound} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Button variant="ghost" label="Voir tous les rôles" onPress={() => dispatch({ type: 'OPEN_SUMMARY' })} />
          <Button variant="ghost" label="Journal des scores" onPress={actions.onScores} />
          <Button variant="ghost" label="Nouvelle partie" onPress={actions.onNewGame} />
        </View>
      </View>
    </View>
  );
}
