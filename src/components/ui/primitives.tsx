import React, { useState } from 'react';
import {
  Pressable, Text, TextInput, View, useWindowDimensions, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';
import { titleRuns } from '@/theme/typography';

type Tone = 'default' | 'muted' | 'gold' | 'red';

export function AppText({ children, tone = 'default', size = 16, bold, title, center, style, ...rest }: {
  children: React.ReactNode; tone?: Tone; size?: number; bold?: boolean; title?: boolean; center?: boolean;
  style?: StyleProp<TextStyle>; numberOfLines?: number; selectable?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const color = tone === 'muted' ? colors.muted : tone === 'gold' ? colors.goldSoft : tone === 'red' ? colors.red : colors.text;
  // Police titre « Sirelia » : seules les lettres A–Z / a–z y sont dessinées (chiffres, accents et ponctuation sont
  // des glyphes vides, comme l'indiquait le `unicode-range` de l'ancienne version). On rend donc les suites de
  // lettres en Sirelia et le reste en Courier Prime.
  const runs = title && typeof children === 'string' ? titleRuns(children) : null;
  return (
    <Text {...rest}
      style={[{ color, fontSize: size, fontFamily: title ? fonts.body : bold ? fonts.bold : fonts.body, textAlign: center ? 'center' : 'left', lineHeight: Math.round(size * 1.4) }, style]}>
      {runs
        ? runs.map((r, i) => (r.letters
          ? <Text key={i} style={{ fontFamily: fonts.title }}>{r.text}</Text>
          : r.text))
        : children}
    </Text>
  );
}

const CREAM = '#fff7e6';

export function Button({ label, onPress, variant = 'primary', disabled, small, block, center, arrow, style, accessibilityLabel }: {
  label: string; onPress: () => void; variant?: 'primary' | 'ghost'; disabled?: boolean; small?: boolean; block?: boolean; center?: boolean;
  /** Ajoute la flèche « → » de l'original. */
  arrow?: boolean; style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{
        backgroundColor: primary ? colors.red : 'transparent', borderRadius: radius.sm,
        borderWidth: primary ? 0 : 1, borderColor: colors.gold,
        paddingVertical: small ? 8 : 13, paddingHorizontal: small ? 16 : 22, minHeight: small ? 38 : 46,
        alignItems: 'center', justifyContent: 'center', alignSelf: block ? 'stretch' : center ? 'center' : 'flex-start',
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      }, style]}>
      <Text style={{ color: primary ? CREAM : colors.gold, fontFamily: fonts.bold, fontSize: small ? 13 : 14.4, textAlign: 'center' }}>
        {label}{arrow ? '  →' : ''}
      </Text>
    </Pressable>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: space.lg }, style]}>{children}</View>;
}

const SHOW_FOLDER_TAB = false;

/** Panneau principal « dossier » : onglet en haut, bordure fine, grand padding. */
export function Dossier({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const pad = width < 600 ? 16 : Math.max(20, Math.min(36, width * 0.04));
  return (
    <View style={{ backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: pad }}>
      {/* Onglet décoratif de l'original (deux petits repères verticaux au bord haut). Retiré à la demande :
          passer SHOW_FOLDER_TAB à true pour le rétablir. */}
      {SHOW_FOLDER_TAB ? (
        <>
          <View style={{ position: 'absolute', top: 0, left: 24, width: 1, height: 9, backgroundColor: colors.line }} />
          <View style={{ position: 'absolute', top: 0, right: 24, width: 1, height: 9, backgroundColor: colors.line }} />
        </>
      ) : null}
      {children}
    </View>
  );
}

/** Lien discret doré (« Journal des scores », « Comment jouer »). */
export function LinkButton({ label, onPress, chevron, open }: { label: string; onPress: () => void; chevron?: boolean; open?: boolean }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={chevron ? { expanded: !!open } : undefined}
      style={{ paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 11.2, letterSpacing: 0.7 }}>{label}</Text>
      {chevron ? <Chevron open={!!open} size={6} color={colors.gold} /> : null}
    </Pressable>
  );
}

export function Chevron({ open, size = 7, color }: { open: boolean; size?: number; color: string }): React.JSX.Element {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRightWidth: 1.5, borderBottomWidth: 1.5, borderColor: color, transform: [{ rotate: open ? '-135deg' : '45deg' }, { translateY: open ? -1 : -2 }] }} />
    </View>
  );
}

/** Bloc numéroté en pointillés (1 à 5). `collapsible=false` : en-tête statique, contenu toujours visible. */
export function SetupBlock({ num, title, summary, children, collapsible = true, defaultOpen = false }: {
  num: number; title: string; summary?: string; children: React.ReactNode; collapsible?: boolean; defaultOpen?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = !collapsible || open;
  const head = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: collapsible ? 14 : 0, paddingHorizontal: collapsible ? 12 : 0 }}>
      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.gold, fontFamily: fonts.bold, fontSize: 14.4 }}>{num}</Text>
      </View>
      <AppText title size={17.6}>{title}</AppText>
      {collapsible && width >= 600 && summary ? (
        <Text numberOfLines={1} style={{ marginLeft: 'auto', flexShrink: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 10.9, textAlign: 'right' }}>{summary}</Text>
      ) : <View style={{ flex: 1 }} />}
      {collapsible ? <Chevron open={open} color={colors.muted} /> : null}
    </View>
  );
  return (
    <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, borderRadius: radius.md, marginBottom: 18, backgroundColor: colors.tint }}>
      {collapsible
        ? <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }}>{head}</Pressable>
        : <View style={{ paddingHorizontal: 12, paddingTop: 14 }}>{head}</View>}
      {isOpen ? <View style={{ paddingHorizontal: 12, paddingTop: 14, paddingBottom: 16, gap: 14 }}>{children}</View> : null}
    </View>
  );
}

/** Compteur en pilule : − valeur (+ plage) +. */
export function Counter({ label, a11y, value, min, max, onChange, range }: {
  label?: string; /** Libellé lu par les lecteurs d'écran quand aucun titre visible n'est affiché. */ a11y?: string;
  value: number; min: number; max: number; onChange: (n: number) => void; range?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const btn = (sym: string, delta: number, off: boolean): React.JSX.Element => (
    <Pressable onPress={() => onChange(value + delta)} disabled={off} accessibilityRole="button"
      accessibilityLabel={`${delta > 0 ? 'Ajouter' : 'Retirer'} ${a11y ?? label ?? ''}`.trim()}
      style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.4 : 1 }}>
      <Text style={{ color: colors.gold, fontSize: 17.6, fontFamily: fonts.body }}>{sym}</Text>
    </Pressable>
  );
  return (
    <View style={{ gap: 8, width: 178, alignSelf: 'flex-start' }}>
      {label ? <AppText bold size={17.6}>{label}</AppText> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 8 }}>
        {btn('−', -1, value <= min)}
        <View style={{ minWidth: 64, alignItems: 'center' }}>
          <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 24, lineHeight: 28 }}>{value}</Text>
          {range ? <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 9.6, letterSpacing: 1.3, marginTop: -2 }}>{range}</Text> : null}
        </View>
        {btn('+', 1, value >= max)}
      </View>
    </View>
  );
}

/** Case à cocher en carte : coche dorée quand actif, bordure et fond teintés. */
export function Toggle({ label, desc, value, onChange, disabled, radio }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean; radio?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} disabled={disabled} accessibilityRole={radio ? 'radio' : 'switch'} accessibilityState={{ checked: value, disabled: !!disabled }}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: value ? 'rgba(182,146,78,0.08)' : colors.bg, borderWidth: 1, borderColor: value ? colors.gold : colors.line, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, opacity: disabled ? 0.6 : 1 }}>
      <View style={{ marginTop: 2, width: 19, height: 19, borderRadius: radio ? 10 : 4, borderWidth: 1.5, borderColor: value ? colors.gold : colors.goldSoft, backgroundColor: value ? colors.gold : colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        {value && radio ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.ink }} /> : null}
        {value && !radio ? <View style={{ width: 5, height: 9, borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.ink, transform: [{ rotate: '38deg' }, { translateY: -1 }] }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 14.7 }}>{label}</Text>
        {desc ? <Text style={{ color: colors.muted, fontFamily: fonts.body, fontSize: 10.9, lineHeight: 16 }}>{desc}</Text> : null}
      </View>
    </Pressable>
  );
}

/** Choix exclusif en boutons (difficulté, masquage automatique…). */
export function Segmented<T extends string | number>({ options, value, onChange }: {
  options: ReadonlyArray<{ key: T; label: string }>; value: T; onChange: (v: T) => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable key={String(o.key)} onPress={() => onChange(o.key)} accessibilityRole="button" accessibilityState={{ selected: on }}
            style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.sm, borderWidth: 1, borderColor: on ? colors.gold : colors.line, backgroundColor: on ? colors.gold : colors.bg }}>
            <Text style={{ color: on ? colors.ink : colors.text, fontFamily: fonts.bold, fontSize: 12.5 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ label }: { label: string }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, paddingVertical: 4, paddingHorizontal: 12 }}>
      <Text style={{ color: colors.inkSoft, fontFamily: fonts.body, fontSize: 10.9, letterSpacing: 0.4 }}>{label}</Text>
    </View>
  );
}

export function Field(props: TextInputProps & { label?: string }): React.JSX.Element {
  const { colors } = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 5 }}>
      {label ? <AppText tone="muted" size={12}>{label}</AppText> : null}
      <TextInput
        accessibilityLabel={label} placeholderTextColor={colors.muted} {...rest}
        style={[{ borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, color: colors.text, fontFamily: fonts.body, fontSize: 15, backgroundColor: colors.bg }, style]} />
    </View>
  );
}

/** Ligne de l'encadré « Équilibrage » : pastille ronde dorée / orange / verte. */
export function Notice({ level, children }: { level: 'warn' | 'info' | 'ok'; children: string }): React.JSX.Element {
  const { colors } = useTheme();
  const dot = level === 'warn' ? '#d9822b' : level === 'ok' ? '#5f9e5a' : colors.gold;
  return (
    <View style={{ paddingLeft: 18, marginBottom: 6 }}>
      <View style={{ position: 'absolute', left: 0, top: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} />
      <Text style={{ color: colors.text, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 19 }}>{children}</Text>
    </View>
  );
}

/** Petit libellé espacé en capitales dorées (« vote », « dernière chance »…). */
export function Kicker({ children }: { children: string }): React.JSX.Element {
  const { colors } = useTheme();
  return <Text style={{ color: colors.gold, fontFamily: fonts.body, fontSize: 10.4, letterSpacing: 2.6, textTransform: 'uppercase' }}>{children}</Text>;
}

/** Zone de texte d'aide à liseré latéral (consigne, bandeau). */
export function Callout({ children, accent = 'gold', tone = 'plain' }: { children: React.ReactNode; accent?: 'gold' | 'red' | 'green'; tone?: 'plain' | 'green' }): React.JSX.Element {
  const { colors } = useTheme();
  const line = accent === 'red' ? colors.red : accent === 'green' ? 'rgba(92,138,90,0.4)' : colors.goldSoft;
  return (
    <View style={tone === 'green'
      ? { borderWidth: 1, borderColor: 'rgba(92,138,90,0.4)', backgroundColor: 'rgba(92,138,90,0.12)', borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 14 }
      : { borderLeftWidth: 2, borderLeftColor: line, backgroundColor: colors.tint, paddingVertical: 12, paddingHorizontal: 14 }}>
      {children}
    </View>
  );
}
