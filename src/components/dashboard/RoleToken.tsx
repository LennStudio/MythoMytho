import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { TONE, type IconKey, type Tone } from '@/features/roleMeta';
import { useTheme } from '@/theme/ThemeProvider';
import { alpha } from '@/theme/color';
import { fonts } from '@/theme/tokens';
import { RoleIcon } from './RoleIcon';

export const DISC = 72;
/** Largeur de cellule commune à tous les jetons : la grille affiche au plus 5 jetons par ligne. */
export const CELL = 112;

function toneColor(tone: Tone, c: { civil: string; red: string; gold: string }): string {
  return tone === 'civil' ? c.civil : tone === 'impostor' ? c.red : c.gold;
}

/** Disque du rôle : teinté et cerclé quand actif, éteint sinon. */
export function Disc({ icon, active }: { icon: IconKey; active: boolean }): React.JSX.Element {
  const { colors } = useTheme();
  const tone = toneColor(TONE[icon], colors);
  return (
    <View style={{
      width: DISC, height: DISC, borderRadius: DISC / 2, alignItems: 'center', justifyContent: 'center',
      backgroundColor: active ? alpha(tone, 0.28) : 'rgba(128,128,128,0.10)',
      borderWidth: 2, borderColor: active ? tone : 'transparent',
      boxShadow: active ? `0 0 22px -6px ${tone}` : 'none',
    }}>
      <RoleIcon name={icon} size={36} color={active ? colors.text : colors.muted} />
    </View>
  );
}

function Round({ label, onPress, bg, fg, glyph, size = 30, disabled }: {
  label: string; onPress: () => void; bg: string; fg: string; glyph: string; size?: number; disabled?: boolean;
}): React.JSX.Element {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : pressed ? 0.8 : 1, boxShadow: '0 3px 8px rgba(0,0,0,0.35)' })}>
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: size * 0.58, lineHeight: size * 0.7 }}>{glyph}</Text>
    </Pressable>
  );
}

function InfoBadge({ label, onPress }: { label: string; onPress: () => void }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Aide : ${label}`} hitSlop={8}
      style={{ position: 'absolute', top: 0, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
      <Text style={{ color: colors.ink, fontFamily: fonts.bold, fontSize: 12.5 }}>?</Text>
    </Pressable>
  );
}

const Caption = ({ children, active }: { children: string; active?: boolean }): React.JSX.Element => {
  const { colors } = useTheme();
  return <Text numberOfLines={2} style={{ color: active === false ? colors.muted : colors.text, fontFamily: fonts.body, fontSize: 11.5, textAlign: 'center', marginTop: 6, maxWidth: CELL - 8 }}>{children}</Text>;
};

/** Rôle spécial : toucher le disque (ou le bouton) l'active ; « ? » ouvre son explication. */
export function SpecialToken({ icon, label, short, active, onToggle, onInfo }: {
  icon: IconKey; label: string; short: string; active: boolean; onToggle: () => void; onInfo: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ width: CELL, alignItems: 'center' }}>
      <View style={{ width: DISC + 16, alignItems: 'center' }}>
        <Pressable onPress={onToggle} accessibilityRole="switch" accessibilityLabel={label} accessibilityState={{ checked: active }}>
          <Disc icon={icon} active={active} />
        </Pressable>
        <InfoBadge label={label} onPress={onInfo} />
      </View>
      <View style={{ marginTop: -14 }}>
        <Round label={active ? `Retirer ${short}` : `Ajouter ${short}`} onPress={onToggle} size={30}
          bg={active ? '#e5544a' : colors.gold} fg={active ? '#fff' : colors.ink} glyph={active ? '✕' : '+'} />
      </View>
      <Caption active={active}>{short}</Caption>
    </View>
  );
}

/** Rôle à effectif : − / + de part et d'autre du disque, nombre en pastille dessous. */
export function CountToken({ icon, short, value, min, max, onChange, onInfo, fixed }: {
  icon: IconKey; short: string; value: number; min: number; max: number; onChange?: (n: number) => void; onInfo: () => void; fixed?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const tone = toneColor(TONE[icon], colors);
  return (
    <View style={{ width: CELL, alignItems: 'center' }}>
      <View style={{ width: CELL, height: DISC, alignItems: 'center', justifyContent: 'center' }}>
        <Disc icon={icon} active={value > 0} />
        <InfoBadge label={short} onPress={onInfo} />
        {!fixed && onChange ? (
          <>
            <View style={{ position: 'absolute', left: (CELL - DISC) / 2 - 14, top: DISC - 36 }}>
              <Round label={`Retirer ${short}`} onPress={() => onChange(value - 1)} disabled={value <= min} bg={colors.gold} fg={colors.ink} glyph="−" />
            </View>
            <View style={{ position: 'absolute', right: (CELL - DISC) / 2 - 14, top: DISC - 36 }}>
              <Round label={`Ajouter ${short}`} onPress={() => onChange(value + 1)} disabled={value >= max} bg={colors.gold} fg={colors.ink} glyph="+" />
            </View>
          </>
        ) : null}
      </View>
      <View accessibilityLabel={`${value} ${short}`} style={{ marginTop: -14, minWidth: 32, height: 32, paddingHorizontal: 8, borderRadius: 16, backgroundColor: tone, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.panel }}>
        <Text accessibilityLiveRegion="polite" style={{ color: '#fff7e6', fontFamily: fonts.bold, fontSize: 15 }}>{value}</Text>
      </View>
      <Caption>{short}</Caption>
    </View>
  );
}
