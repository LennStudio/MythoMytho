import React from 'react';
import { View } from 'react-native';
import { ModalSheet } from '../ui/ModalSheet';
import { AppText, Button } from '../ui/primitives';
import { Disc } from './RoleToken';
import type { RoleInfo } from './RolesCard';

/** Explication d'un rôle (ouverte par la pastille « ? »). */
export function RoleInfoModal({ info, onClose }: { info: RoleInfo | null; onClose: () => void }): React.JSX.Element {
  return (
    <ModalSheet visible={info !== null} kicker="rôle" title={info?.title} center onClose={onClose}>
      {info ? <View style={{ alignItems: 'center' }}><Disc icon={info.icon} active /></View> : null}
      <AppText tone="muted" size={13.5} center style={{ lineHeight: 21 }}>{info?.desc ?? ''}</AppText>
      <Button center label="Compris" variant="ghost" onPress={onClose} />
    </ModalSheet>
  );
}
