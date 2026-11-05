import React from 'react';
import { View } from 'react-native';
import { balanceOk, checkBalance, plural, type GameSettings } from '@/domain';
import { ROLE_CATALOG } from '@/features/roleCatalog';
import { useLibrary } from '@/state/library';
import { AppText, Button, Notice, Pill } from '../ui/primitives';
import { DashCard } from './DashCard';
import { verdict } from './CompositionGauge';

/** Libellés récapitulatifs de la configuration (« 6 joueurs », « 1 Undercover », « 2 thèmes »…). */
export function useSummaryPills(s: GameSettings): string[] {
  const { themes } = useLibrary();
  const themeCount = themes.filter((t) => s.selectedThemes[t.key]).length;
  const roleCount = ROLE_CATALOG.filter((r) => s.roles[r.key]).length;
  return [
    `${s.playerCount} joueurs`,
    `${s.undercoverCount} Undercover${plural(s.undercoverCount, '', 's')}`,
    ...(s.mrWhiteCount > 0 ? [`${s.mrWhiteCount} Mr. White`] : []),
    ...(s.espionCount > 0 ? [`${s.espionCount} Espion${plural(s.espionCount, '', 's')}`] : []),
    themeCount ? `${themeCount} thème${plural(themeCount, '', 's')}` : 'aucun thème',
    ...(roleCount ? [`${roleCount} rôle${plural(roleCount, '', 's')} spécia${plural(roleCount, 'l', 'ux')}`] : []),
  ];
}

/** Résumé, avertissements d'équilibrage et bouton de lancement. */
export function SummaryCard({ settings: s, names, onStart }: { settings: GameSettings; names: readonly string[]; onStart: () => void }): React.JSX.Element {
  const pills = useSummaryPills(s);
  const items = checkBalance(s, names.slice(0, s.playerCount).map((n) => n.trim()));
  const v = verdict(s);
  return (
    <DashCard title="Prêt à jouer ?" right={<AppText bold size={12.5} tone={v.tone === 'impostor' ? 'red' : v.tone === 'civil' ? 'gold' : 'muted'}>{v.label}</AppText>}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{pills.map((p) => <Pill key={p} label={p} />)}</View>
      <View style={{ gap: 2 }}>
        {items.length === 0
          ? <Notice level="ok">{balanceOk(s.playerCount)}</Notice>
          : items.map((i, k) => <Notice key={k} level={i.level}>{i.text}</Notice>)}
      </View>
      <Button block arrow label="Lancer la manche" onPress={onStart} />
    </DashCard>
  );
}

/** Barre de lancement fixe (écrans étroits) : résumé court + bouton. */
export function LaunchBar({ settings: s, onStart }: { settings: GameSettings; onStart: () => void }): React.JSX.Element {
  const pills = useSummaryPills(s);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderColor: 'rgba(128,128,128,0.25)', backgroundColor: 'rgba(16,22,26,0.94)' }}>
      <AppText size={11.5} tone="muted" numberOfLines={2} style={{ flex: 1 }}>{pills.slice(0, 3).join(' · ')}</AppText>
      <Button arrow label="Lancer la manche" onPress={onStart} />
    </View>
  );
}
