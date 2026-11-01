import React from 'react';
import { View } from 'react-native';
import {
  AUTO_HIDE_CHOICES, DIFFICULTY_LABELS, MAX_PLAYERS, MIN_PLAYERS, TIMER_MAX_MINUTES, TIMER_MIN_MINUTES,
  countPairs, maxImpostors, plural, recommendationHint, type Difficulty, type PrivacyMode,
} from '@/domain';
import { ROLE_CATALOG } from '@/features/roleCatalog';
import { useLibrary } from '@/state/library';
import { useSettings, useSettingsActions } from '@/state/settings';
import { AppText, Block, Chip, Stepper, Toggle } from '../ui/primitives';

export function PlayersBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const cap = maxImpostors(s.playerCount);
  const total = s.undercoverCount + s.mrWhiteCount + s.espionCount;
  return (
    <Block title="Joueurs et imposteurs" summary={`${s.playerCount} joueurs · ${total} ${plural(total, 'imposteur', 'imposteurs')}`} defaultOpen>
      <Stepper label="Joueurs" value={s.playerCount} min={MIN_PLAYERS} max={MAX_PLAYERS} onChange={a.setPlayers} />
      <Stepper label="Undercovers" value={s.undercoverCount} min={1} max={cap} onChange={(n) => a.setCount('undercoverCount', n)} />
      <Toggle label="Undercovers automatiques" desc="Ajuste le nombre selon les joueurs et les traîtres." value={s.autoUndercover} onChange={a.setAutoUndercover} />
      <Stepper label="Mr. White" hint="Sans mot, peut gagner en devinant" value={s.mrWhiteCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.espionCount)} onChange={(n) => a.setCount('mrWhiteCount', n)} />
      <Stepper label="Espion" hint="Sans mot, reçoit la 1re lettre" value={s.espionCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.mrWhiteCount)} onChange={(n) => a.setCount('espionCount', n)} />
      <AppText tone="muted" size={13}>{recommendationHint(s.playerCount)}</AppText>
    </Block>
  );
}

export function ThemesBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const { themes } = useLibrary();
  const picked = themes.filter((t) => s.selectedThemes[t.key]);
  const available = picked.reduce((n, t) => n + countPairs(t, s.difficulty), 0);
  return (
    <Block title="Thèmes et difficulté" summary={`${picked.length} ${plural(picked.length, 'thème', 'thèmes')} · ${available} paires`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {themes.map((t) => <Chip key={t.key} label={`${t.label} (${t.pairs.length})`} selected={!!s.selectedThemes[t.key]} onPress={() => a.toggleTheme(t.key)} />)}
      </View>
      <Toggle label="Filtrer par difficulté" value={s.difficulty !== 0} onChange={(on) => a.setDifficulty(on ? s.difficultyLevel : 0)} />
      {s.difficulty !== 0 ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {([1, 2, 3] as const).map((d: Difficulty) => <Chip key={d} label={DIFFICULTY_LABELS[d]} selected={s.difficulty === d} onPress={() => a.setDifficulty(d)} />)}
        </View>
      ) : null}
    </Block>
  );
}

export function RolesBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const active = ROLE_CATALOG.filter((r) => s.roles[r.key]).length;
  const section = (group: 'classic' | 'mythology', title: string): React.JSX.Element => (
    <View style={{ gap: 4 }}>
      <AppText tone="gold" bold size={13}>{title}</AppText>
      {ROLE_CATALOG.filter((r) => r.group === group).map((r) => (
        <Toggle key={r.key} label={r.label} desc={r.desc} value={s.roles[r.key]} onChange={() => a.toggleRole(r.key)} />
      ))}
    </View>
  );
  return (
    <Block title="Rôles spéciaux" summary={active === 0 ? 'Aucun' : `${active} ${plural(active, 'activé', 'activés')}`}>
      {section('classic', 'CLASSIQUES')}
      {section('mythology', 'MYTHOLOGIE')}
    </Block>
  );
}

export function ComfortBlock(): React.JSX.Element {
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const modes: ReadonlyArray<{ key: PrivacyMode; label: string }> = [
    { key: 'standard', label: 'Standard' }, { key: 'auto', label: 'Masquage auto' }, { key: 'hold', label: 'Maintenir' },
  ];
  return (
    <Block title="Confort de jeu" summary={s.timerEnabled ? `Minuteur ${s.timerDurationMin} min` : 'Minuteur désactivé'}>
      <AppText bold>Confidentialité des cartes</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {modes.map((m) => <Chip key={m.key} label={m.label} selected={s.privacy === m.key} onPress={() => a.patch({ privacy: m.key })} />)}
      </View>
      {s.privacy === 'auto' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <AppText tone="muted" size={13}>Masquer après</AppText>
          {AUTO_HIDE_CHOICES.map((sec) => <Chip key={sec} label={`${sec} s`} selected={s.autoHideSec === sec} onPress={() => a.patch({ autoHideSec: sec })} />)}
        </View>
      ) : null}
      <Toggle label="Afficher « Tu es [rôle] »" value={s.showRole} onChange={(v) => a.patch({ showRole: v })} />
      <Toggle label="Minuteur de discussion" value={s.timerEnabled} onChange={(v) => a.patch({ timerEnabled: v })} />
      {s.timerEnabled ? (
        <>
          <Stepper label="Durée (minutes)" value={s.timerDurationMin} min={TIMER_MIN_MINUTES} max={TIMER_MAX_MINUTES} onChange={(n) => a.patch({ timerDurationMin: n })} />
          <Toggle label="Son de fin" value={s.timerSound} onChange={(v) => a.patch({ timerSound: v })} />
        </>
      ) : null}
    </Block>
  );
}
