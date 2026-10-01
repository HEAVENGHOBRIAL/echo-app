// Onglet Stats
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadError, Loading } from '@/components/StateViews';
import { getRecentSessions, getReviewTotals, getStreak, getTracksOverview } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { pick, useLang, useT } from '@/lib/i18n';
import { makeStyles } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import { useData } from '@/lib/useData';
import { spacing, typography } from '@/theme';

export default function Stats() {
  const styles = useStyles();
  const t = useT();
  const { isGuest } = useAuth();

  return (
    <Screen edges={['top']}>
      <Text role="heading" aria-level={1} style={styles.title}>
        {t.stats.title}
      </Text>
      {isGuest ? <GuestStats /> : <MemberStats />}
    </Screen>
  );
}

function GuestStats() {
  const t = useT();
  return (
    <>
      <Alert type="info" title={t.stats.guestTitle} message={t.stats.guestMsg} announce={false} />
      <Button label={t.stats.createAccount} onPress={() => router.push('/signup')} />
    </>
  );
}

function MemberStats() {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { data, error, loading, reload } = useData(async () => {
    const [streak, tracks, totals, sessions] = await Promise.all([
      getStreak(),
      getTracksOverview(true),
      getReviewTotals(),
      getRecentSessions(),
    ]);
    return { streak, tracks, totals, sessions };
  }, []);

  if (!data && loading) return <Loading />;
  if (!data || error) return <LoadError onRetry={reload} />;

  const cardsTotal = data.tracks.reduce((s, tr) => s + tr.cardsTotal, 0);
  const mastered = data.tracks.reduce((s, tr) => s + tr.mastered, 0);
  const due = data.tracks.reduce((s, tr) => s + tr.dueNow, 0);

  return (
    <>
      <View style={styles.grid}>
        <Tile value={`${data.streak}`} label={t.stats.streak(data.streak)} />
        <Tile value={`${mastered}`} label={t.stats.mastered} />
        <Tile value={`${data.totals.cardsSeen}/${cardsTotal}`} label={t.stats.seen} />
        <Tile value={`${due}`} label={t.stats.due} />
      </View>

      <SectionHeader title={t.stats.byTrack} />
      <View style={styles.card}>
        {data.tracks.map((tr) => (
          <View key={tr.id} style={styles.trackRow}>
            <View style={styles.trackHead}>
              <Text style={styles.trackName}>{tr.name}</Text>
              <Text style={styles.trackValue}>{t.stats.masteredOf(tr.mastered, tr.cardsTotal)}</Text>
            </View>
            <ProgressBar
              value={tr.cardsTotal ? tr.mastered / tr.cardsTotal : 0}
              color={trackColor(tr.slug, tr.color)}
              label={t.stats.trackA11y(tr.name, tr.mastered, tr.cardsTotal)}
            />
          </View>
        ))}
      </View>
      <Text style={styles.note}>{t.stats.note}</Text>

      <SectionHeader title={t.stats.recent} />
      {data.sessions.length === 0 ? (
        <Text style={styles.note}>{t.stats.noSessions}</Text>
      ) : (
        <View style={styles.card}>
          {data.sessions.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <View style={styles.sessionInfo}>
                <Text style={styles.trackName}>
                  {s.levels ? pick(lang, s.levels.title, s.levels.title_en) : t.stats.dueSession}
                </Text>
                <Text style={styles.note}>
                  {new Date(s.finished_at!).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </Text>
              </View>
              <Text style={styles.trackValue}>
                {s.known_count}/{s.cards_total}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  title: { ...typography.h1, color: c.text.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: spacing.md,
    gap: 2,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 18,
  },
  tileValue: { ...typography.h1, color: c.text.primary },
  tileLabel: { ...typography.bodySmall, color: c.text.secondary },
  card: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 18,
  },
  trackRow: { gap: spacing.sm },
  trackHead: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap' },
  trackName: { ...typography.h3, color: c.text.primary },
  trackValue: { ...typography.label, color: c.text.secondary },
  note: { ...typography.bodySmall, color: c.text.secondary },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sessionInfo: { flex: 1, gap: 2 },
}));
