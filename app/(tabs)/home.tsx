// Écrans 06 · Accueil (connectée) et 07 · Accueil (invitée) — Figma nodes 8:54 et 8:131
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadError, Loading } from '@/components/StateViews';
import { TrackCard } from '@/components/TrackCard';
import { getDemoDeck, getProfile, getStreak, getTracksOverview, getWeekActivity } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { pick, useLang, useT } from '@/lib/i18n';
import { getGuestProgress } from '@/lib/sync';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { radius, spacing, typography } from '@/theme';

export default function Home() {
  const { isGuest } = useAuth();
  return isGuest ? <GuestHome /> : <MemberHome />;
}

// ---------- Connectée ----------

function MemberHome() {
  const styles = useStyles();
  const t = useT();
  const { session } = useAuth();
  const userId = session!.user.id;

  const { data, error, loading, reload } = useData(async () => {
    const [tracks, profile, streak, week] = await Promise.all([
      getTracksOverview(true),
      getProfile(userId),
      // La série vient d'une fonction Supabase : hors ligne, on affiche 0 plutôt qu'une erreur
      getStreak().catch(() => 0),
      getWeekActivity().catch(() => [false, false, false, false, false, false, false]),
    ]);
    return { tracks, profile, streak, week };
  }, [userId]);

  const name =
    data?.profile?.display_name ?? (session?.user.user_metadata?.display_name as string | undefined) ?? '';
  const due = data?.tracks.reduce((sum, tr) => sum + tr.dueNow, 0) ?? 0;

  return (
    <Screen edges={['top']}>
      <Header title={t.home.hello(name)} subtitle={t.home.ready} initial={name[0] ?? '?'} />

      {!data && loading && <Loading />}
      {!data && error && <LoadError onRetry={reload} />}

      {data && (
        <>
          <StreakHero streak={data.streak} week={data.week} due={due} />

          <SectionHeader title={t.home.yourTracks} linkLabel={t.home.seeAll} onLinkPress={() => router.push('/parcours')} />
          <View style={styles.list}>
            {data.tracks.map((tr) => (
              <TrackCard key={tr.id} track={tr} onPress={() => router.push(`/track/${tr.slug}`)} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

function StreakHero({ streak, week, due }: { streak: number; week: boolean[]; due: number }) {
  const styles = useStyles();
  const t = useT();
  const minutes = Math.max(1, Math.ceil(due / 2)); // ~30 s par carte
  const activeDays = week.filter(Boolean).length;
  const cta = due > 0 ? t.home.reviewNow : t.home.chooseDeck;

  return (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.heroLabel}>{t.home.streakLabel}</Text>
          <Text style={styles.heroValue}>{t.home.days(streak)}</Text>
        </View>
        <View style={styles.week} role="img" aria-label={t.home.week(activeDays)} accessibilityLabel={t.home.week(activeDays)}>
          {week.map((on, i) => (
            <View key={i} style={[styles.dot, on ? styles.dotOn : styles.dotOff]} />
          ))}
        </View>
      </View>

      <Text style={styles.heroText}>{due > 0 ? t.home.due(due, minutes) : t.home.nothingDue}</Text>

      <Pressable
        onPress={() => (due > 0 ? router.push('/review?mode=due') : router.push('/parcours'))}
        accessibilityRole="button"
        accessibilityLabel={cta}
        style={({ pressed, focused }: PressState) => [styles.cta, pressed && { opacity: 0.85 }, focused && focusStyles.ring]}
      >
        <Text style={styles.ctaText}>{cta}</Text>
      </Pressable>
    </View>
  );
}

// ---------- Invitée ----------

function GuestHome() {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { data, error, loading, reload } = useData(async () => {
    const [tracks, demo] = await Promise.all([getTracksOverview(false), getDemoDeck()]);
    return { tracks, demo, progress: getGuestProgress() };
  }, []);

  return (
    <Screen edges={['top']}>
      <Header title={t.home.hello('')} subtitle={t.home.guestSubtitle} initial="?" guest />
      <Alert type="info" title={t.home.guestAlertTitle} message={t.home.guestAlertMsg} announce={false} />

      {!data && loading && <Loading />}
      {!data && error && <LoadError onRetry={reload} />}

      {data && (
        <>
          {data.demo && (
            <View style={styles.demoCard}>
              <Badge kind="demo" />
              <Text role="heading" aria-level={2} style={styles.demoTitle}>
                {t.home.demoTry(data.demo.cardCount, pick(lang, data.demo.title, data.demo.title_en))}
              </Text>
              <Button label={t.home.launchDemo} onPress={() => router.push(`/review?level=${data.demo!.id}`)} />
            </View>
          )}

          <SectionHeader title={t.home.tracks} />
          <View style={styles.list}>
            {data.tracks.map((tr) => {
              // Progression de l'invitée (en mémoire) : cartes révisées dans les decks de ce parcours
              const seen = tr.decks.reduce((sum, d) => sum + (data.progress.byLevel[d.id] ?? 0), 0);
              return (
                <TrackCard
                  key={tr.id}
                  track={tr}
                  progress={tr.cardsTotal ? seen / tr.cardsTotal : 0}
                  onPress={() => router.push(`/track/${tr.slug}`)}
                />
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}

// ---------- Commun ----------

function Header({ title, subtitle, initial, guest = false }: { title: string; subtitle: string; initial: string; guest?: boolean }) {
  const styles = useStyles();
  const t = useT();
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Pressable
        onPress={() => router.push('/profil')}
        accessibilityRole="button"
        accessibilityLabel={t.home.openProfile}
        style={({ focused }: PressState) => [styles.avatar, guest ? styles.avatarGuest : styles.avatarMember, focused && focusStyles.ring]}
      >
        <Text style={[styles.avatarText, guest && styles.avatarTextGuest]}>{initial.toUpperCase()}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headerText: { flex: 1, gap: 2 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarMember: { backgroundColor: c.brand.accent },
  avatarGuest: { backgroundColor: c.bg.subtle },
  avatarText: { ...typography.h3, color: c.onTrack },
  avatarTextGuest: { color: c.text.secondary },

  hero: { backgroundColor: c.hero.bg, borderRadius: 24, padding: 20, gap: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  heroLabel: { ...typography.caption, color: c.hero.text },
  heroValue: { ...typography.display, color: c.hero.text },
  week: { flexDirection: 'row', gap: 5, paddingBottom: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  dotOn: { backgroundColor: c.brand.accent },
  dotOff: { backgroundColor: c.hero.dotOff },
  heroText: { ...typography.body, color: c.hero.text },
  cta: {
    backgroundColor: c.brand.accent,
    borderRadius: radius.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  ctaText: { ...typography.label, color: c.onTrack },

  list: { gap: 12 },

  demoCard: {
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  demoTitle: { ...typography.h2, color: c.text.primary },
}));
