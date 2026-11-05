import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { DIFFICULTY_LABELS, countPairs, plural, type DifficultyFilter, type GameSettings } from '@/domain';
import { useLibrary } from '@/state/library';
import { useSettingsActions } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { alpha } from '@/theme/color';
import { fonts } from '@/theme/tokens';
import { AppText, Button, Segmented } from '../ui/primitives';
import { DashCard } from './DashCard';

export function ThemesCard({ settings: s }: { settings: GameSettings }): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const a = useSettingsActions();
  const { themes } = useLibrary();
  const picked = themes.filter((t) => s.selectedThemes[t.key]);
  const available = picked.reduce((n, t) => n + countPairs(t, s.difficulty), 0);
  const levels: ReadonlyArray<{ key: DifficultyFilter; label: string }> = [
    { key: 0, label: 'Toutes' }, { key: 1, label: DIFFICULTY_LABELS[1] }, { key: 2, label: DIFFICULTY_LABELS[2] }, { key: 3, label: DIFFICULTY_LABELS[3] },
  ];
  return (
    <DashCard title="Thèmes des mots" hint="Les mots sont piochés parmi les thèmes choisis ; une paire ne revient jamais avant d'avoir épuisé le stock."
      right={<AppText tone="muted" size={11.5}>{`${picked.length} ${plural(picked.length, 'thème', 'thèmes')} · ${available} paires`}</AppText>}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {themes.map((t) => {
          const on = !!s.selectedThemes[t.key];
          return (
            <Pressable key={t.key} onPress={() => a.toggleTheme(t.key)} accessibilityRole="switch" accessibilityLabel={`${t.label} (${t.pairs.length})`} accessibilityState={{ checked: on }}
              style={{ flexGrow: 1, flexBasis: 150, gap: 3, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: on ? colors.gold : colors.line, backgroundColor: on ? alpha(colors.gold, 0.12) : colors.bg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <Text numberOfLines={2} style={{ flexShrink: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 13 }}>{t.label}</Text>
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: on ? colors.gold : 'transparent', borderWidth: 1.5, borderColor: on ? colors.gold : colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
                  {on ? <Text style={{ color: colors.ink, fontSize: 11, fontFamily: fonts.bold, lineHeight: 14 }}>✓</Text> : null}
                </View>
              </View>
              <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 10.5 }}>{`${t.pairs.length} paires`}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ gap: 8 }}>
        <AppText bold size={13.5}>Difficulté des paires</AppText>
        <Segmented<DifficultyFilter> options={levels} value={s.difficulty} onChange={(d) => a.setDifficulty(d)} />
      </View>
      <Button small variant="ghost" label="Gérer « Mes paires »" onPress={() => router.push('/custom-pairs')} />
    </DashCard>
  );
}
