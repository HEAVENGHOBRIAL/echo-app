import { Pressable, Text, View } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { makeStyles } from '@/lib/theme';
import { fonts, spacing, typography } from '@/theme';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | null;
};

// Case à cocher : toute la ligne (case + texte) est cliquable.
export function Checkbox({ label, checked, onChange, error }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => onChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        accessibilityLabel={label}
        accessibilityHint={error ?? undefined}
        style={({ focused }: PressState) => [styles.row, focused && focusStyles.ring]}
      >
        <View style={[styles.box, checked && styles.boxChecked, !!error && styles.boxError]}>
          {checked && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {!!error && (
        <Text style={styles.error} role="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrapper: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, borderRadius: 6 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: c.text.secondary,
    backgroundColor: c.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: c.brand.primary, borderColor: c.brand.primary },
  boxError: { borderColor: c.feedback.error, borderWidth: 2 },
  check: { fontFamily: fonts.semibold, fontSize: 13, color: c.text.onBrand },
  label: { ...typography.bodySmall, color: c.text.secondary, flexShrink: 1 },
  error: { ...typography.bodySmall, color: c.feedback.errorText },
}));
