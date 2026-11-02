import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import {
  AUTO_HIDE_CHOICES, DIFFICULTY_LABELS, MAX_PLAYERS, MIN_PLAYERS, TIMER_MAX_MINUTES, TIMER_MIN_MINUTES,
  maxImpostors, plural, recommendationHint, type Difficulty, type PrivacyMode,
} from '@/domain';
import { ESPION_DESC, MR_WHITE_DESC, ROLE_CATALOG } from '@/features/roleCatalog';
import { useLibrary } from '@/state/library';
import { useSettings, useSettingsActions } from '@/state/settings';
import { AppText, Button, Counter, Segmented, SetupBlock, Toggle } from '../ui/primitives';

/** Bloc 1 — toujours ouvert, sans en-tête repliable. */
export function PlayersBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const cap = maxImpostors(s.playerCount);
  return (
    <SetupBlock num={1} title="Joueurs et Undercover" collapsible={false}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
        <View>
          <Counter label="Joueurs" value={s.playerCount} min={MIN_PLAYERS} max={MAX_PLAYERS} range={`de ${MIN_PLAYERS} à ${MAX_PLAYERS}`} onChange={a.setPlayers} />
        </View>
        <View>
          <Counter label="Undercover" value={s.undercoverCount} min={1} max={cap} range={`de 1 à ${cap}`} onChange={(n) => a.setCount('undercoverCount', n)} />
        </View>
      </View>
      <Toggle label="Nombre d'Undercovers automatique" desc={recommendationHint(s.playerCount).replace('Recommandé pour', 'Recommandé pour')} value={s.autoUndercover} onChange={a.setAutoUndercover} />
    </SetupBlock>
  );
}

export function ThemesBlock(): React.JSX.Element {
  const router = useRouter();
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const { themes } = useLibrary();
  const picked = themes.filter((t) => s.selectedThemes[t.key]).length;
  return (
    <SetupBlock num={2} title="Themes des mots" summary={`${picked} thème${plural(picked, '', 's')} sélectionné${plural(picked, '', 's')}`}>
      <AppText tone="muted" size={12.5}>Sélectionnez un ou plusieurs thèmes : les mots seront piochés parmi ceux-ci. Une paire ne revient jamais tant que tout le stock du thème choisi n'a pas été utilisé.</AppText>
      <View style={{ gap: 10 }}>
        {themes.map((t) => <Toggle key={t.key} label={`${t.label} (${t.pairs.length})`} desc={t.desc} value={!!s.selectedThemes[t.key]} onChange={() => a.toggleTheme(t.key)} />)}
      </View>
      <Toggle label="Difficulté des paires" desc="Choisissez un niveau selon la proximité des deux mots. Désactivée, toutes les paires sont mélangées."
        value={s.difficulty !== 0} onChange={(on) => a.setDifficulty(on ? s.difficultyLevel : 0)} />
      {s.difficulty !== 0 ? (
        <Segmented<Difficulty> options={([1, 2, 3] as const).map((d) => ({ key: d, label: DIFFICULTY_LABELS[d] }))} value={s.difficulty} onChange={(d) => a.setDifficulty(d)} />
      ) : null}
      <Button small variant="ghost" label="Gérer « Mes paires »" onPress={() => router.push('/custom-pairs')} />
    </SetupBlock>
  );
}

export function RolesBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const cap = maxImpostors(s.playerCount);
  const active = ROLE_CATALOG.filter((r) => s.roles[r.key]).length + s.mrWhiteCount + s.espionCount;
  return (
    <SetupBlock num={3} title="Roles speciaux" summary={active === 0 ? 'Aucun rôle activé' : `${active} rôle${plural(active, '', 's')} activé${plural(active, '', 's')}`}>
      <View style={{ gap: 6 }}>
        <AppText bold size={15}>Mr. White</AppText>
        <Counter value={s.mrWhiteCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.espionCount)} range={`de 0 à ${Math.max(0, cap - s.undercoverCount - s.espionCount)}`} label="Mr. White" onChange={(n) => a.setCount('mrWhiteCount', n)} />
        <AppText tone="muted" size={11.5}>{MR_WHITE_DESC}</AppText>
      </View>
      <View style={{ gap: 6 }}>
        <AppText bold size={15}>Espion</AppText>
        <Counter value={s.espionCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.mrWhiteCount)} range={`de 0 à ${Math.max(0, cap - s.undercoverCount - s.mrWhiteCount)}`} label="Espion" onChange={(n) => a.setCount('espionCount', n)} />
        <AppText tone="muted" size={11.5}>{ESPION_DESC}</AppText>
      </View>
      <AppText tone="muted" size={11.5}>Un joueur ne peut recevoir qu'un seul rôle spécial ci-dessous. Être Undercover ou Mr. White ne compte pas dans cette limite.</AppText>
      <View style={{ gap: 10 }}>
        {ROLE_CATALOG.map((r) => <Toggle key={r.key} label={r.label} desc={r.desc} value={s.roles[r.key]} onChange={() => a.toggleRole(r.key)} />)}
      </View>
    </SetupBlock>
  );
}

const PRIVACY: ReadonlyArray<{ key: PrivacyMode; label: string; desc: string }> = [
  { key: 'standard', label: 'Standard', desc: "Le mot reste affiché jusqu'à « Cacher & passer au suivant »." },
  { key: 'auto', label: 'Masquage automatique', desc: 'Le mot se masque tout seul après quelques secondes. Il reste possible de le réafficher.' },
  { key: 'hold', label: 'Maintenir pour révéler', desc: "Le mot n'apparaît que tant que le doigt reste appuyé sur le bouton." },
];

export function ComfortBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const privacyLabel = PRIVACY.find((p) => p.key === s.privacy)?.label.toLowerCase() ?? 'standard';
  return (
    <SetupBlock num={5} title="Minuteur et confidentialite" summary={`${s.timerEnabled ? `${s.timerDurationMin} min` : 'sans minuteur'} · ${privacyLabel}`}>
      <Toggle label="Activer le minuteur" desc="Affiche un compte à rebours visuel une fois toutes les cartes consultées, pour cadrer la durée de la discussion avant le vote."
        value={s.timerEnabled} onChange={(v) => a.patch({ timerEnabled: v })} />
      {s.timerEnabled ? (
        <>
          <Counter label="Durée de la discussion" value={s.timerDurationMin} min={TIMER_MIN_MINUTES} max={TIMER_MAX_MINUTES} range="minutes" onChange={(n) => a.patch({ timerDurationMin: n })} />
          <Toggle label="Son de fin" desc="Joue une courte sonnerie à la fin du temps, en plus de la vibration." value={s.timerSound} onChange={(v) => a.patch({ timerSound: v })} />
        </>
      ) : null}
      <AppText bold size={15}>Confidentialite des cartes</AppText>
      <View style={{ gap: 10 }}>
        {PRIVACY.map((p) => <Toggle key={p.key} radio label={p.label} desc={p.desc} value={s.privacy === p.key} onChange={() => a.patch({ privacy: p.key })} />)}
      </View>
      {s.privacy === 'auto' ? (
        <View style={{ gap: 8 }}>
          <AppText tone="muted" size={12}>Masquer après</AppText>
          <Segmented<number> options={AUTO_HIDE_CHOICES.map((sec) => ({ key: sec, label: `${sec} secondes` }))} value={s.autoHideSec} onChange={(sec) => a.patch({ autoHideSec: sec })} />
        </View>
      ) : null}
      <Toggle label="Afficher « Tu es [rôle] » sur la carte"
        desc="Désactivé, les Civils et l'Undercover ne voient que leur mot et ignorent leur camp, comme dans le jeu classique. Mr. White et l'Espion, qui n'ont pas de mot, voient toujours leur rôle."
        value={s.showRole} onChange={(v) => a.patch({ showRole: v })} />
    </SetupBlock>
  );
}
