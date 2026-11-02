import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import Svg, { Defs, FeBlend, FeFlood, FeGaussianBlur, Filter, G, Path } from 'react-native-svg';
import { AppText } from './primitives';
import { LOGO_REFLECT_1, LOGO_REFLECT_2, LOGO_VIEWBOX, LOGO_WORD_1, LOGO_WORD_2 } from './logoPaths';

const RED = '#A4372A';

/** Logo « Mytho Mytho » avec reflet (SVG d'origine) + sous-titre espacé. */
export function Wordmark(): React.JSX.Element {
  const { width } = useWindowDimensions();
  const w = Math.max(300, Math.min(480, width * 0.7));
  const h = (w * LOGO_VIEWBOX.height) / LOGO_VIEWBOX.width;
  // Le flou du reflet utilise les filtres SVG : fiables sur le web, évités sur mobile (support natif variable).
  const blur = Platform.OS === 'web';
  const reflect = (d: string, id: string): React.JSX.Element => (
    <G filter={blur ? `url(#${id})` : undefined}><Path d={d} fill={RED} fillOpacity={0.5} /></G>
  );
  const filter = (id: string, x: number): React.JSX.Element => (
    <Filter id={id} x={x} y={116.75} width={327.125} height={130.312} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
      <FeFlood floodOpacity={0} result="BackgroundImageFix" />
      <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
      <FeGaussianBlur stdDeviation={2} result="blur" />
    </Filter>
  );
  return (
    <View style={{ alignItems: 'center', marginBottom: Math.max(20, Math.min(34, width * 0.04)) }}>
      <View accessibilityRole="header" accessibilityLabel="MythoMytho" style={{ marginTop: -w * 0.06, marginBottom: -w * 0.055 }}>
        <Svg width={w} height={h} viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`} fill="none">
          <Path d={LOGO_WORD_1} fill={RED} />
          {reflect(LOGO_REFLECT_1, 'mmReflect0')}
          <Path d={LOGO_WORD_2} fill={RED} />
          {reflect(LOGO_REFLECT_2, 'mmReflect1')}
          {blur ? <Defs>{filter('mmReflect0', 63.625)}{filter('mmReflect1', 406.625)}</Defs> : null}
        </Svg>
      </View>
      <AppText tone="gold" size={11.5} center style={{ letterSpacing: 3.7, marginTop: 8 }}>jeu de mots &amp; de déduction</AppText>
    </View>
  );
}
