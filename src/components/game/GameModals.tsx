import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  describeCard, plural, ROLE_NAMES, baseRoleKey, specialLabelsDetailed, type Player,
} from '@/domain';
import { buzz } from '@/services/feedback';
import { useSettings } from '@/state/settings';
import { alive, playerOf, type GameState, type GameAction } from '@/state/gameReducer';
import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';
import { ModalSheet } from '../ui/ModalSheet';
import { AppText, Button, Field } from '../ui/primitives';

type D = React.Dispatch<GameAction>;
interface P { readonly state: GameState; readonly dispatch: D }

/* ----------------------------- Carte secrète ----------------------------- */

export function SecretCardModal({ state, dispatch }: P): React.JSX.Element {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const player = playerOf(state, state.openCardId);
  const [revealed, setRevealed] = useState(false);
  const [hiddenByTimer, setHiddenByTimer] = useState(false);
  const open = state.modal === 'card' && !!player;

  useEffect(() => { setRevealed(false); setHiddenByTimer(false); }, [state.openCardId]);
  useEffect(() => {
    if (!revealed || settings.privacy !== 'auto') return;
    const t = setTimeout(() => { setRevealed(false); setHiddenByTimer(true); }, settings.autoHideSec * 1000);
    return () => clearTimeout(t);
  }, [revealed, settings.privacy, settings.autoHideSec]);

  const card = player ? describeCard(player, { players: state.players, showRole: settings.showRole, civilWordHint: state.civilWordHint }) : null;
  const close = (): void => dispatch({ type: 'CLOSE_CARD' });

  const content = card ? (
    <View style={{ gap: 12 }}>
      {card.roleLine ? <AppText style={{ color: colors.ink }} bold>{card.roleLine}</AppText> : null}
      <View style={{ borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, padding: 16, alignItems: 'center' }}>
        <AppText title size={card.isJanus ? 22 : 34} center style={{ color: colors.red }}>{card.wordText}</AppText>
      </View>
      {card.badges.map((b) => (
        <View key={b.label} style={{ gap: 2 }}>
          <AppText bold size={14} style={{ color: colors.redDeep }}>{b.label}</AppText>
          <AppText size={13} style={{ color: colors.inkSoft }}>{b.desc}</AppText>
        </View>
      ))}
    </View>
  ) : null;

  return (
    <ModalSheet visible={open} paper title={card?.owner}>
      {settings.privacy === 'hold' ? (
        <>
          <Pressable onPressIn={() => setRevealed(true)} onPressOut={() => setRevealed(false)} accessibilityRole="button" accessibilityLabel="Maintenir pour voir la carte"
            style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.ink, borderRadius: radius.sm, padding: 18, alignItems: 'center', minHeight: 140, justifyContent: 'center' }}>
            {revealed ? content : <AppText center style={{ color: colors.inkSoft }}>Maintenez appuyé pour voir votre carte</AppText>}
          </Pressable>
          <Button variant="primary" label="J'ai vu — passer au suivant" onPress={close} />
        </>
      ) : revealed ? (
        <>{content}<Button label="J'ai mémorisé — cacher" onPress={close} /></>
      ) : (
        <>
          <AppText style={{ color: colors.inkSoft }}>
            {hiddenByTimer ? 'Carte masquée automatiquement.' : 'Assurez-vous que personne ne regarde votre écran.'}
          </AppText>
          {!hiddenByTimer ? <Button label="Voir ma carte" onPress={() => { setRevealed(true); buzz(20); }} /> : null}
          <Button variant={hiddenByTimer ? 'primary' : 'ghost'} label={hiddenByTimer ? 'Passer au suivant' : 'Annuler'} onPress={hiddenByTimer ? close : () => dispatch({ type: 'CANCEL_CARD' })} />
        </>
      )}
    </ModalSheet>
  );
}

/* ------------------------------- Confirmation ------------------------------- */

export function ConfirmModal({ state, dispatch }: P): React.JSX.Element {
  const target = playerOf(state, state.confirmTargetId);
  return (
    <ModalSheet visible={state.modal === 'confirm' && !!target} title="Confirmer l'élimination" onClose={() => dispatch({ type: 'CANCEL_CONFIRM' })}>
      <AppText>{`Le groupe élimine ${target?.name ?? ''} ?`}</AppText>
      <Button label="Éliminer" onPress={() => { buzz(60); dispatch({ type: 'CONFIRM_ELIMINATE' }); }} />
      <Button variant="ghost" label="Annuler" onPress={() => dispatch({ type: 'CANCEL_CONFIRM' })} />
    </ModalSheet>
  );
}

/* --------------------------------- Annonce --------------------------------- */

export function AnnounceModal({ state, dispatch }: P): React.JSX.Element {
  const a = state.announce;
  return (
    <ModalSheet visible={state.modal === 'announce' && !!a} title={a?.headline}>
      {a?.lines.map((l, i) => <AppText key={i} tone={i === 0 ? 'default' : 'gold'}>{l}</AppText>)}
      <AppText tone="muted">{a?.text ?? ''}</AppText>
      <Button label={a?.button ?? 'Continuer'} onPress={() => dispatch({ type: 'ANNOUNCE_CONTINUE' })} />
    </ModalSheet>
  );
}

/* ------------------------- Choix d'une cible (Orion / Prométhée) ------------------------- */

export function PickModal({ state, dispatch }: P): React.JSX.Element {
  const orion = state.pickPurpose === 'orion';
  const source = playerOf(state, orion ? state.pendingOrionId : state.pendingPrometheusId);
  const targets = alive(state).filter((p) => p.id !== source?.id);
  return (
    <ModalSheet visible={state.modal === 'pick'} title={orion ? 'Dernier tir d\'Orion' : 'Sacrifice de Prométhée'}>
      <AppText tone="muted">
        {orion
          ? `${source?.name ?? 'Orion'} désigne publiquement un joueur qui tombe avec lui/elle.`
          : `${source?.name ?? 'Prométhée'} désigne un joueur : son camp sera révélé à tous.`}
      </AppText>
      {targets.map((p) => <Button key={p.id} variant="ghost" label={p.name} onPress={() => dispatch({ type: 'PICK_TARGET', id: p.id })} />)}
    </ModalSheet>
  );
}

/* --------------------------- Dernière chance de Mr. White --------------------------- */

export function GuessModal({ state, dispatch }: P): React.JSX.Element {
  const [text, setText] = useState('');
  const g = state.guess;
  const current = playerOf(state, state.guessQueue[0] ?? null);
  useEffect(() => { setText(''); }, [g.stage, state.guessQueue.length]);

  if (g.stage === 'result') {
    const title = g.outcome === 'win' ? 'Bonne réponse !' : g.outcome === 'skip' ? 'Pas de proposition' : 'Raté !';
    const body = g.outcome === 'win'
      ? `${g.playerName} a trouvé le mot des Civils et gagne la partie à lui/elle seul(e) !`
      : `${g.playerName} ${g.outcome === 'skip' ? 'passe son tour' : `a proposé « ${g.guess} »`}. Le mot reste secret.`;
    return (
      <ModalSheet visible={state.modal === 'guess'} title={title}>
        <AppText>{body}</AppText>
        <Button label={g.outcome === 'win' ? 'Voir le résultat' : g.hasNext ? 'Mr. White suivant' : 'Continuer'} onPress={() => dispatch({ type: 'GUESS_CONTINUE' })} />
      </ModalSheet>
    );
  }
  return (
    <ModalSheet visible={state.modal === 'guess' && !!current} title="Dernière chance">
      <AppText>{`${current?.name ?? 'Mr. White'}, quel est le mot des Civils ?`}</AppText>
      <Field label="Votre proposition" value={text} onChangeText={setText} autoFocus autoCapitalize="none" onSubmitEditing={() => dispatch({ type: 'GUESS_SUBMIT', value: text })} />
      <Button label="Valider" disabled={!text.trim()} onPress={() => dispatch({ type: 'GUESS_SUBMIT', value: text })} />
      <Button variant="ghost" label="Passer" onPress={() => dispatch({ type: 'GUESS_SUBMIT', value: null })} />
    </ModalSheet>
  );
}

/* ----------------------------------- Récapitulatif ----------------------------------- */

function recapLine(p: Player): string {
  const extra = specialLabelsDetailed(p);
  return `${p.eliminated ? '✝ ' : ''}${p.name} — ${ROLE_NAMES[baseRoleKey(p)]}${extra.length ? ` · ${extra.join(', ')}` : ''}`;
}

export function SummaryModal({ state, dispatch }: P): React.JSX.Element {
  const n = state.players.length;
  return (
    <ModalSheet visible={state.summaryOpen} title="Récapitulatif" onClose={() => dispatch({ type: 'CLOSE_SUMMARY' })}>
      <AppText tone="gold" bold>{`Civils : ${state.civilWord} · Undercover : ${state.undercoverWord}`}</AppText>
      <AppText tone="muted" size={13}>{`${n} ${plural(n, 'joueur', 'joueurs')} · manche ${state.round}`}</AppText>
      {state.players.map((p) => <AppText key={p.id} size={14}>{recapLine(p)}</AppText>)}
      <Button variant="ghost" label="Fermer" onPress={() => dispatch({ type: 'CLOSE_SUMMARY' })} />
    </ModalSheet>
  );
}
