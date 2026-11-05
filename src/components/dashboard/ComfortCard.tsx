import React from 'react';
import { View } from 'react-native';
import { AUTO_HIDE_CHOICES, TIMER_MAX_MINUTES, TIMER_MIN_MINUTES, type GameSettings, type PrivacyMode } from '@/domain';
import { useSettingsActions } from '@/state/settings';
import { AppText, Counter, Segmented, Toggle } from '../ui/primitives';
import { DashCard } from './DashCard';

const PRIVACY: ReadonlyArray<{ key: PrivacyMode; label: string; desc: string }> = [
  { key: 'standard', label: 'Standard', desc: "Le mot reste affiché jusqu'à « Cacher & passer au suivant »." },
  { key: 'auto', label: 'Masquage automatique', desc: 'Le mot se masque tout seul après quelques secondes. Il reste possible de le réafficher.' },
  { key: 'hold', label: 'Maintenir pour révéler', desc: "Le mot n'apparaît que tant que le doigt reste appuyé sur le bouton." },
];

/** Minuteur de discussion et confidentialité des cartes. */
export function ComfortCard({ settings: s }: { settings: GameSettings }): React.JSX.Element {
  const a = useSettingsActions();
  return (
    <DashCard title="Minuteur et confidentialité">
      <Toggle label="Activer le minuteur" desc="Compte à rebours visuel une fois toutes les cartes consultées, pour cadrer la discussion avant le vote."
        value={s.timerEnabled} onChange={(v) => a.patch({ timerEnabled: v })} />
      {s.timerEnabled ? (
        <View style={{ gap: 12 }}>
          <Counter label="Durée de la discussion" value={s.timerDurationMin} min={TIMER_MIN_MINUTES} max={TIMER_MAX_MINUTES} range="minutes" onChange={(n) => a.patch({ timerDurationMin: n })} />
          <Toggle label="Son de fin" desc="Courte sonnerie à la fin du temps, en plus de la vibration." value={s.timerSound} onChange={(v) => a.patch({ timerSound: v })} />
        </View>
      ) : null}
      <AppText bold size={13.5}>Confidentialité des cartes</AppText>
      <View style={{ gap: 10 }}>
        {PRIVACY.map((p) => <Toggle key={p.key} radio label={p.label} desc={p.desc} value={s.privacy === p.key} onChange={() => a.patch({ privacy: p.key })} />)}
      </View>
      {s.privacy === 'auto' ? (
        <View style={{ gap: 8 }}>
          <AppText tone="muted" size={12}>Masquer après</AppText>
          <Segmented<number> options={AUTO_HIDE_CHOICES.map((sec) => ({ key: sec, label: `${sec} s` }))} value={s.autoHideSec} onChange={(sec) => a.patch({ autoHideSec: sec })} />
        </View>
      ) : null}
      <Toggle label="Afficher « Tu es [rôle] » sur la carte"
        desc="Désactivé, Civils et Undercover ne voient que leur mot, comme au jeu classique. Mr. White et l'Espion voient toujours leur rôle."
        value={s.showRole} onChange={(v) => a.patch({ showRole: v })} />
    </DashCard>
  );
}
