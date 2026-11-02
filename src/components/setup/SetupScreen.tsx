import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { checkBalance, balanceOk, plural } from '@/domain';
import { RULES_TEXT, ROLE_CATALOG } from '@/features/roleCatalog';
import { promptInstall, watchInstallable } from '@/services/pwa';
import { useGame } from '@/state/game';
import { useSettings } from '@/state/settings';
import { useTheme } from '@/theme/ThemeProvider';
import { useLibrary } from '@/state/library';
import { AppText, Button, Dossier, LinkButton, Notice, Pill } from '../ui/primitives';
import { Page, Screen } from '../ui/Screen';
import { ComfortBlock, PlayersBlock, RolesBlock, ThemesBlock } from './SetupBlocks';
import { NamesBlock } from './NamesBlock';

export function SetupScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { settings: s } = useSettings();
  const { startGame } = useGame();
  const { themes } = useLibrary();
  const [names, setNames] = useState<readonly string[]>([]);
  const [installable, setInstallable] = useState(false);
  const [rules, setRules] = useState(false);
  useEffect(() => watchInstallable(setInstallable), []);

  const items = checkBalance(s, names.slice(0, s.playerCount).map((n) => n.trim()));
  const start = (): void => { if (startGame(names)) router.push('/game'); };

  const themeCount = themes.filter((t) => s.selectedThemes[t.key]).length;
  const roleCount = ROLE_CATALOG.filter((r) => s.roles[r.key]).length;
  const pills = [
    `${s.playerCount} joueurs`,
    `${s.undercoverCount} Undercover${plural(s.undercoverCount, '', 's')}`,
    ...(s.mrWhiteCount > 0 ? [`${s.mrWhiteCount} Mr. White`] : []),
    ...(s.espionCount > 0 ? [`${s.espionCount} Espion${plural(s.espionCount, '', 's')}`] : []),
    themeCount ? `${themeCount} thème${plural(themeCount, '', 's')}` : 'aucun thème',
    ...(roleCount ? [`${roleCount} rôle${plural(roleCount, '', 's')} spécia${plural(roleCount, 'l', 'ux')}`] : []),
  ];

  return (
    <Screen>
      <Page>
        <Dossier>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 18 }}>
            <AppText title size={24}>Nouvelle manche</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
              <LinkButton label="Journal des scores" onPress={() => router.push('/scores')} />
              {installable ? <LinkButton label="Installer l'app" onPress={() => { void promptInstall(); }} /> : null}
              <LinkButton label="Comment jouer" chevron open={rules} onPress={() => setRules((r) => !r)} />
            </View>
          </View>
          {rules ? <View style={{ marginBottom: 22 }}><AppText tone="muted" size={14.7} style={{ lineHeight: 23 }}>{RULES_TEXT}</AppText></View> : null}

          <PlayersBlock />
          <ThemesBlock />
          <RolesBlock />
          <NamesBlock names={names} count={s.playerCount} onChange={setNames} />
          <ComfortBlock />

          <View style={{ marginTop: 0, marginBottom: 6, padding: 14, paddingBottom: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 4 }}>
            <AppText title size={12.8} tone="gold" style={{ letterSpacing: 1.8, marginBottom: 8 }}>EQUILIBRAGE</AppText>
            {items.length === 0
              ? <Notice level="ok">{balanceOk(s.playerCount)}</Notice>
              : items.map((i, k) => <Notice key={k} level={i.level}>{i.text}</Notice>)}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 20, marginTop: 4, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.line }}>
            {pills.map((p) => <Pill key={p} label={p} />)}
          </View>
          <View style={{ marginTop: 20 }}>
            <Button block arrow label="Lancer la manche" onPress={start} />
          </View>
        </Dossier>
      </Page>
    </Screen>
  );
}


