import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  DIFFICULTY_LABELS, MAX_CUSTOM_PAIRS, MAX_WORD_LENGTH, addCustomPair, buildPairsExport, decodeShared, encodeShared,
  mergeCustomPairs, parsePairsImport, type Difficulty,
} from '@/domain';
import { canPickFile, exportText, pickTextFile, shareLink, webLocation } from '@/services/files';
import { useLibrary } from '@/state/library';
import { useToast } from '@/state/toast';
import { AppText, Button, Dossier, Field, Panel, Segmented } from '../ui/primitives';
import { Page, Screen } from '../ui/Screen';

const MESSAGES = { invalid: 'Paire invalide : deux mots différents de 40 caractères maximum.', duplicate: 'Cette paire existe déjà.', full: `Limite de ${MAX_CUSTOM_PAIRS} paires atteinte.` } as const;

export function CustomPairsScreen(): React.JSX.Element {
  const router = useRouter();
  const toast = useToast();
  const { customPairs, setCustomPairs, loaded } = useLibrary();
  const { import: importCode } = useLocalSearchParams<{ import?: string }>();
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [diff, setDiff] = useState<Difficulty>(2);
  const [pasted, setPasted] = useState('');

  const merge = (incoming: readonly unknown[]): void => {
    const r = mergeCustomPairs(customPairs, incoming);
    setCustomPairs(r.pairs);
    toast(`${r.added} paire(s) ajoutée(s), ${r.ignored} ignorée(s).`);
  };

  // Lien de partage : /custom-pairs?import=<code> (ou l'ancien #paires=<code> côté web).
  useEffect(() => {
    if (!loaded) return;
    const hash = webLocation()?.hash ?? '';
    const code = importCode ?? (hash.startsWith('#paires=') ? hash.slice(8) : '');
    if (!code) return;
    const pairs = decodeShared(code);
    if (pairs) merge(pairs); else toast('Lien de partage invalide.');
    router.setParams({ import: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, importCode]);

  const add = (): void => {
    const r = addCustomPair(customPairs, a, b, diff);
    if (!r.ok) return void toast(MESSAGES[r.reason]);
    setCustomPairs(r.pairs); setA(''); setB('');
  };
  const importPasted = (): void => {
    const data = parsePairsImport(pasted);
    if (!data) return void toast('Fichier ou texte non reconnu.');
    merge(data); setPasted('');
  };

  return (
    <Screen>
      <Page>
        <Dossier>
          <AppText title size={24} style={{ marginBottom: 6 }}>Mes paires</AppText>
          <AppText tone="muted" size={12.5} style={{ marginBottom: 18 }}>{`${customPairs.length}/${MAX_CUSTOM_PAIRS} paires personnalisées. Elles forment le thème « Mes paires ».`}</AppText>
          <View style={{ gap: 12, marginBottom: 18 }}>
            <Field label="Mot des Civils" value={a} onChangeText={setA} maxLength={MAX_WORD_LENGTH} />
            <Field label="Mot de l'Undercover" value={b} onChangeText={setB} maxLength={MAX_WORD_LENGTH} />
            <Segmented<Difficulty> options={([1, 2, 3] as const).map((d) => ({ key: d, label: DIFFICULTY_LABELS[d] }))} value={diff} onChange={setDiff} />
            <Button arrow label="Ajouter la paire" onPress={add} />
          </View>

          {customPairs.length > 0 ? (
            <Panel style={{ gap: 8, marginBottom: 18 }}>
              {customPairs.map((p, i) => (
                <View key={`${p[0]}${p[1]}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <AppText size={13} style={{ flex: 1 }}>{`${p[0]} / ${p[1]} · ${DIFFICULTY_LABELS[p[2]]}`}</AppText>
                  <Button small variant="ghost" label="Supprimer" onPress={() => setCustomPairs(customPairs.filter((_, j) => j !== i))} />
                </View>
              ))}
            </Panel>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Button variant="ghost" label="Exporter" onPress={() => void exportText('mythomytho-paires.json', 'application/json', buildPairsExport(customPairs))} disabled={customPairs.length === 0} />
            <Button variant="ghost" label="Copier un lien de partage" disabled={customPairs.length === 0}
              onPress={() => { void shareLink(`${webLocation() ? `${webLocation()?.origin ?? ''}/` : 'mythomytho://'}custom-pairs?import=${encodeShared(customPairs)}`).then(() => toast('Lien prêt à partager.')); }} />
            {canPickFile ? (
              <Button variant="ghost" label="Importer un fichier" onPress={() => { void pickTextFile('.json,application/json').then((t) => {
                const data = t ? parsePairsImport(t) : null;
                if (data) merge(data); else if (t !== null) toast('Fichier non reconnu.');
              }); }} />
            ) : null}
          </View>
          {!canPickFile ? (
            <View style={{ gap: 8, marginTop: 14 }}>
              <Field label="Coller un export JSON" value={pasted} onChangeText={setPasted} multiline numberOfLines={4} autoCapitalize="none" />
              <Button small variant="ghost" label="Importer" onPress={importPasted} disabled={!pasted.trim()} />
            </View>
          ) : null}
          <View style={{ marginTop: 18 }}><Button arrow label="Fermer" onPress={() => router.back()} /></View>
        </Dossier>
      </Page>
    </Screen>
  );
}
