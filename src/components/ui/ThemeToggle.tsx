import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/** Bouton rond clair/sombre, en haut à droite (comme l'original). */
export function ThemeToggle({ top }: { top: number }): React.JSX.Element {
  const { colors, mode, toggle } = useTheme();
  const rays: Array<[number, number, number, number]> = [[12, 2, 12, 4], [12, 20, 12, 22], [2, 12, 4, 12], [20, 12, 22, 12], [4.9, 4.9, 6.3, 6.3], [17.7, 17.7, 19.1, 19.1], [4.9, 19.1, 6.3, 17.7], [17.7, 6.3, 19.1, 4.9]];
  return (
    <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      style={({ pressed }) => ({
        position: 'absolute', top, right: 14, zIndex: 5, width: 40, height: 40, borderRadius: 20, borderWidth: 1,
        borderColor: colors.goldSoft, backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center',
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}>
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {mode === 'dark'
          ? <>{<Circle cx={12} cy={12} r={4} />}{rays.map((r, i) => <Line key={i} x1={r[0]} y1={r[1]} x2={r[2]} y2={r[3]} />)}</>
          : <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}
      </Svg>
    </Pressable>
  );
}
