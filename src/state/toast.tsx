import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';

type Show = (message: string) => void;
const Ctx = createContext<Show>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const show = useCallback<Show>((m) => {
    setMsg(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 3200);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {msg !== null && (
        <View accessibilityLiveRegion="polite"
          style={{ position: 'absolute', left: 16, right: 16, bottom: 28 + insets.bottom, alignItems: 'center', zIndex: 999, pointerEvents: 'none' }}>
          <View style={{ backgroundColor: colors.ink, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 14, maxWidth: 520 }}>
            <Text style={{ color: colors.paper, fontFamily: fonts.body, fontSize: 14, textAlign: 'center' }}>{msg}</Text>
          </View>
        </View>
      )}
    </Ctx.Provider>
  );
}
export const useToast = (): Show => useContext(Ctx);
