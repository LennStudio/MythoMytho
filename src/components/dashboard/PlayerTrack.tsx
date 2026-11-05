import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/domain';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';
import { DashCard } from './DashCard';

function Arrow({ dir, disabled, onPress }: { dir: -1 | 1; disabled: boolean; onPress: () => void }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={dir < 0 ? 'Un joueur de moins' : 'Un joueur de plus'}
      style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : pressed ? 0.8 : 1 })}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <Path d={dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </Svg>
    </Pressable>
  );
}

/** Sélecteur de nombre de joueurs en « piste » : flèches, voisins estompés, valeur courante en relief. */
export function PlayerTrack({ value, onChange }: { value: number; onChange: (n: number) => void }): React.JSX.Element {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const reach = width < 440 ? 2 : 3;
  const offsets = Array.from({ length: reach * 2 + 1 }, (_, i) => i - reach);
  const OPACITY: Readonly<Record<number, number>> = { 0: 1, 1: 0.95, 2: 0.7, 3: 0.38 };
  return (
    <DashCard title="Nombre de joueurs" hint={`De ${MIN_PLAYERS} à ${MAX_PLAYERS} joueurs. Touchez un nombre ou utilisez les flèches.`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bg, borderRadius: 999, borderWidth: 1, borderColor: colors.line, padding: 6 }}>
        <Arrow dir={-1} disabled={value <= MIN_PLAYERS} onPress={() => onChange(value - 1)} />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {offsets.map((o) => {
            const v = value + o;
            const exists = v >= MIN_PLAYERS && v <= MAX_PLAYERS;
            if (o === 0) {
              return (
                <View key={o} style={{ flex: 2.2, height: 52, borderRadius: 26, backgroundColor: colors.raised, borderWidth: 1, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 30 }}>{v}</Text>
                </View>
              );
            }
            return (
              <Pressable key={o} disabled={!exists} onPress={() => onChange(v)} accessibilityRole="button" accessibilityLabel={`${v} joueurs`}
                style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                {exists ? <Text style={{ color: colors.text, opacity: OPACITY[Math.abs(o)] ?? 0.3, fontFamily: fonts.bold, fontSize: 17 }}>{v}</Text> : null}
              </Pressable>
            );
          })}
        </View>
        <Arrow dir={1} disabled={value >= MAX_PLAYERS} onPress={() => onChange(value + 1)} />
      </View>
    </DashCard>
  );
}
