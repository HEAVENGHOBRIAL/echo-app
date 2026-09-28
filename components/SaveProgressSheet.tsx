// Bottom sheet "Sauvegarde ta progression" (écran 12, mode invité)
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { fonts, layout, radius, spacing, typography } from '@/theme';

type Props = {
  visible: boolean;
  reviewedCount: number;
  onCreateAccount: () => void;
  onClose: () => void;
};

export function SaveProgressSheet({ visible, reviewedCount, onCreateAccount, onClose }: Props) {
  const styles = useStyles();
  const t = useT();
  const insets = useSafeAreaInsets();
  const perks = [t.sheet.perkCards(reviewedCount), t.sheet.perkStreak, t.sheet.perkDevices];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {/* Toucher le fond sombre ferme la fenêtre */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={t.sheet.close}
          accessibilityRole="button"
        />

        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 22 }]}
          role="dialog"
          aria-modal
          aria-labelledby="save-sheet-title"
        >
          <View style={styles.handle} aria-hidden />
          <View style={styles.icons} aria-hidden>
            <View style={[styles.mini, styles.miniBackend]} />
            <View style={[styles.mini, styles.miniFrontend]} />
            <View style={[styles.mini, styles.miniJs]} />
          </View>

          <Text nativeID="save-sheet-title" role="heading" aria-level={2} style={styles.title}>
            {t.sheet.title}
          </Text>
          <Text style={styles.text}>{t.sheet.text}</Text>

          <View style={styles.perks}>
            {perks.map((p) => (
              <View key={p} style={styles.perk}>
                <View style={styles.check} aria-hidden>
                  <Text style={styles.checkText}>✓</Text>
                </View>
                <Text style={styles.perkText}>{p}</Text>
              </View>
            ))}
          </View>

          <Button label={t.sheet.create} onPress={onCreateAccount} />
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t.sheet.later}
            style={({ focused, pressed }: PressState) => [
              styles.later,
              pressed && styles.laterPressed,
              focused && focusStyles.ring,
            ]}
          >
            <Text style={styles.laterText}>{t.sheet.later}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: c.backdrop },
  sheet: {
    width: '100%',
    maxWidth: layout.maxContentWidth + 48,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 14,
    paddingTop: 12,
    paddingHorizontal: spacing.lg,
    backgroundColor: c.bg.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.border },
  icons: { flexDirection: 'row', marginTop: spacing.xs },
  mini: { width: 44, height: 56, borderRadius: 12, borderWidth: 3, borderColor: c.bg.surface, marginRight: -10 },
  miniBackend: { backgroundColor: c.track.backend },
  miniFrontend: { backgroundColor: c.track.frontend },
  miniJs: { backgroundColor: c.track.js, marginRight: 0 },
  title: { ...typography.h1, color: c.text.primary, textAlign: 'center' },
  text: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
  perks: { width: '100%', gap: 10 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.feedback.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontFamily: fonts.semibold, fontSize: 12, color: c.feedback.successText },
  perkText: { ...typography.body, color: c.text.primary, flexShrink: 1 },
  later: { width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  laterPressed: { backgroundColor: c.bg.subtle },
  laterText: { ...typography.label, color: c.brand.primary },
}));
