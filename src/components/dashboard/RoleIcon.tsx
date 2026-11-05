import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { IconKey } from '@/features/roleMeta';

/** Pictogrammes des rôles : traits arrondis sur une grille de 24, une seule couleur. */
function glyph(name: IconKey, c: string): React.JSX.Element {
  switch (name) {
    case 'civil':
      return <><Circle cx={12} cy={8} r={3.4} /><Path d="M5.5 20c.6-4 3.2-6 6.5-6s5.9 2 6.5 6" /></>;
    case 'undercover':
      return <><Path d="M6.5 9h11M8.5 9c0-3.2 1.4-4.8 3.5-4.8s3.5 1.6 3.5 4.8" /><Path d="M8.8 10.2c0 2.6 1.4 4.2 3.2 4.2s3.2-1.6 3.2-4.2" /><Path d="M5.5 20.5c.6-3.4 3-5.2 6.5-5.2s5.9 1.800 6.500 5.200" /></>;
    case 'mrwhite':
      return <><Circle cx={12} cy={12} r={8.2} /><Path d="M9.7 9.8a2.4 2.4 0 1 1 3.5 2.1c-.8.5-1.2 1-1.2 2" /><Path d="M12 16.6h.01" /></>;
    case 'espion':
      return <><Path d="M2.5 12S6 6 12 6s9.500 6 9.500 6-3.500 6-9.500 6S2.500 12 2.500 12z" /><Circle cx={12} cy={12} r={2.8} /></>;
    case 'idiot':
      return <><Path d="M12 4l6 12H6z" /><Path d="M4.500 19.500h15" /><Circle cx={12} cy={3.800} r={1.100} /></>;
    case 'fantome':
      return <><Path d="M6 20.500V10a6 6 0 0 1 12 0v10.500l-2-1.700-2 1.700-2-1.700-2 1.700-2-1.700z" /><Path d="M9.600 10.500h.01M14.400 10.500h.01" /></>;
    case 'mime':
      return <><Circle cx={12} cy={12} r={8.200} /><Path d="M8.500 15h7M10 13.600v2.800M12 13.600v2.800M14 13.600v2.800" /><Path d="M9.300 9.600h.01M14.700 9.600h.01" /></>;
    case 'procureur':
      return <><Path d="M10 4.500l5.500 5.500-3 3-5.500-5.500z" /><Path d="M12.600 11.800L18.500 17.700M4 20.500h9" /></>;
    case 'amoureux':
      return <Path d="M12 20.200S4.500 15.600 4.500 10A4.200 4.200 0 0 1 12 7.600 4.200 4.200 0 0 1 19.500 10c0 5.600-7.500 10.200-7.500 10.200z" />;
    case 'mytho':
      return <><Path d="M4 6.500h16v9H11.500L7.500 19v-3.500H4z" /><Path d="M7.500 11l1.800-1.600 1.800 1.600 1.800-1.600 1.800 1.600 1.800-1.600" /></>;
    case 'voyeur':
      return <><Circle cx={12} cy={12} r={8.500} /><Circle cx={12} cy={10.500} r={2.100} /><Path d="M12 12.600l-1.900 4.600h3.800z" /></>;
    case 'janus':
      return <><Circle cx={9} cy={12} r={5.500} /><Circle cx={15} cy={12} r={5.500} /><Path d="M7.300 11.200h.01M16.700 11.200h.01" /></>;
    case 'fauxfrere':
      return <><Path d="M5 6.500c4-1.600 10-1.600 14 0v5c0 4-3 7-7 7s-7-3-7-7z" /><Path d="M8.400 10.600c1-.8 2-.8 3 0M12.600 10.600c1-.8 2-.8 3 0" /><Path d="M9 14.600c1.700 1.600 4.300 1.600 6 0" /></>;
    case 'jumeaux':
      return <><Circle cx={8.500} cy={7.800} r={2.600} /><Circle cx={15.500} cy={7.800} r={2.600} /><Path d="M3.500 19.500c.4-3 2.200-4.600 5-4.600s4.600 1.600 5 4.600M10.500 19.500c.4-3 2.200-4.600 5-4.600s4.600 1.600 5 4.600" /></>;
    case 'tiresias':
      return <><Path d="M3.500 10h7v4a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z" /><Path d="M13.500 10h7v4a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3z" /><Path d="M10.500 11.500h3" /></>;
    case 'orion':
      return <><Path d="M5 17l7-4.500L19 8M8 5l4 7.500 4 6.500" /><Circle cx={5} cy={17} r={1.200} fill={c} /><Circle cx={12} cy={12.500} r={1.200} fill={c} /><Circle cx={19} cy={8} r={1.200} fill={c} /><Circle cx={8} cy={5} r={1.200} fill={c} /><Circle cx={16} cy={19} r={1.200} fill={c} /></>;
    case 'hercule':
      return <Path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12" />;
    case 'prometheus':
      return <Path d="M12 3c1 3.500 5 5.500 5 10a5 5 0 0 1-10 0c0-2 1-3.300 2-4.500.2 1.500 1 2.300 2 2.500C11 8.500 11.300 5.500 12 3z" />;
    case 'judas':
      return <><Circle cx={9} cy={9.500} r={5} /><Path d="M14 6.800a5 5 0 1 1-3 8.700" /><Path d="M9 7.500v4M7.600 9.500h2.800" /></>;
  }
}

export function RoleIcon({ name, size = 34, color }: { name: IconKey; size?: number; color: string }): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {glyph(name, color)}
    </Svg>
  );
}
