import React, { useState } from 'react';
import { View } from 'react-native';
import { MAX_GROUP_NAME, MAX_PLAYER_NAME, findGroup, type GroupDef } from '@/domain';
import { dictationAvailable, startDictation } from '@/services/speech';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/toast';
import { AppText, Block, Button, Chip, Field } from '../ui/primitives';

export function NamesBlock({ names, count, onChange }: {
  names: readonly string[]; count: number; onChange: (n: readonly string[]) => void;
}): React.JSX.Element {
  const { groups, saveGroup, deleteGroup } = useLibrary();
  const toast = useToast();
  const [groupName, setGroupName] = useState('');
  const [listening, setListening] = useState(false);
  const filled = Array.from({ length: count }, (_, i) => names[i] ?? '');
  const current = findGroup(groups, filled.map((n) => n.trim()).filter(Boolean));

  const load = (g: GroupDef): void => onChange(g.players.slice(0, count));
  const save = (): void => {
    const list = filled.map((n) => n.trim()).filter(Boolean);
    if (!groupName.trim()) return toast('Donnez un nom au groupe.');
    if (list.length < 3) return toast('Un groupe compte au moins 3 joueurs nommés.');
    saveGroup(groupName, list); setGroupName(''); toast('Groupe enregistré.');
  };
  const dictate = (): void => {
    const stop = startDictation((t: string) => {
      onChange(t.split(/,|\bet\b/i).map((x) => x.trim()).filter(Boolean).slice(0, count));
    }, () => setListening(false));
    if (stop) setListening(true); else toast('Dictée vocale indisponible sur cet appareil.');
  };

  return (
    <Block title="Noms des joueurs" summary={current ? `Groupe « ${current.name} »` : 'Facultatif — « Joueur N » par défaut'}>
      {groups.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {groups.map((g) => <Chip key={g.id} label={g.name} selected={current?.id === g.id} onPress={() => load(g)} />)}
        </View>
      ) : null}
      {filled.map((n, i) => (
        <Field key={i} label={`Joueur ${i + 1}`} value={n} placeholder={`Joueur ${i + 1}`} maxLength={MAX_PLAYER_NAME}
          onChangeText={(t: string) => onChange(filled.map((x, j) => (j === i ? t : x)))} />
      ))}
      {dictationAvailable() ? <Button variant="ghost" small label={listening ? 'Écoute en cours…' : '🎤 Dicter les noms'} onPress={dictate} /> : null}
      <Field label="Enregistrer ces joueurs comme groupe" value={groupName} onChangeText={setGroupName} maxLength={MAX_GROUP_NAME} placeholder="Ex. Famille" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button small variant="ghost" label="Enregistrer" onPress={save} />
        {current ? <Button small variant="ghost" label="Supprimer le groupe" onPress={() => deleteGroup(current.id)} /> : null}
      </View>
      <AppText tone="muted" size={12}>Les groupes alimentent le journal : filtrez les scores par groupe.</AppText>
    </Block>
  );
}
