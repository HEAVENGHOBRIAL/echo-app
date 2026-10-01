// Page d’un parcours (ex : Frontend) et ses decks
// Chaque deck se termine par un défi final ; le réussir débloque le deck suivant.
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { BackButton } from '@/components/BackButton';
import { Badge, badgeLabel } from '@/components/Badge';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadError, Loading } from '@/components/StateViews';
import { getTrackDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { pick, useLang } from '@/lib/i18n';
import { getGuestCompleted, getGuestProgress } from '@/lib/sync';
import { makeStyles, useTheme } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import type { Deck, DeckStatus } from '@/lib/types';
import { useData } from '@/lib/useData';
import { fonts, spacing, typography } from '@/theme';

export default function TrackScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isGuest } = useAuth();

  const { data, error, loading, reload } = useData(async () => {
    const guest = getGuestProgress();
    const track = await getTrackDetail(slug, !isGuest, { completed: getGuestCompleted(), seenByLevel: guest.byLevel });
    return { track, guest };
  }, [slug, isGuest]);

  const track = data?.track;

  if (!data && loading) {
    return (
      <Screen>
        <BackButton />
        <Loading />
      </Screen>
    );
  }
  if (error || !track) {
    return (
      <Screen>
        <BackButton />
        {error ? <LoadError onRetry={reload} /> : <Text style={styles.subtitle}>{t.track.notFound}</Text>}
      </Screen>
    );
  }

  const decks = [...track.decks].sort((a, b) => a.level_number - b.level_number);
  const color = trackColor(track.slug, track.color);
  const seen = isGuest ? decks.reduce((s, d) => s + (data.guest.byLevel[d.id] ?? 0), 0) : track.seen;
  const progress = track.cardsTotal ? seen / track.cardsTotal : 0;
  const due = isGuest ? 0 : track.dueNow;
  const title = (d: Deck) => pick(lang, d.title, d.title_en);

  // Prochaine étape : le 1er deck ouvert dont le défi n'est pas encore réussi
  const current = decks.find((d) => track.unlocked.has(d.id) && !track.completed.has(d.id));
  const readyForChallenge =
    current && track.withChallenge.has(current.id) && track.deckStatus[current.id] === 'maitrise';

  let mainLabel: string | null = null;
  let mainAction = () => {};
  if (due > 0) {
    mainLabel = t.track.reviewDue(due);
    mainAction = () => router.push(`/review?mode=due&track=${track.id}`);
  } else if (current && readyForChallenge) {
    mainLabel = t.track.startChallenge(title(current));
    mainAction = () => router.push(`/challenge?level=${current.id}`);
  } else if (current) {
    mainLabel = t.track.start(title(current));
    mainAction = () => router.push(`/review?level=${current.id}`);
  }

  return (
    <Screen>
      <BackButton />

      {/* Texte foncé sur la couleur du parcours : lisible aussi sur le jaune (JS) */}
      <View style={[styles.hero, { backgroundColor: color }]}>
        <Text style={styles.heroLabel}>{t.track.label}</Text>
        <Text role="heading" aria-level={1} style={styles.heroTitle}>
          {track.name}
        </Text>
        <Text style={styles.heroSubtitle}>{track.description}</Text>
        <View style={styles.stats}>
          <Stat value={track.cardsTotal} label={t.track.statCards} />
          <Stat value={isGuest ? 0 : track.mastered} label={t.track.statMastered} />
          <Stat value={due} label={t.track.statDue} />
        </View>
        <ProgressBar
          value={progress}
          color={colors.onTrack}
          trackColor="rgba(255,255,255,0.55)"
          label={t.track.seen(seen, track.cardsTotal)}
        />
      </View>

      {mainLabel ? <Button label={mainLabel} onPress={mainAction} /> : <Text style={styles.subtitle}>{t.track.allDone}</Text>}

      <SectionHeader title={t.track.decks} />
      <View style={styles.list}>
        {decks.map((deck, i) => (
          <DeckRow
            key={deck.id}
            deck={deck}
            kind={track.deckStatus[deck.id]}
            lockedHint={i > 0 ? t.track.lockedHint(title(decks[i - 1])) : ''}
            hasChallenge={track.withChallenge.has(deck.id)}
            passed={track.completed.has(deck.id)}
          />
        ))}
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const styles = useStyles();
  return (
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

type DeckRowProps = {
  deck: Deck;
  kind: DeckStatus;
  lockedHint: string;
  hasChallenge: boolean;
  passed: boolean;
};

function DeckRow({ deck, kind, lockedHint, hasChallenge, passed }: DeckRowProps) {
  const styles = useStyles();
  const { t, lang } = useLang();
  const title = pick(lang, deck.title, deck.title_en);
  const description = pick(lang, deck.description, deck.description_en);
  const locked = kind === 'verrouille';

  // Deck verrouillé : pas cliquable, on explique comment le débloquer
  if (locked) {
    return (
      <View
        style={[styles.deck, styles.deckLocked]}
        accessible
        accessibilityLabel={`${t.track.deckLabel(title, deck.cardCount, badgeLabel(kind, t))}. ${lockedHint}`}
        aria-disabled
      >
        <View style={styles.deckMain}>
          <View style={styles.deckInfo}>
            <Text style={styles.deckTitle}>{title}</Text>
            <Text style={styles.deckMeta}>{lockedHint}</Text>
          </View>
          <Badge kind={kind} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.deck}>
      <Pressable
        onPress={() => router.push(`/review?level=${deck.id}`)}
        accessibilityRole="button"
        accessibilityLabel={t.track.deckLabel(title, deck.cardCount, badgeLabel(kind, t))}
        accessibilityHint={t.track.deckHint}
        style={({ pressed, focused }: PressState) => [styles.deckMain, pressed && styles.pressed, focused && focusStyles.ring]}
      >
        <View style={styles.deckInfo}>
          <Text style={styles.deckTitle}>{title}</Text>
          <Text style={styles.deckMeta}>
            {t.common.cards(deck.cardCount)} · {description}
          </Text>
        </View>
        <Badge kind={kind} />
      </Pressable>

      {hasChallenge && (
        <Pressable
          onPress={() => router.push(`/challenge?level=${deck.id}`)}
          accessibilityRole="button"
          accessibilityLabel={t.track.challengeA11y(title)}
          style={({ pressed, focused }: PressState) => [styles.challengeBtn, pressed && styles.pressed, focused && focusStyles.ring]}
        >
          <Text style={styles.challengeText}>{passed ? t.track.challengeReplay : t.track.challenge}</Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  subtitle: { ...typography.body, color: c.text.secondary },

  hero: { borderRadius: 24, paddingHorizontal: 20, paddingVertical: 18, gap: 4 },
  heroLabel: { ...typography.caption, color: c.onTrack },
  heroTitle: { ...typography.display, color: c.onTrack },
  heroSubtitle: { ...typography.body, color: c.onTrack },
  stats: { flexDirection: 'row', gap: 20, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  statValue: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: c.onTrack },
  statLabel: { ...typography.caption, color: c.onTrack },

  list: { gap: 10 },
  deck: {
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deckLocked: { backgroundColor: c.bg.subtle, borderStyle: 'dashed' },
  deckMain: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 14 },
  pressed: { backgroundColor: c.bg.subtle },
  deckInfo: { flex: 1, gap: 2 },
  deckTitle: { ...typography.h3, color: c.text.primary },
  deckMeta: { ...typography.bodySmall, color: c.text.secondary },
  challengeBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  challengeText: { ...typography.label, color: c.brand.primary },
}));
