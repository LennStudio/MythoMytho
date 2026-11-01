import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SetupScreen } from '@/components/setup/SetupScreen';

/** Écran de configuration. Raccourcis PWA conservés : /?action=scores et /?action=pairs. */
export default function Index(): React.JSX.Element {
  const { action } = useLocalSearchParams<{ action?: string }>();
  const router = useRouter();
  useEffect(() => {
    if (action === 'scores') router.replace('/scores');
    if (action === 'pairs') router.replace('/custom-pairs');
  }, [action, router]);
  return <SetupScreen />;
}
