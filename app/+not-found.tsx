import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/ui/primitives';

export default function NotFound(): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <AppText title size={32} center>Dossier introuvable</AppText>
      <Link href="/"><AppText tone="gold" bold>Retour à l'accueil</AppText></Link>
    </View>
  );
}
