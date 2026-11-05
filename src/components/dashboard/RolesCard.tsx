import React from 'react';
import { View } from 'react-native';
import { maxImpostors, plural, type GameSettings } from '@/domain';
import { ESPION_DESC, MR_WHITE_DESC, ROLE_CATALOG } from '@/features/roleCatalog';
import { CIVIL_DESC, SHORT_LABEL, UNDERCOVER_DESC, TONE, type IconKey, type Tone } from '@/features/roleMeta';
import { useSettingsActions } from '@/state/settings';
import { AppText } from '../ui/primitives';
import { DashCard } from './DashCard';
import { impostorTeamSize } from './CompositionGauge';
import { CountToken, SpecialToken } from './RoleToken';

export interface RoleInfo { readonly icon: IconKey; readonly title: string; readonly desc: string; readonly tone: Tone }

const Sub = ({ children, right }: { children: string; right?: string }): React.JSX.Element => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
    <AppText bold size={14.5}>{children}</AppText>
    {right ? <AppText tone="muted" size={11.5}>{right}</AppText> : null}
  </View>
);

/** Rôles classiques (effectifs) puis rôles spéciaux (à activer), comme dans le modèle. */
export function RolesCard({ settings: s, onInfo }: { settings: GameSettings; onInfo: (r: RoleInfo) => void }): React.JSX.Element {
  const a = useSettingsActions();
  const cap = maxImpostors(s.playerCount);
  const civils = Math.max(0, s.playerCount - impostorTeamSize(s));
  const info = (icon: IconKey, title: string, desc: string): void => onInfo({ icon, title, desc, tone: TONE[icon] });
  const activeCount = ROLE_CATALOG.filter((r) => s.roles[r.key]).length;
  return (
    <DashCard>
      <Sub>Rôles classiques</Sub>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start' }}>
        <CountToken fixed icon="civil" short="Civils" value={civils} min={0} max={99} onInfo={() => info('civil', 'Civils', CIVIL_DESC)} />
        <CountToken icon="undercover" short="Undercover" value={s.undercoverCount} min={1} max={Math.max(1, cap - s.mrWhiteCount - s.espionCount)}
          onChange={(n) => a.setCount('undercoverCount', n)} onInfo={() => info('undercover', 'Undercover', UNDERCOVER_DESC)} />
        <CountToken icon="mrwhite" short="Mr. White" value={s.mrWhiteCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.espionCount)}
          onChange={(n) => a.setCount('mrWhiteCount', n)} onInfo={() => info('mrwhite', 'Mr. White', MR_WHITE_DESC)} />
        <CountToken icon="espion" short="Espion" value={s.espionCount} min={0} max={Math.max(0, cap - s.undercoverCount - s.mrWhiteCount)}
          onChange={(n) => a.setCount('espionCount', n)} onInfo={() => info('espion', 'Espion', ESPION_DESC)} />
      </View>
      <Sub right={activeCount ? `${activeCount} ${plural(activeCount, 'activé', 'activés')}` : 'Aucun activé'}>Rôles spéciaux</Sub>
      <AppText tone="muted" size={11.5}>Un joueur ne reçoit qu'un seul rôle spécial. Touchez un rôle pour l'activer, « ? » pour son explication.</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'flex-start' }}>
        {ROLE_CATALOG.map((r) => (
          <SpecialToken key={r.key} icon={r.key} label={r.label} short={SHORT_LABEL[r.key]} active={s.roles[r.key]}
            onToggle={() => a.toggleRole(r.key)} onInfo={() => info(r.key, r.label, r.desc)} />
        ))}
      </View>
    </DashCard>
  );
}
