import React, { useState } from 'react';
import { View } from 'react-native';
import { MAX_GROUP_NAME, MAX_PLAYER_NAME, findGroup, type GroupDef } from '@/domain';
import { useLibrary } from '@/state/library';
import { useSettingsActions } from '@/state/settings';
import { useToast } from '@/state/toast';
import { AppText, Button, Field, Segmented, SetupBlock } from '../ui/primitives';

export function NamesBlock({ names, count, onChange }: {
  names: readonly string[]; count: number; onChange: (n: readonly string[]) => void;
}): React.JSX.Element {
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
    <SetupBlock num={4} title="Noms des joueurs" summary="Optionnel">
      <AppText bold size={15}>Groupes de joueurs</AppText>
      {groups.length > 0 ? (
        <Segmented<string> options={groups.map((g) => ({ key: g.id, label: g.name }))} value={current?.id ?? ''} onChange={(id) => { const g = groups.find((x) => x.id === id); if (g) load(g); }} />
      ) : (
        <AppText tone="muted" size={11.5}>Aucun groupe enregistré. Saisissez les noms ci-dessous, donnez un nom au groupe (« Famille », « Soirée du samedi »…) puis enregistrez-le pour le recharger en un tap.</AppText>
      )}
      <Field label="Nom du groupe" value={groupName} onChangeText={setGroupName} maxLength={MAX_GROUP_NAME} placeholder="Ex. Famille" />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Button small variant="ghost" label="Enregistrer les noms" onPress={save} />
        {current ? <Button small variant="ghost" label="Supprimer le groupe" onPress={() => deleteGroup(current.id)} /> : null}
      </View>
      {filled.map((n, i) => (
        <Field key={i} label={`Joueur ${i + 1}`} value={n} placeholder={`Joueur ${i + 1}`} maxLength={MAX_PLAYER_NAME}
          onChangeText={(t: string) => onChange(filled.map((x, j) => (j === i ? t : x)))} />
      ))}
      <AppText tone="muted" size={11.5}>Laissez un champ vide pour garder le nom par défaut « Joueur ».</AppText>
    </SetupBlock>
  );
}
