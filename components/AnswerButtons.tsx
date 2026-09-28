// Les 3 boutons du verso : À revoir · Presque · Je savais
import { Pressable, Text, View } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { useT } from '@/lib/i18n';
import { makeStyles, useTheme } from '@/lib/theme';
import type { Answer } from '@/lib/types';
import { radius, typography } from '@/theme';

export function AnswerButtons({ onAnswer, disabled }: { onAnswer: (a: Answer) => void; disabled?: boolean }) {
  const styles = useStyles();
  const t = useT();
  const { colors: c } = useTheme();

  const buttons: { answer: Answer; label: string; hint: string; bg: string; border: string; fg: string }[] = [
    {
      answer: 'a_revoir',
      label: t.review.a_revoir,
      hint: t.review.a_revoirHint,
      bg: c.feedback.errorSoft,
      border: c.feedback.error,
      fg: c.feedback.errorText,
    },
    {
      answer: 'presque',
      label: t.review.presque,
      hint: t.review.presqueHint,
      bg: c.feedback.warningSoft,
      border: c.feedback.warning,
      fg: c.text.primary,
    },
    {
      answer: 'je_savais',
      label: t.review.je_savais,
      hint: t.review.je_savaisHint,
      bg: c.feedback.successStrong,
      border: c.feedback.successStrong,
      fg: c.white,
    },
  ];

  return (
    <View style={styles.row} role="group" aria-label={t.review.yourAnswer}>
      {buttons.map((b, i) => (
        <Pressable
          key={b.answer}
          onPress={() => onAnswer(b.answer)}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={b.label}
          accessibilityHint={`${b.hint}. ${t.review.shortcut(i + 1)}`}
          style={({ pressed, focused }: PressState) => [
            styles.button,
            { backgroundColor: b.bg, borderColor: b.border },
            pressed && { opacity: 0.8 },
            focused && focusStyles.ring,
          ]}
        >
          <Text style={[styles.label, { color: b.fg }]}>{b.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  button: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  label: { ...typography.label, textAlign: 'center' },
}));
