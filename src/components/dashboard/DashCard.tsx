import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText } from '../ui/primitives';

/** Carte du tableau de bord : surface arrondie, titre en gras et zone libre à droite. */
export function DashCard({ title, right, hint, children, style }: {
  title?: string; right?: React.ReactNode; hint?: string; children: React.ReactNode; style?: StyleProp<ViewStyle>;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 20, gap: 16, boxShadow: `0 18px 40px -24px ${colors.shadow}` }, style]}>
      {title ? (
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <AppText bold size={17.6}>{title}</AppText>
            {right}
          </View>
          {hint ? <AppText tone="muted" size={11.5}>{hint}</AppText> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
