import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Fond de l'ancienne version : dégradé radial « cercle à 50 % −10 % » (halo → fond → vignette)
 * + quadrillage d'1 px tous les 64 px. Dessiné en SVG pour être identique sur web, iOS et Android.
 */
export function Backdrop(): React.JSX.Element {
  const { colors } = useTheme();
  const { width: w, height: h } = useWindowDimensions();
  const radius = Math.hypot(w / 2, h * 1.1);
  let grid = '';
  for (let x = 0; x <= w; x += 64) grid += `M${x + 0.5} 0V${h}`;
  for (let y = 0; y <= h; y += 64) grid += `M0 ${y + 0.5}H${w}`;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <Svg width={w} height={h}>
        <Defs>
          <RadialGradient id="mmBg" cx={w / 2} cy={-h * 0.1} rx={radius} ry={radius} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={colors.glow} />
            <Stop offset="0.45" stopColor={colors.bg} />
            <Stop offset="1" stopColor={colors.vignette} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={h} fill="url(#mmBg)" />
        <Path d={grid} stroke={colors.grid} strokeWidth={1} fill="none" />
      </Svg>
    </View>
  );
}
