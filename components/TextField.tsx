import { forwardRef, useId, useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { useT } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import { fonts, radius, spacing, typography } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  // Champ mot de passe : ajoute un bouton "Afficher / Masquer"
  password?: boolean;
};

// Champ de formulaire du design system (états : normal, focus, erreur).
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, password = false, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useT();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const labelId = useId();
  const hasError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text nativeID={labelId} style={[styles.label, hasError && styles.labelError]}>
        {label}
      </Text>

      <View style={[styles.field, focused && styles.fieldFocused, hasError && styles.fieldError]}>
        <TextInput
          ref={ref}
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={colors.text.muted}
          secureTextEntry={password && hidden}
          accessibilityLabel={label}
          aria-labelledby={labelId}
          // Le lecteur d'écran lit aussi le message d'erreur quand on arrive sur le champ
          accessibilityHint={error ?? undefined}
          aria-invalid={hasError}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />

        {password && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? t.common.showPassword : t.common.hidePassword}
            hitSlop={8}
            style={({ focused: f }: PressState) => [styles.toggle, f && focusStyles.ring]}
          >
            <Text style={styles.toggleText}>{hidden ? t.common.show : t.common.hide}</Text>
          </Pressable>
        )}
      </View>

      {hasError && (
        <Text style={styles.error} accessibilityLiveRegion="polite" role="alert">
          {error}
        </Text>
      )}
    </View>
  );
});

const useStyles = makeStyles((c) => ({
  wrapper: { gap: spacing.sm, width: '100%' },
  label: { ...typography.caption, color: c.text.secondary },
  labelError: { color: c.feedback.errorText },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldFocused: { borderColor: c.brand.primary, borderWidth: 2 },
  fieldError: { backgroundColor: c.feedback.errorSoft, borderColor: c.feedback.error, borderWidth: 2 },
  input: {
    flex: 1,
    ...typography.body,
    color: c.text.primary,
    paddingVertical: 15,
    // Sur le web, on dessine le focus sur le cadre du champ plutôt que sur l'input
    outlineStyle: 'none',
  } as object,
  toggle: { paddingVertical: spacing.sm, paddingLeft: spacing.sm, borderRadius: 6 },
  toggleText: { fontFamily: fonts.semibold, fontSize: 13, color: c.brand.primary },
  error: { ...typography.bodySmall, color: c.feedback.errorText },
}));
