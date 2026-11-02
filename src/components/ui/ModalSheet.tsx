import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius } from '@/theme/tokens';
import { AppText, Kicker } from './primitives';

/**
 * Fenêtre modale unique. `paper` : carte secrète (papier + tampon « confidentiel »).
 * Sinon : panneau sombre/clair avec petit libellé (`kicker`) et titre en Sirelia.
 */
export function ModalSheet({ visible, title, kicker, onClose, children, paper, stamp, center }: {
  visible: boolean; title?: string; kicker?: string; onClose?: () => void; children: React.ReactNode;
  paper?: boolean; stamp?: string; center?: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose ?? (() => undefined)} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} accessibilityLabel="Fermer" style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', padding: 20 }}>
          <Pressable onPress={() => undefined} accessible={false}
            style={{
              alignSelf: 'center', width: '100%', maxWidth: 440, maxHeight: '90%', borderRadius: radius.md, borderWidth: 1,
              backgroundColor: paper ? colors.paper : colors.panel, borderColor: paper ? colors.paperShade : colors.line,
              boxShadow: '0 24px 48px -16px rgba(0,0,0,0.6)',
            }}>
            <ScrollView contentContainerStyle={{ padding: 28, gap: 14, alignItems: center || paper ? 'center' : 'stretch' }} keyboardShouldPersistTaps="handled">
              {kicker ? <Kicker>{kicker}</Kicker> : null}
              {title ? <AppText title size={26} center={center || paper} style={paper ? { color: colors.ink } : undefined}>{title}</AppText> : null}
              <View style={{ gap: 14, alignSelf: 'stretch', alignItems: center || paper ? 'center' : 'stretch' }}>{children}</View>
            </ScrollView>
            {stamp ? (
              <View pointerEvents="none" style={{ position: 'absolute', top: 14, right: -10, borderWidth: 2, borderColor: colors.red, borderRadius: 3, paddingVertical: 3, paddingHorizontal: 8, opacity: 0.8, transform: [{ rotate: '8deg' }] }}>
                <Text style={{ color: colors.red, fontFamily: fonts.bold, fontSize: 10.2, letterSpacing: 2.9 }}>{stamp}</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
