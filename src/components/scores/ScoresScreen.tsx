import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  FILTER_ALL, FILTER_NONE, ROLE_NAMES, buildCsv, buildScoreJson, computeStats, filterByGroup, groupNames,
  leaderboard, percent, type RoleKey,
} from '@/domain';
import { exportText } from '@/services/files';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/toast';
import { useTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';
import { AppText, Button, Chip, Panel } from '../ui/primitives';

export function ScoresScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: space.lg, gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center', paddingBottom: 48 }}>
      <AppText title size={32}>Journal des scores</AppText>
      {scoreLog.length === 0 ? <AppText tone="muted">Aucune manche enregistrée pour l'instant. Jouez une partie pour alimenter le journal.</AppText> : null}

      {groups.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label="Tous" selected={group === FILTER_ALL} onPress={() => setGroup(FILTER_ALL)} />
          {groups.map((g) => <Chip key={g} label={g} selected={group === g} onPress={() => setGroup(g)} />)}
          <Chip label="Sans groupe" selected={group === FILTER_NONE} onPress={() => setGroup(FILTER_NONE)} />
        </View>
      ) : null}

      {board.length > 0 ? (
        <Panel style={{ gap: 6 }}>
          <AppText bold>Classement</AppText>
          {board.map((r, i) => (
            <AppText key={r.name} size={14}>
              {`${i + 1}. ${r.name} — ${r.wins} victoire${r.wins > 1 ? 's' : ''}`}
              {r.stat ? ` · ${percent(r.stat.wins, r.stat.games)} % sur ${r.stat.games} manches · série max ${r.stat.best}` : ''}
            </AppText>
          ))}
        </Panel>
      ) : null}

      {Object.keys(stats.byRole).length > 0 ? (
        <Panel style={{ gap: 6 }}>
          <AppText bold>Taux de victoire par rôle</AppText>
          {Object.entries(stats.byRole).map(([role, v]) => (
            <AppText key={role} size={14}>{`${ROLE_NAMES[role as RoleKey] ?? role} — ${percent(v.wins, v.games)} % (${v.games})`}</AppText>
          ))}
        </Panel>
      ) : null}

      {entries.length > 0 ? (
        <Panel style={{ gap: 6 }}>
          <AppText bold>Historique</AppText>
          {entries.slice(0, 50).map((e) => (
            <AppText key={e.date + e.round} size={13} tone="muted">
              {`${new Date(e.date).toLocaleDateString('fr-FR')} · manche ${e.round} · ${e.playerCount} joueurs · ${e.winnerLabel}${e.group ? ` · ${e.group}` : ''}`}
            </AppText>
          ))}
        </Panel>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Button small variant="ghost" label="Exporter CSV" onPress={() => exportAs('csv')} />
        <Button small variant="ghost" label="Exporter JSON" onPress={() => exportAs('json')} />
        {scoreLog.length > 0 ? (
          <Button small variant="ghost" label={confirmClear ? 'Confirmer la suppression' : 'Vider le journal'}
            onPress={() => { if (confirmClear) { clearScoreLog(); setConfirmClear(false); } else setConfirmClear(true); }} />
        ) : null}
      </View>
      <Button variant="ghost" label="Retour" onPress={() => router.back()} />
    </ScrollView>
  );
}
