import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  describeCard, plural, ROLE_NAMES, baseRoleKey, specialLabelsDetailed, type Player,
} from '@/domain';
import { buzz } from '@/services/feedback';
import { useSettings } from '@/state/settings';
import { alive, playerOf, type GameState, type GameAction } from '@/state/gameReducer';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import { ModalSheet } from '../ui/ModalSheet';
import { AppText, Button, Field, Segmented } from '../ui/primitives';

type D = React.Dispatch<GameAction>;
interface P { readonly state: GameState; readonly dispatch: D }

const ActionsRow = ({ children }: { children: React.ReactNode }): React.JSX.Element => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>{children}</View>
);

/* ----------------------------- Carte secrète ----------------------------- */

export function SecretCardModal({ state, dispatch }: P): React.JSX.Element {
  const { settings } = useSettings();
  const { colors } = useTheme();
  const player = playerOf(state, state.openCardId);
  const open = state.modal === 'card' && !!player;
  const [held, setHeld] = useState(false);
  const [maskedByTimer, setMaskedByTimer] = useState(false);
  // Standard et auto : le mot est affiché dès l'ouverture (le joueur vient de toucher sa propre carte).
  const [shown, setShown] = useState(true);

  useEffect(() => { setHeld(false); setMaskedByTimer(false); setShown(settings.privacy !== 'hold'); }, [state.openCardId, settings.privacy]);
  useEffect(() => {
    if (!open || settings.privacy !== 'auto' || !shown) return;
    const t = setTimeout(() => { setShown(false); setMaskedByTimer(true); }, settings.autoHideSec * 1000);
    return () => clearTimeout(t);
  }, [open, settings.privacy, settings.autoHideSec, shown, state.openCardId]);

  const card = player ? describeCard(player, { players: state.players, showRole: settings.showRole, civilWordHint: state.civilWordHint }) : null;
  const visible = settings.privacy === 'hold' ? held : shown;
  const hint = settings.privacy === 'hold'
    ? 'Maintiens le bouton pour voir ton mot, puis relâche avant de passer l\'appareil.'
    : maskedByTimer ? 'Carte masquée automatiquement.' : "Assure-toi que personne d'autre ne regarde l'écran avant de continuer.";

  return (
    <ModalSheet visible={open} paper stamp="confidentiel">
      {card ? (
        <>
          <AppText size={11} style={{ color: colors.inkSoft, letterSpacing: 1.1 }} center>{card.owner}</AppText>
          {visible ? (
            <>
              {card.roleLine ? <AppText bold size={14.4} center style={{ color: colors.redDeep }}>{card.roleLine}</AppText> : null}
              <View style={{ alignItems: 'center', gap: 4, marginVertical: 6 }}>
                <AppText size={10.4} style={{ color: colors.inkSoft, letterSpacing: 1.6 }} center>Ton mot</AppText>
                <Text style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: card.isJanus ? 22 : 34, textAlign: 'center', lineHeight: card.isJanus ? 30 : 42 }}>{card.wordText}</Text>
              </View>
              {card.badges.map((b) => (
                <View key={b.label} style={{ alignSelf: 'stretch', backgroundColor: 'rgba(164,55,42,0.08)', borderWidth: 1, borderColor: 'rgba(164,55,42,0.3)', borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 10, gap: 2 }}>
                  <AppText bold size={12.8} style={{ color: colors.redDeep }}>{b.label}</AppText>
                  <AppText size={11.2} style={{ color: colors.inkSoft }}>{b.desc}</AppText>
                </View>
              ))}
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 18 }}>
              <AppText size={14} center style={{ color: colors.inkSoft }}>{settings.privacy === 'hold' ? 'Mot masqué' : 'Mot masqué'}</AppText>
            </View>
          )}
          <Text style={{ color: colors.inkSoft, fontFamily: fonts.italic, fontSize: 11.2, textAlign: 'center' }}>{hint}</Text>
          {settings.privacy === 'hold' ? (
            <Pressable onPressIn={() => setHeld(true)} onPressOut={() => setHeld(false)} accessibilityRole="button" accessibilityLabel="Maintenir pour révéler"
              style={{ borderWidth: 1, borderColor: colors.ink, borderStyle: 'dashed', borderRadius: radius.sm, paddingVertical: 14, paddingHorizontal: 22, alignSelf: 'stretch', alignItems: 'center' }}>
              <Text style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 14 }}>Maintenir pour révéler</Text>
            </Pressable>
          ) : maskedByTimer ? (
            <Button variant="ghost" small label="Réafficher" onPress={() => { setShown(true); setMaskedByTimer(false); }} />
          ) : null}
          <Button arrow center label="Cacher & passer au suivant" onPress={() => { buzz(20); dispatch({ type: 'CLOSE_CARD' }); }} />
        </>
      ) : null}
    </ModalSheet>
  );
}

/* ------------------------------- Confirmation ------------------------------- */

export function ConfirmModal({ state, dispatch }: P): React.JSX.Element {
  const target = playerOf(state, state.confirmTargetId);
  return (
    <ModalSheet visible={state.modal === 'confirm' && !!target} kicker="vote" title="Confirmer le vote" center onClose={() => dispatch({ type: 'CANCEL_CONFIRM' })}>
      <AppText title size={30} center tone="gold">{target?.name ?? ''}</AppText>
      <AppText tone="muted" size={13} center>Le groupe est d'accord pour éliminer ce joueur ?</AppText>
      <ActionsRow>
        <Button variant="ghost" label="Annuler" onPress={() => dispatch({ type: 'CANCEL_CONFIRM' })} />
        <Button arrow label="Éliminer" onPress={() => { buzz(60); dispatch({ type: 'CONFIRM_ELIMINATE' }); }} />
      </ActionsRow>
    </ModalSheet>
  );
}

/* --------------------------------- Annonce --------------------------------- */

export function AnnounceModal({ state, dispatch }: P): React.JSX.Element {
  const a = state.announce;
  return (
    <ModalSheet visible={state.modal === 'announce' && !!a} kicker="élimination" title={a?.headline} center>
      {a?.lines.map((l, i) => <AppText key={i} tone={i === 0 ? 'default' : 'gold'} size={14} center>{l}</AppText>)}
      <AppText tone="muted" size={13} center>{a?.text ?? ''}</AppText>
      <Button arrow center label={a?.button ?? 'Continuer'} onPress={() => dispatch({ type: 'ANNOUNCE_CONTINUE' })} />
    </ModalSheet>
  );
}

/* ------------------------- Choix d'une cible (Orion / Prométhée) ------------------------- */

export function PickModal({ state, dispatch }: P): React.JSX.Element {
  const orion = state.pickPurpose === 'orion';
  const source = playerOf(state, orion ? state.pendingOrionId : state.pendingPrometheusId);
  const targets = alive(state).filter((p) => p.id !== source?.id);
  const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => { setChoice(null); }, [state.modal, state.pickPurpose]);
  return (
    <ModalSheet visible={state.modal === 'pick'} kicker={orion ? 'dernier tir' : 'sacrifice'} title={orion ? 'Orion, le Chasseur' : 'Prométhée'} center>
      <AppText tone="muted" size={13} center>
        {orion
          ? `${source?.name ?? 'Orion'} désigne publiquement un joueur qui tombe avec lui/elle.`
          : `${source?.name ?? 'Prométhée'} désigne un joueur : son camp sera révélé à tous.`}
      </AppText>
      <Segmented<number> options={targets.map((p) => ({ key: p.id, label: p.name }))} value={choice ?? -1} onChange={setChoice} />
      <Button arrow center label="Confirmer la cible" disabled={choice === null} onPress={() => { if (choice !== null) dispatch({ type: 'PICK_TARGET', id: choice }); }} />
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
      <ModalSheet visible={state.modal === 'guess'} kicker="dernière chance" title={title} center>
        <AppText size={13.5} center>{body}</AppText>
        <Button arrow center label={g.outcome === 'win' ? 'Voir le résultat' : g.hasNext ? 'Mr. White suivant' : 'Continuer'} onPress={() => dispatch({ type: 'GUESS_CONTINUE' })} />
      </ModalSheet>
    );
  }
  return (
    <ModalSheet visible={state.modal === 'guess' && !!current} kicker="dernière chance" title="Mr. White" center>
      <AppText tone="muted" size={13} center>{`${current?.name ?? 'Mr. White'}, devine le mot des Civils. Si tu le trouves, tu gagnes seul(e) la partie !`}</AppText>
      <View style={{ alignSelf: 'stretch' }}>
        <Field label="Ta proposition" value={text} onChangeText={setText} autoFocus autoCapitalize="none" onSubmitEditing={() => dispatch({ type: 'GUESS_SUBMIT', value: text })} />
      </View>
      <ActionsRow>
        <Button variant="ghost" label="Renoncer" onPress={() => dispatch({ type: 'GUESS_SUBMIT', value: null })} />
        <Button arrow label="Valider" disabled={!text.trim()} onPress={() => dispatch({ type: 'GUESS_SUBMIT', value: text })} />
      </ActionsRow>
    </ModalSheet>
  );
}

/* ----------------------------------- Bilan ----------------------------------- */

function recapLine(p: Player): string {
  const extra = specialLabelsDetailed(p);
  return `${p.eliminated ? '✝ ' : ''}${p.name} — ${ROLE_NAMES[baseRoleKey(p)]}${extra.length ? ` · ${extra.join(', ')}` : ''}`;
}

export function SummaryModal({ state, dispatch, onNextRound }: P & { onNextRound?: () => void }): React.JSX.Element {
  const n = state.players.length;
  return (
    <ModalSheet visible={state.summaryOpen} title="Bilan de la manche" onClose={() => dispatch({ type: 'CLOSE_SUMMARY' })}>
      <AppText tone="muted" size={12.5}>À révéler une fois la discussion et le vote terminés.</AppText>
      <AppText tone="gold" bold size={14}>{`Civils : ${state.civilWord} · Undercover : ${state.undercoverWord}`}</AppText>
      <AppText tone="muted" size={12}>{`${n} ${plural(n, 'joueur', 'joueurs')} · manche ${state.round}`}</AppText>
      <View style={{ gap: 4 }}>{state.players.map((p) => <AppText key={p.id} size={13}>{recapLine(p)}</AppText>)}</View>
      <ActionsRow>
        <Button variant="ghost" label="Fermer" onPress={() => dispatch({ type: 'CLOSE_SUMMARY' })} />
        {state.phase === 'gameover' && onNextRound ? <Button arrow label="Nouvelle manche" onPress={() => { dispatch({ type: 'CLOSE_SUMMARY' }); onNextRound(); }} /> : null}
      </ActionsRow>
    </ModalSheet>
  );
}
