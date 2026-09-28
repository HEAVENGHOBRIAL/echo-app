// Défi final d'un deck : un jeu de cartes où l'on construit un code avec ce qu'on a appris.
//   /challenge?level=6
// Réussir le défi termine le deck et débloque le suivant.
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { focusStyles, type PressState } from '@/components/focus';
import { Screen } from '@/components/Screen';
import { LoadError, Loading } from '@/components/StateViews';
import { TextLink } from '@/components/TextLink';
import { computeUnlocked, getChallenge, getCompletedLevels, getDecks, getLevel, getTrackSlug } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { pick, useLang } from '@/lib/i18n';
import { getGuestCompleted, recordCompletion } from '@/lib/sync';
import { makeStyles } from '@/lib/theme';
import { trackColor } from '@/lib/trackColors';
import type { Challenge, Deck, Level } from '@/lib/types';
import { fonts, radius, spacing, typography } from '@/theme';

type PlayCard = { id: number; text: string };

type Loaded = {
  challenge: Challenge | null;
  level: Level;
  trackSlug: string;
  next: Deck | null;
  unlocked: boolean;
};

// Mélange les cartes (et vérifie qu'on ne tombe pas pile sur la bonne réponse)
function shuffle(cards: PlayCard[], solution: string[]) {
  let result = cards;
  for (let tries = 0; tries < 10; tries++) {
    result = [...cards].sort(() => Math.random() - 0.5);
    if (result.slice(0, solution.length).map((c) => c.text).join('\n') !== solution.join('\n')) break;
  }
  return result;
}

export default function ChallengeScreen() {
  const styles = useStyles();
  const { t, lang } = useLang();
  const { level: levelParam } = useLocalSearchParams<{ level: string }>();
  const levelId = Number(levelParam);
  const { session, isGuest } = useAuth();

  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [hand, setHand] = useState<PlayCard[]>([]);
  const [board, setBoard] = useState<PlayCard[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; title: string; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [saving, setSaving] = useState(false);

  const deal = useCallback((challenge: Challenge) => {
    const all = [...challenge.pieces, ...challenge.distractors].map((text, id) => ({ id, text }));
    setHand(shuffle(all, challenge.pieces));
    setBoard([]);
  }, []);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const [challenge, level] = await Promise.all([getChallenge(levelId), getLevel(levelId)]);
      if (!level) throw new Error('level');
      const [decks, completedIds, trackSlug] = await Promise.all([
        getDecks(level.track_id ?? undefined),
        isGuest ? Promise.resolve(getGuestCompleted()) : getCompletedLevels(),
        getTrackSlug(level.track_id),
      ]);
      const unlocked = computeUnlocked(decks, new Set(completedIds)).has(level.id);
      const next = decks
        .filter((d) => d.level_number > level.level_number)
        .sort((a, b) => a.level_number - b.level_number)[0] ?? null;
      setData({ challenge, level, trackSlug, next, unlocked });
      if (challenge) deal(challenge);
    } catch {
      setLoadError(true);
    }
  }, [levelId, isGuest, deal]);

  useEffect(() => {
    load();
  }, [load]);

  const challenge = data?.challenge;
  const level = data?.level;
  const done = feedback?.type === 'success';

  function addCard(card: PlayCard) {
    if (done) return;
    setFeedback(null);
    setHand((h) => h.filter((c) => c.id !== card.id));
    setBoard((b) => [...b, card]);
  }

  function removeCard(card: PlayCard) {
    if (done) return;
    setFeedback(null);
    setBoard((b) => b.filter((c) => c.id !== card.id));
    setHand((h) => [...h, card]);
  }

  async function check() {
    if (!challenge || !level) return;
    const answer = board.map((c) => c.text);
    const solution = challenge.pieces;
    let ok = false;
    let message = '';

    if (answer.length !== solution.length) {
      message = t.challenge.wrongCount(solution.length);
    } else if (challenge.ordered) {
      const correct = answer.filter((line, i) => line === solution[i]).length;
      ok = correct === solution.length;
      message = t.challenge.wrongOrdered(correct, solution.length);
    } else {
      ok = [...answer].sort().join('\n') === [...solution].sort().join('\n');
      message = t.challenge.wrongUnordered;
    }

    if (!ok) {
      setAttempts((a) => a + 1);
      setFeedback({ type: 'error', title: t.challenge.wrongTitle, message });
      return;
    }

    // Réussi : le deck est terminé → le suivant se débloque
    setSaving(true);
    await recordCompletion(
      { levelId: level.id, trackId: level.track_id ?? 0, levelNumber: level.level_number },
      isGuest,
      session?.user.id ?? null,
    );
    setSaving(false);
    const next = data?.next;
    setFeedback({
      type: 'success',
      title: t.challenge.successTitle,
      message: next ? t.challenge.successNext(pick(lang, next.title, next.title_en)) : t.challenge.successLast,
    });
  }

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace(data?.trackSlug ? `/track/${data.trackSlug}` : '/home');
  }

  const deckTitle = level ? pick(lang, level.title, level.title_en) : '';
  const color = trackColor(data?.trackSlug);

  return (
    <Screen maxWidth={600}>
      <View style={styles.topBar}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t.challenge.quit}
          hitSlop={8}
          style={({ focused }: PressState) => [styles.close, focused && focusStyles.ring]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {t.challenge.title}
        </Text>
        <View style={styles.close} />
      </View>

      {!data && !loadError && <Loading />}
      {loadError && <LoadError onRetry={load} />}

      {data && !data.unlocked && (
        <Alert type="info" title={t.challenge.lockedTitle} message={t.challenge.lockedMsg} />
      )}
      {data && data.unlocked && !challenge && <Text style={styles.text}>{t.challenge.notFound}</Text>}

      {data && data.unlocked && challenge && (
        <>
          {/* Consigne */}
          <View style={styles.promptCard}>
            <View style={[styles.tag, { backgroundColor: color }]}>
              <Text style={styles.tagText}>{t.challenge.tag(deckTitle)}</Text>
            </View>
            <Text role="heading" aria-level={1} style={styles.prompt}>
              {pick(lang, challenge.prompt_fr, challenge.prompt_en)}
            </Text>
            <Text style={styles.text}>
              {challenge.ordered ? t.challenge.instructionsOrdered : t.challenge.instructionsUnordered}
            </Text>
          </View>

          {/* Plateau : le code en construction */}
          <View style={styles.boardHead}>
            <Text role="heading" aria-level={2} style={styles.sectionTitle}>
              {t.challenge.yourCode}
            </Text>
            <Text style={styles.count}>{t.challenge.lineCount(board.length, challenge.pieces.length)}</Text>
          </View>
          <View style={[styles.board, done && styles.boardDone]} aria-live="polite">
            {!!challenge.code_before && <Text style={styles.fixedLine}>{challenge.code_before}</Text>}
            {board.length === 0 && <Text style={styles.emptyBoard}>{t.challenge.emptyBoard}</Text>}
            {board.map((card, i) => (
              <Pressable
                key={card.id}
                onPress={() => removeCard(card)}
                disabled={done}
                accessibilityRole="button"
                accessibilityLabel={t.challenge.remove(card.text, i + 1)}
                style={({ pressed, focused }: PressState) => [
                  styles.line,
                  !!challenge.code_before && styles.lineIndented,
                  pressed && styles.linePressed,
                  focused && focusStyles.ring,
                ]}
              >
                <Text style={styles.lineNumber} aria-hidden>
                  {i + 1}
                </Text>
                <Text style={styles.lineText}>{card.text}</Text>
              </Pressable>
            ))}
            {!!challenge.code_after && <Text style={styles.fixedLine}>{challenge.code_after}</Text>}
          </View>

          {feedback && <Alert type={feedback.type} title={feedback.title} message={feedback.message} />}

          {/* Indice après 2 erreurs, solution après 3 */}
          {!done && attempts >= 2 && pick(lang, challenge.hint_fr, challenge.hint_en) !== '' && (
            <Alert
              type="info"
              title={t.challenge.hintTitle}
              message={pick(lang, challenge.hint_fr, challenge.hint_en)}
              announce={false}
            />
          )}
          {!done && attempts >= 3 && !showSolution && (
            <View style={styles.center}>
              <TextLink label={t.challenge.showSolution} onPress={() => setShowSolution(true)} />
            </View>
          )}
          {!done && showSolution && (
            <View style={styles.solution}>
              <Text style={styles.sectionTitle}>{t.challenge.solutionTitle}</Text>
              <ScrollView horizontal>
                <Text style={styles.solutionCode} selectable>
                  {[challenge.code_before, ...challenge.pieces, challenge.code_after].filter(Boolean).join('\n')}
                </Text>
              </ScrollView>
              <Text style={styles.text}>{t.challenge.solutionNote}</Text>
            </View>
          )}

          {done ? (
            <>
              {data.next && (
                <Button
                  label={t.challenge.continueTo(pick(lang, data.next.title, data.next.title_en))}
                  onPress={() => router.replace(`/review?level=${data.next!.id}`)}
                />
              )}
              <Button
                label={t.challenge.backToTrack}
                variant={data.next ? 'secondary' : 'primary'}
                onPress={() => router.replace(`/track/${data.trackSlug}`)}
              />
            </>
          ) : (
            <>
              {/* Main : les cartes à jouer */}
              <Text role="heading" aria-level={2} style={styles.sectionTitle}>
                {t.challenge.hand}
              </Text>
              <View style={styles.hand}>
                {hand.length === 0 && <Text style={styles.text}>{t.challenge.handEmpty}</Text>}
                {hand.map((card) => (
                  <Pressable
                    key={card.id}
                    onPress={() => addCard(card)}
                    accessibilityRole="button"
                    accessibilityLabel={t.challenge.add(card.text)}
                    style={({ pressed, focused }: PressState) => [
                      styles.playCard,
                      { borderTopColor: color },
                      pressed && styles.playCardPressed,
                      focused && focusStyles.ring,
                    ]}
                  >
                    <Text style={styles.playCardText}>{card.text}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.actions}>
                <View style={styles.flex}>
                  <Button
                    label={t.challenge.reset}
                    variant="secondary"
                    onPress={() => {
                      setFeedback(null);
                      deal(challenge);
                    }}
                  />
                </View>
                <View style={styles.flex}>
                  <Button label={t.challenge.check} onPress={check} loading={saving} disabled={board.length === 0} />
                </View>
              </View>
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  close: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  closeText: { fontSize: 30, lineHeight: 34, color: c.text.primary },
  topTitle: { ...typography.label, color: c.text.primary, flex: 1, textAlign: 'center' },
  text: { ...typography.body, color: c.text.secondary },
  center: { alignItems: 'center' },
  flex: { flex: 1 },

  promptCard: {
    gap: spacing.sm,
    padding: 20,
    borderRadius: 24,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  tagText: { ...typography.caption, color: c.onTrack },
  prompt: { ...typography.h2, color: c.text.primary },

  boardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: c.text.primary },
  count: { ...typography.bodySmall, color: c.text.secondary },
  board: {
    minHeight: 120,
    gap: 6,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: c.code.bg,
  },
  boardDone: { borderWidth: 2, borderColor: c.feedback.success },
  fixedLine: { fontFamily: fonts.code, fontSize: 14, lineHeight: 20, color: c.text.muted },
  emptyBoard: { ...typography.bodySmall, color: c.text.muted, fontStyle: 'italic', paddingVertical: spacing.sm },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lineIndented: { marginLeft: spacing.md },
  linePressed: { backgroundColor: 'rgba(255,255,255,0.18)' },
  lineNumber: { fontFamily: fonts.code, fontSize: 12, color: c.text.muted, minWidth: 14 },
  lineText: { fontFamily: fonts.code, fontSize: 14, lineHeight: 20, color: c.code.text, flexShrink: 1 },

  hand: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  playCard: {
    minHeight: 48,
    maxWidth: '100%',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: c.bg.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderTopWidth: 4,
    boxShadow: '0px 4px 10px rgba(15, 26, 46, 0.08)',
  },
  playCardPressed: { backgroundColor: c.bg.subtle, transform: [{ translateY: 2 }] },
  playCardText: { fontFamily: fonts.code, fontSize: 14, lineHeight: 20, color: c.text.primary },

  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },

  solution: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.bg.surface,
  },
  solutionCode: { fontFamily: fonts.code, fontSize: 14, lineHeight: 20, color: c.text.primary },
}));
