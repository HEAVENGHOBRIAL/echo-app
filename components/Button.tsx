import { ActivityIndicator, Pressable, Text } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { makeStyles, useTheme } from '@/lib/theme';
import { radius, spacing, typography } from '@/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  // Phrase lue par le lecteur d'écran pour expliquer ce qui va se passer
  accessibilityHint?: string;
};

// Bouton du design system : "primary" (fond plein) ou "secondary" (contour).
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityHint,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      aria-disabled={inactive}
      aria-busy={loading}
      style={({ pressed, focused }: PressState) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        inactive && styles.inactive,
        focused && focusStyles.ring,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.text.onBrand : colors.brand.primary} />
      ) : (
        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  base: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    width: '100%',
  },
  primary: { backgroundColor: c.brand.primary },
  primaryPressed: { backgroundColor: c.brand.pressed },
  secondary: { backgroundColor: c.bg.surface, borderWidth: 1.5, borderColor: c.brand.primary },
  secondaryPressed: { backgroundColor: c.bg.subtle },
  inactive: { opacity: 0.6 },
  label: { ...typography.label, textAlign: 'center' },
  labelPrimary: { color: c.text.onBrand },
  labelSecondary: { color: c.brand.primary },
}));
