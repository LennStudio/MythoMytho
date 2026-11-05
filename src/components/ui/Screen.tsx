import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { Backdrop } from './Backdrop';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/** Fond (halo + grille), zones sûres et bouton de thème. */
export function Screen({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Backdrop />
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
        {children}
      </View>
      <ThemeToggle top={Math.max(14, insets.top + 8)} />
    </View>
  );
}

/** Colonne centrée (880 px max) avec le logo en tête, défilante. */
export function Page({ children, logo = true, maxWidth = 880 }: { children: React.ReactNode; logo?: boolean; maxWidth?: number }): React.JSX.Element {
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 12 : Math.max(16, Math.min(40, width * 0.04));
  return (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ alignItems: 'center', paddingTop: pad, paddingHorizontal: Math.max(12, pad / 2), paddingBottom: 60 }}>
      <View style={{ width: '100%', maxWidth }}>
        {logo ? <Wordmark /> : null}
        {children}
      </View>
    </ScrollView>
  );
}
