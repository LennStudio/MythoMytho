import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
import { AppText } from './primitives';

/** Fenêtre modale unique (carte, confirmation, annonce, sélecteurs…). */
export function ModalSheet({ visible, title, onClose, children, paper }: {
  visible: boolean; title?: string; onClose?: () => void; children: React.ReactNode; paper?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? (() => undefined)} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Pressable onPress={onClose} accessibilityLabel="Fermer" style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: space.lg }}>
        <Pressable onPress={() => undefined} accessible={false}
          style={{ alignSelf: 'center', width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: paper ? colors.paper : colors.panel, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line }}>
          <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.md }} keyboardShouldPersistTaps="handled">
            {title ? <AppText title size={26} style={paper ? { color: colors.ink } : undefined}>{title}</AppText> : null}
            <View style={{ gap: space.md }}>{children}</View>
          </ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
