// Onglet Parcours : les 3 parcours (même carte que sur l'accueil)
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { LoadError, Loading } from '@/components/StateViews';
import { TrackCard } from '@/components/TrackCard';
import { getTracksOverview } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { getGuestProgress } from '@/lib/sync';
import { makeStyles } from '@/lib/theme';
import { useData } from '@/lib/useData';
import { typography } from '@/theme';

export default function Parcours() {
  const styles = useStyles();
  const t = useT();
  const { isGuest } = useAuth();
  const { data, error, loading, reload } = useData(async () => {
    const tracks = await getTracksOverview(!isGuest);
    return { tracks, progress: getGuestProgress() };
  }, [isGuest]);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.title}>
          {t.tracks.title}
        </Text>
        <Text style={styles.subtitle}>{t.tracks.subtitle}</Text>
      </View>

      {!data && loading && <Loading />}
      {!data && error && <LoadError onRetry={reload} />}

      {data && (
        <View style={styles.list}>
          {data.tracks.map((tr) => {
            const guestSeen = tr.decks.reduce((sum, d) => sum + (data.progress.byLevel[d.id] ?? 0), 0);
            return (
              <TrackCard
                key={tr.id}
                track={tr}
                progress={isGuest ? (tr.cardsTotal ? guestSeen / tr.cardsTotal : 0) : undefined}
                onPress={() => router.push(`/track/${tr.slug}`)}
              />
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  header: { gap: 2 },
  title: { ...typography.h1, color: c.text.primary },
  subtitle: { ...typography.body, color: c.text.secondary },
  list: { gap: 12 },
}));
