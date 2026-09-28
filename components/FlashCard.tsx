// Carte de révision : recto (la notion) et verso (réponse + code + explication)
import { Pressable, ScrollView, Text, View } from 'react-native';
import { focusStyles, type PressState } from '@/components/focus';
import { pick, useLang } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import type { ReviewCard } from '@/lib/types';
import { codeFont, fonts, radius, spacing, typography } from '@/theme';

type Props = {
  card: ReviewCard;
  flipped: boolean;
  onFlip: () => void;
};

export function FlashCard({ card, flipped, onFlip }: Props) {
  const styles = useStyles();
  const { t, lang } = useLang();
  const front = pick(lang, card.front, card.front_en);
  const explanation = pick(lang, card.explanation_fr, card.explanation_en);
  const deck = pick(lang, card.deckTitle, card.deckTitleEn);

  if (!flipped) {
    return (
      <Pressable
        onPress={onFlip}
        accessibilityRole="button"
        accessibilityLabel={t.review.cardLabel(front)}
        accessibilityHint={t.review.flipA11yHint}
        style={({ focused }: PressState) => [styles.card, focused && focusStyles.ring]}
      >
        <View style={[styles.tag, { backgroundColor: trackColor(card.trackSlug) }]}>
          <Text style={styles.tagText}>
            {deck.toUpperCase()} · {t.review.question}
          </Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.question}>{front}</Text>
          <Text style={styles.prompt}>{t.review.prompt}</Text>
        </View>

        <View aria-hidden>
          <Text style={styles.hint}>{t.review.flipHint}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={[styles.tag, styles.tagAnswer]}>
        <Text style={[styles.tagText, styles.tagAnswerText]}>{t.review.answer}</Text>
      </View>

      {/* aria-live : le lecteur d'écran lit la réponse quand la carte se retourne */}
      <View style={styles.answer} aria-live="polite" accessibilityLiveRegion="polite">
        <Text role="heading" aria-level={2} style={styles.notion}>
          {front}
        </Text>

        {!!card.code_snippet && (
          <ScrollView
            horizontal
            style={styles.code}
            contentContainerStyle={styles.codeContent}
            accessibilityLabel={t.review.codeExample}
          >
            <Text style={styles.codeText} selectable>
              {card.code_snippet}
            </Text>
          </ScrollView>
        )}

        {!!explanation && <Text style={styles.explanation}>{explanation}</Text>}
      </View>

      <Text style={styles.hint}>{t.review.didYouKnow}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    minHeight: 400,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 28,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 28,
    boxShadow: '0px 12px 16px rgba(51, 38, 128, 0.12)',
  },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  // Texte foncé sur la couleur du parcours → lisible sur les 3 couleurs
  tagText: { ...typography.caption, color: c.onTrack },
  tagAnswer: { backgroundColor: c.feedback.successSoft },
  tagAnswerText: { color: c.feedback.successText },

  middle: { alignItems: 'center', gap: spacing.md },
  question: { ...typography.display, color: c.text.primary, textAlign: 'center' },
  prompt: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
  hint: { ...typography.bodySmall, color: c.text.secondary },

  answer: { width: '100%', alignItems: 'center', gap: spacing.md },
  notion: { ...typography.display, color: c.brand.primary, textAlign: 'center' },
  code: { width: '100%', flexGrow: 0, backgroundColor: c.code.bg, borderRadius: radius.md },
  codeContent: { paddingHorizontal: spacing.md, paddingVertical: 14 },
  codeText: { ...codeFont, fontSize: 14, lineHeight: 20, color: c.code.text },
  explanation: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
}));
