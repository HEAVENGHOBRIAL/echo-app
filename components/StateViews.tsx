import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import { spacing, typography } from '@/theme';

// Chargement en cours
export function Loading({ label }: { label?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useT();
  return (
    <View style={styles.box} role="status" aria-live="polite">
      <ActivityIndicator color={colors.brand.primary} size="large" />
      <Text style={styles.text}>{label ?? t.common.loading}</Text>
    </View>
  );
}

// Erreur de chargement avec bouton "Réessayer"
export function LoadError({ onRetry }: { onRetry: () => void }) {
  const styles = useStyles();
  const t = useT();
  return (
    <View style={styles.box} role="alert">
      <Text style={styles.title}>{t.common.loadErrorTitle}</Text>
      <Text style={styles.text}>{t.common.loadErrorText}</Text>
      <Button label={t.common.retry} variant="secondary" onPress={onRetry} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  box: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  title: { ...typography.h3, color: c.text.primary, textAlign: 'center' },
  text: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
}));
