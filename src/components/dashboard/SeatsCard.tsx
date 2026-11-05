import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { MAX_GROUP_NAME, MAX_PLAYER_NAME, findGroup, type GroupDef } from '@/domain';
import { useLibrary } from '@/state/library';
import { useSettingsActions } from '@/state/settings';
import { useToast } from '@/state/toast';
import { useTheme } from '@/theme/ThemeProvider';
import { alpha } from '@/theme/color';
import { fonts } from '@/theme/tokens';
import { AppText, Button, Field, Segmented } from '../ui/primitives';
import { DashCard } from './DashCard';

/** Noms des joueurs : une place par joueur (pastille numérotée + champ), groupes enregistrables. */
export function SeatsCard({ names, count, onChange }: {
  names: readonly string[]; count: number; onChange: (n: readonly string[]) => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const { groups, saveGroup, deleteGroup } = useLibrary();
  const toast = useToast();
  const { setPlayers } = useSettingsActions();
  const [groupName, setGroupName] = useState('');
  const filled = Array.from({ length: count }, (_, i) => names[i] ?? '');
  const current = findGroup(groups, filled.map((n) => n.trim()).filter(Boolean));

  const load = (g: GroupDef): void => { setPlayers(g.players.length); onChange(g.players); };
  const save = (): void => {
    const list = filled.map((n) => n.trim()).filter(Boolean);
    if (!groupName.trim()) return toast('Donnez un nom au groupe.');
    if (list.length < 3) return toast('Un groupe compte au moins 3 joueurs nommés.');
    saveGroup(groupName, list); setGroupName(''); toast('Groupe enregistré.');
  };

  return (
    <DashCard title="Noms des joueurs" hint="Facultatif : un champ vide garde le nom par défaut « Joueur N ».">
      {groups.length > 0 ? (
        <Segmented<string> options={groups.map((g) => ({ key: g.id, label: g.name }))} value={current?.id ?? ''} onChange={(id) => { const g = groups.find((x) => x.id === id); if (g) load(g); }} />
      ) : (
        <AppText tone="muted" size={11.5}>Aucun groupe enregistré : saisissez les noms, nommez le groupe (« Famille », « Soirée du samedi »…) puis enregistrez-le pour le recharger en un tap.</AppText>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {filled.map((n, i) => (
          <View key={i} style={{ flexGrow: 1, flexBasis: 150, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: alpha(colors.gold, 0.16), borderWidth: 1, borderColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.gold, fontFamily: fonts.bold, fontSize: 12 }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Field accessibilityLabel={`Nom du joueur ${i + 1}`} value={n} placeholder={`Joueur ${i + 1}`} maxLength={MAX_PLAYER_NAME}
                onChangeText={(t: string) => onChange(filled.map((x, j) => (j === i ? t : x)))} style={{ paddingVertical: 8, borderRadius: 10 }} />
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ flex: 1, minWidth: 140 }}>
          <Field accessibilityLabel="Nom du groupe" value={groupName} onChangeText={setGroupName} maxLength={MAX_GROUP_NAME} placeholder="Nom du groupe (ex. Famille)" style={{ paddingVertical: 8, borderRadius: 10 }} />
        </View>
        <Button small variant="ghost" label="Enregistrer les noms" onPress={save} />
        {current ? <Button small variant="ghost" label="Supprimer le groupe" onPress={() => deleteGroup(current.id)} /> : null}
      </View>
    </DashCard>
  );
}
