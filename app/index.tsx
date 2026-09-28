// Écran 01 · Onboarding (Figma node 7:3)
import { router } from 'expo-router';
import { Text, useWindowDimensions, View } from 'react-native';
import { Button } from '@/components/Button';
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

  return (
    <Screen maxWidth={wide ? 960 : layout.maxContentWidth}>
      <View style={styles.topBar}>
        {/* Langue + mode sombre, visibles dès le premier écran */}
        <QuickToggles />
        <TextLink label={t.onboarding.skip} onPress={startGuest} accessibilityHint={t.onboarding.skipHint} style={styles.skip} />
      </View>

      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={wide ? styles.colWide : undefined}>
          <Illustration />
        </View>

        <View style={[styles.textCol, wide && styles.colWide]}>
          <Text role="heading" aria-level={1} style={styles.title}>
            {t.onboarding.title}
          </Text>
          <Text style={styles.subtitle}>{t.onboarding.subtitle}</Text>
          <Pagination />

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

// Points de pagination (1er écran sur 3). Décoratif pour l'instant.
function Pagination() {
  const styles = useStyles();
  return (
    <View style={styles.pagination} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.dot, styles.dotActive]} />
      <View style={styles.dot} />
      <View style={styles.dot} />
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

  pagination: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border },
  dotActive: { width: 24, backgroundColor: c.brand.primary },

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
