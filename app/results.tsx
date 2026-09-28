// Écrans 11 · Résultats et 12 · Sauvegarder (invitée) — Figma nodes 9:243 et 9:275
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { SaveProgressSheet } from '@/components/SaveProgressSheet';
import { ScoreRing } from '@/components/ScoreRing';
import { Screen } from '@/components/Screen';
import { TextLink } from '@/components/TextLink';
import { getProfile, getStreak } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useT } from '@/lib/i18n';
import { getLastResult } from '@/lib/sessionResult';
import { getGuestProgress } from '@/lib/sync';
import { makeStyles, useTheme } from '@/lib/theme';
import { spacing, typography } from '@/theme';

export default function Results() {
  const styles = useStyles();
  const t = useT();
  const { colors: c } = useTheme();
  const result = getLastResult();
  const { session, isGuest } = useAuth();
  const [name, setName] = useState('');
  const [streak, setStreak] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(isGuest);

  useEffect(() => {
    if (!session) return;
    getProfile(session.user.id)
      .then((p) => setName(p?.display_name ?? ''))
      .catch(() => {});
    getStreak()
      .then(setStreak)
      .catch(() => {});
  }, [session]);

  // Page ouverte directement (ex : rechargement du navigateur) → pas de résultat à afficher
  if (!result) return <Redirect href="/home" />;

  const percent = result.total ? Math.round((result.known / result.total) * 100) : 0;
  const title = percent >= 50 ? t.results.good(name) : t.results.keepGoing(name);
  const summary = t.results.summary(result.known, result.total) + (streak ? t.results.streak(streak) : '');
  const retryCount = result.retryIds.length;

  function backToTrack() {
    router.replace(result!.trackSlug ? `/track/${result!.trackSlug}` : '/home');
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.replace('/home')}
          accessibilityRole="button"
          accessibilityLabel={t.results.close}
          hitSlop={8}
          style={({ focused }: PressState) => [styles.close, focused && focusStyles.ring]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <ScoreRing percent={percent} />

      <Text role="heading" aria-level={1} style={styles.title}>
        {title}
      </Text>
      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.stats}>
        <StatTile value={result.known} label={t.review.je_savais} bg={c.feedback.successSoft} fg={c.feedback.successText} />
        <StatTile value={result.almost} label={t.review.presque} bg={c.feedback.warningSoft} fg={c.feedback.warningText} />
        <StatTile value={result.toReview} label={t.review.a_revoir} bg={c.feedback.errorSoft} fg={c.feedback.errorText} />
      </View>

      {!isGuest &&
        (result.savedOnline ? (
          <Alert type="success" title={t.results.savedTitle} message={t.results.savedMsg} />
        ) : (
          <Alert type="warning" title={t.results.localTitle} message={t.results.localMsg} />
        ))}

      {isGuest && !sheetOpen && (
        <View style={styles.center}>
          <TextLink label={t.results.saveProgress} onPress={() => setSheetOpen(true)} />
        </View>
      )}

      <View style={styles.spacer} />

      {result.hasChallenge && result.levelId ? (
        // Deck révisé → on propose le défi final (qui débloque le niveau suivant)
        <>
          <Button label={t.results.takeChallenge} onPress={() => router.replace(`/challenge?level=${result.levelId}`)} />
          {retryCount > 0 && (
            <Button
              label={t.results.retry(retryCount)}
              variant="secondary"
              onPress={() => router.replace(`/review?mode=retry&ids=${result.retryIds.join(',')}`)}
            />
          )}
          <View style={styles.center}>
            <TextLink label={t.results.backToTrack} onPress={backToTrack} />
          </View>
        </>
      ) : (
        <>
          {retryCount > 0 && (
            <Button
              label={t.results.retry(retryCount)}
              onPress={() => router.replace(`/review?mode=retry&ids=${result.retryIds.join(',')}`)}
            />
          )}
          <Button
            label={result.trackSlug ? t.results.backToTrack : t.results.backHome}
            variant={retryCount > 0 ? 'secondary' : 'primary'}
            onPress={backToTrack}
          />
        </>
      )}

      {isGuest && (
        <SaveProgressSheet
          visible={sheetOpen}
          reviewedCount={getGuestProgress().total}
          onClose={() => setSheetOpen(false)}
          onCreateAccount={() => {
            setSheetOpen(false);
            router.push('/signup');
          }}
        />
      )}
    </Screen>
  );
}

function StatTile({ value, label, bg, fg }: { value: number; label: string; bg: string; fg: string }) {
  const styles = useStyles();
  return (
    <View style={[styles.tile, { backgroundColor: bg }]} accessible accessibilityLabel={`${label} : ${value}`}>
      <Text style={[styles.tileValue, { color: fg }]}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  topBar: { flexDirection: 'row' },
  close: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  closeText: { fontSize: 30, lineHeight: 34, color: c.text.primary },
  title: { ...typography.h1, color: c.text.primary, textAlign: 'center' },
  summary: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 14, borderRadius: 16 },
  tileValue: typography.h1,
  tileLabel: { ...typography.caption, color: c.text.secondary, textAlign: 'center' },
  center: { alignItems: 'center' },
  spacer: { flexGrow: 1, minHeight: spacing.md },
}));
