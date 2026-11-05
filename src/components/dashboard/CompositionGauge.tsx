import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { maxImpostors, plural, recommendedImpostors, type GameSettings } from '@/domain';
import { useSettingsActions } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';
import { AppText } from '../ui/primitives';
import { DashCard } from './DashCard';

/** Nombre d'imposteurs « équipe » : Undercover + Mr. White + Espion + Faux-Frère + Judas. */
export function impostorTeamSize(s: GameSettings): number {
  return s.undercoverCount + s.mrWhiteCount + s.espionCount + (s.roles.fauxfrere ? 1 : 0) + (s.roles.judas ? 1 : 0);
}

export type Verdict = { readonly label: string; readonly tone: 'ok' | 'civil' | 'impostor' };

export function verdict(s: GameSettings): Verdict {
  const imp = impostorTeamSize(s);
  const rec = recommendedImpostors(s.playerCount);
  if (imp < rec) return { label: 'Favorable aux Civils', tone: 'civil' };
  if (imp > rec + 1) return { label: 'Favorable aux imposteurs', tone: 'impostor' };
  return { label: 'Équilibrée', tone: 'ok' };
}

/**
 * Jauge Civils ⟷ imposteurs. Le curseur se déplace d'un joueur à la fois : toucher la barre règle le nombre
 * d'imposteurs (donc d'Undercovers, en désactivant le mode automatique). Le repère ▼ marque l'équilibre conseillé.
 */
export function CompositionGauge({ settings: s }: { settings: GameSettings }): React.JSX.Element {
  const { colors } = useTheme();
  const a = useSettingsActions();
  const n = s.playerCount;
  const imp = Math.min(n, impostorTeamSize(s));
  const civils = n - imp;
  const rec = recommendedImpostors(n);
  const v = verdict(s);
  const vColor = v.tone === 'ok' ? colors.civil : v.tone === 'civil' ? colors.gold : colors.red;
  const pct = (civils / n) * 100;
  const markPct = ((n - rec) / n) * 100;
  const traitors = (s.roles.fauxfrere ? 1 : 0) + (s.roles.judas ? 1 : 0);

  /** Place la frontière après `civilCount` Civils : total d'imposteurs = n − civilCount. */
  const setBoundary = (civilCount: number): void => {
    const wanted = n - civilCount;
    const base = wanted - traitors - s.mrWhiteCount - s.espionCount;
    a.setCount('undercoverCount', Math.max(1, Math.min(maxImpostors(n) - s.mrWhiteCount - s.espionCount, base)));
  };

  return (
    <DashCard title="Composition" right={<Text style={{ color: vColor, fontFamily: fonts.bold, fontSize: 12.5 }}>{v.label}</Text>}
      hint="Touchez la barre pour répartir Civils et imposteurs.">
      <View style={{ paddingTop: 14 }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: `${markPct}%`, width: 0, height: 0, marginLeft: -6, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.text, opacity: 0.85 }} />
        <View style={{ height: 30, justifyContent: 'center' }}>
          <View style={{ height: 22, borderRadius: 11, overflow: 'hidden', flexDirection: 'row', backgroundColor: colors.red, boxShadow: '0 0 18px -4px rgba(164,55,42,0.55)' }}>
            <View style={{ width: `${pct}%`, backgroundColor: colors.civil }} />
          </View>
          <View pointerEvents="none" style={{ position: 'absolute', left: `${pct}%`, marginLeft: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.paper, borderWidth: 3, borderColor: colors.panel, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
          {/* Zones tactiles : une par position possible de la frontière (0 à n Civils). */}
          {Array.from({ length: n + 1 }, (_, k) => (
            <Pressable key={k} onPress={() => setBoundary(k)} accessibilityRole="button" accessibilityLabel={`${k} ${plural(k, 'Civil', 'Civils')}, ${n - k} ${plural(n - k, 'imposteur', 'imposteurs')}`}
              style={{ position: 'absolute', top: 0, bottom: 0, left: `${(k / n) * 100 - 50 / n}%`, width: `${100 / n}%` }} />
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText bold size={13} style={{ color: colors.civil }}>{`${civils} ${plural(civils, 'Civil', 'Civils')}`}</AppText>
        <AppText bold size={13} style={{ color: colors.red }}>{`${imp} ${plural(imp, 'imposteur', 'imposteurs')}`}</AppText>
      </View>
      <AppText tone="muted" size={11.5}>{`Conseillé pour ${n} joueurs : ${rec} ${plural(rec, 'imposteur', 'imposteurs')} (Undercover, Mr. White, Espion et traîtres compris).`}</AppText>
    </DashCard>
  );
}
