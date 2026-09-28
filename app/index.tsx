// Écran 01 · Onboarding (Figma node 7:3)
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { Screen } from '@/components/Screen';
import { QuickToggles } from '@/components/Settings';
import { TextLink } from '@/components/TextLink';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { layout, radius, spacing, typography } from '@/theme';

export default function Onboarding() {
  const styles = useStyles();
  const t = useT();
  const { startGuest } = useAuth();
  const { width } = useWindowDimensions();
  // Sur ordinateur / tablette en paysage : illustration à gauche, texte à droite
  const wide = width >= layout.wideBreakpoint;
  // 3 écrans de présentation (points de pagination + bouton "Suivant")
  const [slide, setSlide] = useState(0);
  const slides = t.onboarding.slides;
  const current = slides[slide];

  return (
    <Screen maxWidth={wide ? 960 : layout.maxContentWidth}>
      <View style={styles.topBar}>
        {/* Langue + mode sombre, visibles dès le premier écran */}
        <QuickToggles />
        <TextLink label={t.onboarding.skip} onPress={startGuest} accessibilityHint={t.onboarding.skipHint} style={styles.skip} />
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={wide ? styles.colWide : undefined}>
          {slide === 0 && <Illustration />}
          {slide === 1 && <FlipIllustration />}
          {slide === 2 && <ChallengeIllustration />}
        </View>

        <View style={[styles.textCol, wide && styles.colWide]}>
          {/* aria-live : le lecteur d'écran lit le nouvel écran quand on change */}
          <View style={styles.slideText} aria-live="polite">
            <Text role="heading" aria-level={1} style={styles.title}>
              {current.title}
            </Text>
            <Text style={styles.subtitle}>{current.subtitle}</Text>
          </View>
          <View style={styles.paginationRow}>
            <Pagination index={slide} count={slides.length} onSelect={setSlide} />
            {slide < slides.length - 1 && (
              <TextLink label={`${t.onboarding.next} ›`} onPress={() => setSlide(slide + 1)} />
            )}
          </View>

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <Button label={t.onboarding.createAccount} onPress={() => router.push('/signup')} />
            <Button
              label={t.onboarding.tryGuest}
              variant="secondary"
              onPress={startGuest}
              accessibilityHint={t.onboarding.tryGuestHint}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t.onboarding.haveAccount}</Text>
              <TextLink label={t.onboarding.signIn} onPress={() => router.push('/login')} />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

// Les 3 cartes colorées (Backend / JS / Frontend) + la carte "flexbox" devant.
// Purement décoratif → caché aux lecteurs d'écran.
function Illustration() {
  const styles = useStyles();
  return (
    <View style={styles.illustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <View style={styles.canvas}>
        <View style={[styles.card, styles.cardBackend]} />
        <View style={[styles.card, styles.cardJs]} />
        <View style={[styles.card, styles.cardFrontend]} />
        <View style={styles.frontCard}>
          <Text style={styles.frontSymbol}>{'</>'}</Text>
          <Text style={styles.frontLabel}>flexbox</Text>
        </View>
      </View>
    </View>
  );
}

// Écran 2 : une carte retournée + les 3 réponses
function FlipIllustration() {
  const styles = useStyles();
  const t = useT();
  return (
    <View style={styles.illustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <View style={styles.flipCard}>
        <Text style={styles.flipTag}>{t.review.answer}</Text>
        <Text style={styles.flipNotion}>align-items</Text>
        <View style={styles.flipCode}>
          <Text style={styles.flipCodeText}>align-items: center;</Text>
        </View>
      </View>
      <View style={styles.pills}>
        <Text style={[styles.pill, styles.pillRed]}>{t.review.a_revoir}</Text>
        <Text style={[styles.pill, styles.pillOrange]}>{t.review.presque}</Text>
        <Text style={[styles.pill, styles.pillGreen]}>{t.review.je_savais}</Text>
      </View>
    </View>
  );
}

// Écran 3 : des cartes de code qui forment une réponse + le niveau débloqué
function ChallengeIllustration() {
  const styles = useStyles();
  return (
    <View style={styles.illustration} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      <View style={styles.codeStack}>
        {['SELECT nom, email', 'FROM users', 'WHERE age >= 18'].map((line, i) => (
          <Text key={line} style={[styles.codeCard, { marginLeft: i * 18 }]}>
            {line}
          </Text>
        ))}
      </View>
      <Text style={styles.unlock}>🔓 ⚡</Text>
    </View>
  );
}

// Points de pagination : cliquables pour changer d'écran
function Pagination({ index, count, onSelect }: { index: number; count: number; onSelect: (i: number) => void }) {
  const styles = useStyles();
  const t = useT();
  return (
    <View style={styles.pagination}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          onPress={() => onSelect(i)}
          accessibilityRole="button"
          accessibilityLabel={t.onboarding.slideLabel(i + 1, count)}
          aria-current={i === index ? 'step' : undefined}
          hitSlop={14}
          style={({ focused }: PressState) => [styles.dotTouch, focused && focusStyles.ring]}
        >
          <View style={[styles.dot, i === index && styles.dotActive]} />
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skip: { color: c.text.secondary },

  body: { flex: 1, gap: spacing.md },
  bodyWide: { flexDirection: 'row', alignItems: 'center', gap: 56 },
  colWide: { flex: 1 },
  textCol: { flex: 1, gap: spacing.md },

  title: { ...typography.display, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },

  slideText: { gap: spacing.md },
  paginationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pagination: { flexDirection: 'row', gap: 6 },
  dotTouch: { minHeight: 24, justifyContent: 'center', borderRadius: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { width: 24, backgroundColor: c.brand.primary },

  // Écran 2 : carte retournée
  flipCard: {
    marginTop: 34,
    width: 220,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: c.bg.surface,
    boxShadow: '0px 12px 28px rgba(51, 38, 128, 0.18)',
  },
  flipTag: {
    ...typography.caption,
    color: c.feedback.successText,
    backgroundColor: c.feedback.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  flipNotion: { ...typography.h2, color: c.brand.primary },
  flipCode: { alignSelf: 'stretch', backgroundColor: c.code.bg, borderRadius: 10, padding: 10 },
  flipCodeText: { ...typography.code, fontSize: 12, color: c.code.text },
  pills: { flexDirection: 'row', gap: 8, marginTop: 18 },
  pill: { ...typography.caption, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, overflow: 'hidden' },
  pillRed: { backgroundColor: c.feedback.errorSoft, color: c.feedback.errorText },
  pillOrange: { backgroundColor: c.feedback.warningSoft, color: c.text.primary },
  pillGreen: { backgroundColor: c.feedback.successStrong, color: c.white },

  // Écran 3 : cartes de code
  codeStack: { marginTop: 48, gap: 10, alignSelf: 'center' },
  codeCard: {
    ...typography.code,
    color: c.text.primary,
    backgroundColor: c.bg.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderTopWidth: 4,
    borderTopColor: c.track.frontend,
    overflow: 'hidden',
    boxShadow: '0px 6px 14px rgba(15, 26, 46, 0.12)',
  },
  unlock: { fontSize: 40, marginTop: 18 },

  spacer: { flexGrow: 1, minHeight: spacing.md },
  actions: { gap: spacing.md },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: spacing.xs },
  footerText: { ...typography.body, color: c.text.secondary },

  // Illustration : zone de 342 × 300 comme dans le Figma, centrée dans le bloc menthe
  illustration: {
    height: 300,
    width: '100%',
    borderRadius: radius.xl,
    backgroundColor: c.brand.soft,
    overflow: 'hidden',
    alignItems: 'center',
  },
  canvas: { width: 342, height: 300 },
  card: { position: 'absolute', width: 150, height: 190, borderRadius: radius.lg },
  cardBackend: { left: 38.6, top: 83.5, backgroundColor: c.track.backend, transform: [{ rotate: '12deg' }] },
  cardJs: { left: 205.4, top: 45.5, backgroundColor: c.track.js, transform: [{ rotate: '-10deg' }] },
  cardFrontend: { left: 104.9, top: 93.8, backgroundColor: c.track.frontend, transform: [{ rotate: '3deg' }] },
  frontCard: {
    position: 'absolute',
    left: 91,
    top: 52,
    width: 160,
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: c.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    boxShadow: '0px 12px 28px rgba(51, 38, 128, 0.18)',
  },
  frontSymbol: { ...typography.display, color: c.brand.primary },
  frontLabel: { ...typography.code, color: c.text.secondary },
}));
