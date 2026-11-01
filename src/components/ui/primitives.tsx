import React, { useState } from 'react';
import {
  Pressable, Text, TextInput, View, type StyleProp, type TextInputProps, type TextStyle, type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

type Tone = 'default' | 'muted' | 'gold' | 'red';

export function AppText({ children, tone = 'default', size = 16, bold, title, center, style, ...rest }: {
  children: React.ReactNode; tone?: Tone; size?: number; bold?: boolean; title?: boolean; center?: boolean;
  style?: StyleProp<TextStyle>; numberOfLines?: number; selectable?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const color = tone === 'muted' ? colors.muted : tone === 'gold' ? colors.goldSoft : tone === 'red' ? colors.red : colors.text;
  return (
    <Text {...rest} style={[{ color, fontSize: size, fontFamily: title ? fonts.title : bold ? fonts.bold : fonts.body, textAlign: center ? 'center' : 'left', lineHeight: Math.round(size * 1.4) }, style]}>
      {children}
    </Text>
  );
}

export function Button({ label, onPress, variant = 'primary', disabled, small, style, accessibilityLabel }: {
  label: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'paper'; disabled?: boolean; small?: boolean;
  style?: StyleProp<ViewStyle>; accessibilityLabel?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.red : variant === 'paper' ? colors.paper : 'transparent';
  const fg = variant === 'paper' ? colors.ink : variant === 'ghost' ? colors.text : '#fff7e6';
  return (
    <Pressable
      onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{
        backgroundColor: bg, borderRadius: radius.sm, paddingVertical: small ? 8 : 14, paddingHorizontal: small ? 12 : 18,
        borderWidth: variant === 'ghost' ? 1 : 0, borderColor: colors.line, alignItems: 'center', justifyContent: 'center',
        minHeight: small ? 36 : 48, opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      }, style]}>
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: small ? 14 : 16, letterSpacing: 0.5 }}>{label}</Text>
    </Pressable>
  );
}

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }): React.JSX.Element {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radius.md, padding: space.lg }, style]}>{children}</View>;
}

/** Bloc repliable (remplace les <details> de l'original). */
export function Block({ title, summary, children, defaultOpen = false }: {
  title: string; summary?: string; children: React.ReactNode; defaultOpen?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Panel style={{ padding: 0 }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }}
        style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <AppText bold size={17}>{title}</AppText>
          {summary ? <AppText tone="muted" size={13}>{summary}</AppText> : null}
        </View>
        <Text style={{ color: colors.gold, fontSize: 18 }}>{open ? '−' : '+'}</Text>
      </Pressable>
      {open ? <View style={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md }}>{children}</View> : null}
    </Panel>
  );
}

export function Stepper({ label, value, min, max, onChange, hint }: {
  label: string; value: number; min: number; max: number; onChange: (n: number) => void; hint?: string;
}): React.JSX.Element {
  const { colors } = useTheme();
  const btn = (sym: string, delta: number, off: boolean): React.JSX.Element => (
    <Pressable onPress={() => onChange(value + delta)} disabled={off} accessibilityRole="button"
      accessibilityLabel={`${delta > 0 ? 'Augmenter' : 'Diminuer'} ${label}`}
      style={{ width: 40, height: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', opacity: off ? 0.35 : 1 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontFamily: fonts.bold }}>{sym}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <View style={{ flex: 1 }}>
        <AppText bold>{label}</AppText>
        {hint ? <AppText tone="muted" size={12}>{hint}</AppText> : null}
      </View>
      {btn('−', -1, value <= min)}
      <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontFamily: fonts.bold, fontSize: 20, minWidth: 28, textAlign: 'center' }}>{value}</Text>
      {btn('+', 1, value >= max)}
    </View>
  );
}

export function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
      <View style={{ width: 22, height: 22, borderRadius: radius.sm, borderWidth: 2, borderColor: value ? colors.red : colors.line, backgroundColor: value ? colors.red : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {value ? <Text style={{ color: '#fff7e6', fontSize: 14, lineHeight: 16 }}>✓</Text> : null}
      </View>
      <View style={{ flex: 1 }}>
        <AppText bold>{label}</AppText>
        {desc ? <AppText tone="muted" size={12}>{desc}</AppText> : null}
      </View>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }}
      style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: selected ? colors.gold : colors.line, backgroundColor: selected ? colors.gold : 'transparent' }}>
      <Text style={{ color: selected ? colors.ink : colors.text, fontFamily: fonts.bold, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label?: string }): React.JSX.Element {
  const { colors } = useTheme();
  const { label, style, ...rest } = props;
  return (
    <View style={{ gap: 4 }}>
      {label ? <AppText tone="muted" size={13}>{label}</AppText> : null}
      <TextInput
        accessibilityLabel={label} placeholderTextColor={colors.muted} {...rest}
        style={[{ borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, color: colors.text, fontFamily: fonts.body, fontSize: 16, backgroundColor: colors.bg }, style]} />
    </View>
  );
}

export function Notice({ level, children }: { level: 'warn' | 'info'; children: string }): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: level === 'warn' ? colors.red : colors.gold, paddingLeft: 10, paddingVertical: 2 }}>
      <AppText size={13} tone={level === 'warn' ? 'default' : 'muted'}>{`${level === 'warn' ? '⚠ ' : 'ℹ '}${children}`}</AppText>
    </View>
  );
}
