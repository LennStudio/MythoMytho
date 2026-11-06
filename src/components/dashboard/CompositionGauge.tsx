import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { balancePosition, maxImpostors, plural, recommendedImpostors, type GameSettings } from '@/domain';
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
 * Jauge d'ÉQUILIBRE (et non de proportion de joueurs) : le curseur est au centre quand le nombre d'imposteurs est
 * celui qui est conseillé (≈ 1 pour 4 joueurs). À gauche : avantage aux Civils ; à droite : avantage aux imposteurs.
 * Toucher la barre règle le nombre d'imposteurs (donc d'Undercovers, en désactivant le mode automatique).
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
  const pos = balancePosition(imp, n);
  const traitors = (s.roles.fauxfrere ? 1 : 0) + (s.roles.judas ? 1 : 0);
  const fixed = traitors + s.mrWhiteCount + s.espionCount;

  // Totaux d'imposteurs atteignables : au moins 1 Undercover, au plus le plafond des imposteurs « de base ».
  const minTotal = fixed + 1;
  const maxTotal = traitors + maxImpostors(n);
  const totals = Array.from({ length: Math.max(1, maxTotal - minTotal + 1) }, (_, i) => minTotal + i);
  const centers = totals.map((t) => balancePosition(t, n));
  const setTotal = (t: number): void => a.setCount('undercoverCount', Math.max(1, t - fixed));

  return (
    <DashCard title="Composition" right={<Text style={{ color: vColor, fontFamily: fonts.bold, fontSize: 12.5 }}>{v.label}</Text>}
      hint="Touchez la barre pour régler le nombre d'imposteurs.">
      <View style={{ paddingTop: 14 }}>
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: '50%', width: 0, height: 0, marginLeft: -6, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.text, opacity: 0.85 }} />
        <View style={{ height: 30, justifyContent: 'center' }}>
          <View style={{ height: 22, borderRadius: 11, overflow: 'hidden', flexDirection: 'row', backgroundColor: colors.red, boxShadow: '0 0 18px -4px rgba(164,55,42,0.55)' }}>
            <View style={{ width: `${pos * 100}%`, backgroundColor: colors.civil }} />
          </View>
          <View pointerEvents="none" style={{ position: 'absolute', left: `${pos * 100}%`, marginLeft: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.paper, borderWidth: 3, borderColor: colors.panel, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
          {/* Zones tactiles : une par total d'imposteurs atteignable, découpées aux milieux entre positions voisines. */}
          {totals.map((t, i) => {
            const c = centers[i] ?? 0.5;
            const left = i === 0 ? 0 : (((centers[i - 1] ?? c) + c) / 2) * 100;
            const right = i === totals.length - 1 ? 100 : ((c + (centers[i + 1] ?? c)) / 2) * 100;
            return (
              <Pressable key={t} onPress={() => setTotal(t)} accessibilityRole="button"
                accessibilityLabel={`${t} ${plural(t, 'imposteur', 'imposteurs')}, ${Math.max(0, n - t)} ${plural(Math.max(0, n - t), 'Civil', 'Civils')}`}
                style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, width: `${Math.max(0, right - left)}%` }} />
            );
          })}
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText tone="muted" size={11}>Avantage Civils</AppText>
        <AppText tone="muted" size={11}>Équilibre conseillé</AppText>
        <AppText tone="muted" size={11}>Avantage imposteurs</AppText>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText bold size={13} style={{ color: colors.civil }}>{`${civils} ${plural(civils, 'Civil', 'Civils')}`}</AppText>
        <AppText bold size={13} style={{ color: colors.red }}>{`${imp} ${plural(imp, 'imposteur', 'imposteurs')}`}</AppText>
      </View>
      <AppText tone="muted" size={11.5}>{`La barre mesure l'avantage, pas le nombre de joueurs : pour ${n} joueurs, ${rec} ${plural(rec, 'imposteur', 'imposteurs')} (Undercover, Mr. White, Espion et traîtres compris) place le curseur au centre.`}</AppText>
    </DashCard>
  );
}
