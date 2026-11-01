import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { checkBalance, balanceOk } from '@/domain';
import { promptInstall, watchInstallable } from '@/services/pwa';
import { useGame } from '@/state/game';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { AppText, Button, Notice, Panel } from '../ui/primitives';
import { Screen } from '../ui/Screen';
import { ComfortBlock, PlayersBlock, RolesBlock, ThemesBlock } from './SetupBlocks';
import { NamesBlock } from './NamesBlock';

export function SetupScreen(): React.JSX.Element {
  const router = useRouter();
  const { mode, toggle } = useTheme();
  const { settings } = useSettings();
  const { startGame } = useGame();
  const [names, setNames] = useState<readonly string[]>([]);
  const [installable, setInstallable] = useState(false);
  useEffect(() => watchInstallable(setInstallable), []);
  const items = checkBalance(settings, names.slice(0, settings.playerCount).map((n) => n.trim()));

  const start = (): void => { if (startGame(names)) router.push('/game'); };

  return (
    <Screen>
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center', paddingBottom: 48 }}>
      <View style={{ alignItems: 'center', gap: 4, paddingVertical: space.lg }}>
        <AppText title size={44} center>MythoMytho</AppText>
        <AppText tone="gold" center>Dossier confidentiel · jeu de mots et de bluff</AppText>
      </View>
      <PlayersBlock />
      <ThemesBlock />
      <RolesBlock />
      <NamesBlock names={names} count={settings.playerCount} onChange={setNames} />
      <ComfortBlock />
      <Panel style={{ gap: 8 }}>
        <AppText bold>Équilibre</AppText>
        {items.length === 0 ? <AppText tone="muted" size={13}>{balanceOk(settings.playerCount)}</AppText>
          : items.map((i, k) => <Notice key={k} level={i.level}>{i.text}</Notice>)}
      </Panel>
      <Button label="Lancer la partie" onPress={start} />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button small variant="ghost" label="Scores" onPress={() => router.push('/scores')} />
        <Button small variant="ghost" label="Mes paires" onPress={() => router.push('/custom-pairs')} />
        {installable ? <Button small variant="ghost" label="Installer l'application" onPress={() => { void promptInstall(); }} /> : null}
        <Button small variant="ghost" label={mode === 'dark' ? 'Thème clair' : 'Thème sombre'} onPress={toggle} />
      </View>
    </ScrollView>
    </Screen>
  );
}
