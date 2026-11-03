import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { AppProviders } from '@/state/AppProviders';
import { useTheme } from '@/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

function Shell(): React.JSX.Element {
  const { mode, colors } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game" options={{ gestureEnabled: false }} />
        <Stack.Screen name="scores" options={{ presentation: 'modal' }} />
        <Stack.Screen name="custom-pairs" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout(): React.JSX.Element | null {
  const [loaded, error] = useFonts({
    CourierPrime: require('../assets/fonts/CourierPrime-Regular.ttf'),
    'CourierPrime-Bold': require('../assets/fonts/CourierPrime-Bold.ttf'),
    'CourierPrime-Italic': require('../assets/fonts/CourierPrime-Italic.ttf'),
    // Sirelia sans ses 36 ligatures vides (« el », « ma », « er »… faisaient disparaître des lettres).
    Sirelia: require('../assets/fonts/SireliaFixed.otf'),
  });
  useEffect(() => { if (loaded || error) void SplashScreen.hideAsync(); }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <AppProviders>
      <Shell />
    </AppProviders>
  );
}
