import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { RULES_TEXT } from '@/features/roleCatalog';
import { promptInstall, watchInstallable } from '@/services/pwa';
import { useGame } from '@/state/game';
import { useSettings, useSettingsActions } from '@/state/settings';
import { ComfortCard } from '../dashboard/ComfortCard';
import { CompositionGauge } from '../dashboard/CompositionGauge';
import { PlayerTrack } from '../dashboard/PlayerTrack';
import { RoleInfoModal } from '../dashboard/RoleInfoModal';
import { RolesCard, type RoleInfo } from '../dashboard/RolesCard';
import { SeatsCard } from '../dashboard/SeatsCard';
import { LaunchBar, SummaryCard } from '../dashboard/SummaryCard';
import { ThemesCard } from '../dashboard/ThemesCard';
import { AppText, LinkButton } from '../ui/primitives';
import { Page, Screen } from '../ui/Screen';

/** Tableau de bord de configuration : deux colonnes sur grand écran, une colonne + barre de lancement sinon. */
export function SetupScreen(): React.JSX.Element {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 980;
  const { settings: s } = useSettings();
  const a = useSettingsActions();
  const { startGame } = useGame();
  const [names, setNames] = useState<readonly string[]>([]);
  const [installable, setInstallable] = useState(false);
  const [rules, setRules] = useState(false);
  const [info, setInfo] = useState<RoleInfo | null>(null);
  useEffect(() => watchInstallable(setInstallable), []);

  const start = (): void => { if (startGame(names)) router.push('/game'); };

  const main = (
    <View style={{ gap: 18, flex: wide ? 1.65 : undefined, width: wide ? undefined : '100%' }}>
      <PlayerTrack value={s.playerCount} onChange={a.setPlayers} />
      <CompositionGauge settings={s} />
      <RolesCard settings={s} onInfo={setInfo} />
    </View>
  );
  const side = (
    <View style={{ gap: 18, flex: wide ? 1 : undefined, width: wide ? undefined : '100%', minWidth: wide ? 340 : 0 }}>
      {wide ? <SummaryCard settings={s} names={names} onStart={start} /> : null}
      <ThemesCard settings={s} />
      <SeatsCard names={names} count={s.playerCount} onChange={setNames} />
      <ComfortCard settings={s} />
      {!wide ? <SummaryCard settings={s} names={names} onStart={start} /> : null}
    </View>
  );

  return (
    <Screen>
      <Page maxWidth={1120}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 16 }}>
          <AppText title size={24}>Nouvelle manche</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
            <LinkButton label="Journal des scores" onPress={() => router.push('/scores')} />
            {installable ? <LinkButton label="Installer l'app" onPress={() => { void promptInstall(); }} /> : null}
            <LinkButton label="Comment jouer" chevron open={rules} onPress={() => setRules((r) => !r)} />
          </View>
        </View>
        {rules ? <View style={{ marginBottom: 18 }}><AppText tone="muted" size={14.5} style={{ lineHeight: 23 }}>{RULES_TEXT}</AppText></View> : null}
        <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: 18 }}>
          {main}
          {side}
        </View>
      </Page>
      {!wide ? <LaunchBar settings={s} onStart={start} /> : null}
      <RoleInfoModal info={info} onClose={() => setInfo(null)} />
    </Screen>
  );
}
