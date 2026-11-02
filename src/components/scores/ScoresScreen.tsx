import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  FILTER_ALL, FILTER_NONE, ROLE_NAMES, buildCsv, buildScoreJson, computeStats, filterByGroup, groupNames,
  leaderboard, percent, plural, type RoleKey,
} from '@/domain';
import { exportText } from '@/services/files';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/toast';
import { useTheme } from '@/theme/ThemeProvider';
import { AppText, Button, Dossier, Segmented } from '../ui/primitives';
import { Page, Screen } from '../ui/Screen';

export function ScoresScreen(): React.JSX.Element {
  const router = useRouter();
  const toast = useToast();
  const { colors } = useTheme();
  const { scoreLog, clearScoreLog } = useLibrary();
  const [group, setGroup] = useState(FILTER_ALL);
  const [confirmClear, setConfirmClear] = useState(false);

  const entries = useMemo(() => filterByGroup(scoreLog, group), [scoreLog, group]);
  const stats = useMemo(() => computeStats(entries), [entries]);
  const board = useMemo(() => leaderboard(entries, stats), [entries, stats]);
  const groups = groupNames(scoreLog);
  const stamp = new Date().toISOString().slice(0, 10);

  const exportAs = (kind: 'csv' | 'json'): void => {
    if (entries.length === 0) return void toast('Rien à exporter pour le moment.');
    void (kind === 'csv'
      ? exportText(`mythomytho-scores-${stamp}.csv`, 'text/csv', buildCsv(entries))
      : exportText(`mythomytho-scores-${stamp}.json`, 'application/json', buildScoreJson(entries)));
  };

  const section = (title: string, children: React.ReactNode): React.JSX.Element => (
    <View style={{ gap: 6, marginBottom: 22 }}>
      <AppText title size={17.6} style={{ marginBottom: 4 }}>{title}</AppText>
      {children}
    </View>
  );
  const groupOptions = [{ key: FILTER_ALL, label: 'Tous' }, ...groups.map((g) => ({ key: g, label: g })), { key: FILTER_NONE, label: 'Sans groupe' }];

  return (
    <Screen>
      <Page>
        <Dossier>
          <AppText title size={24} style={{ marginBottom: 18 }}>Journal des scores</AppText>
          {scoreLog.length === 0 ? <AppText tone="muted" size={13}>Aucune manche enregistrée pour l'instant. Jouez une partie pour alimenter le journal.</AppText> : null}

          {groups.length > 0 ? <View style={{ marginBottom: 22 }}><Segmented<string> options={groupOptions} value={group} onChange={setGroup} /></View> : null}

          {board.length > 0 ? section('Classement des joueurs', board.map((r, i) => (
            <AppText key={r.name} size={13.5}>
              {`${i + 1}. ${r.name} — ${r.wins} victoire${r.wins > 1 ? 's' : ''}`}
              {r.stat ? ` · ${percent(r.stat.wins, r.stat.games)} % sur ${r.stat.games} ${plural(r.stat.games, 'manche', 'manches')} · série max ${r.stat.best}` : ''}
            </AppText>
          ))) : null}

          {Object.keys(stats.byRole).length > 0 ? section('Taux de victoire par role', Object.entries(stats.byRole).map(([role, v]) => (
            <AppText key={role} size={13.5}>{`${ROLE_NAMES[role as RoleKey] ?? role} — ${percent(v.wins, v.games)} % (${v.games})`}</AppText>
          ))) : null}

          {Object.keys(stats.lies).length > 0 ? section('Mensonges du Mytho', Object.entries(stats.lies).map(([name, v]) => (
            <AppText key={name} size={13.5}>{`${name} — ${percent(v.passed, v.games)} % passés inaperçus (${v.passed}/${v.games})`}</AppText>
          ))) : null}

          {Object.keys(stats.missions).length > 0 ? section("Missions d'Hercule", Object.entries(stats.missions).map(([name, v]) => (
            <AppText key={name} size={13.5}>{`${name} — ${percent(v.success, v.games)} % accomplies (${v.success}/${v.games})`}</AppText>
          ))) : null}

          {entries.length > 0 ? section('Historique des manches', entries.slice(0, 50).map((e) => (
            <AppText key={e.date + e.round} size={12} tone="muted">
              {`${new Date(e.date).toLocaleDateString('fr-FR')} · manche ${e.round} · ${e.playerCount} joueurs · ${e.winnerLabel}${e.group ? ` · ${e.group}` : ''}`}
            </AppText>
          ))) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 18, borderTopWidth: 1, borderStyle: 'dashed', borderColor: colors.line }}>
            <Button variant="ghost" label="Exporter en CSV" onPress={() => exportAs('csv')} />
            <Button variant="ghost" label="Exporter en JSON" onPress={() => exportAs('json')} />
            {scoreLog.length > 0 ? (
              <Button variant="ghost" label={confirmClear ? 'Confirmer la suppression' : 'Réinitialiser le journal'}
                onPress={() => { if (confirmClear) { clearScoreLog(); setConfirmClear(false); } else setConfirmClear(true); }} />
            ) : null}
          </View>
          <View style={{ marginTop: 18 }}><Button arrow label="Fermer" onPress={() => router.back()} /></View>
        </Dossier>
      </Page>
    </Screen>
  );
}
