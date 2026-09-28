// Écrans 09 · Révision recto, 10 · verso et 13 · hors ligne — Figma nodes 9:200, 9:218, 9:333
//
// Paramètres possibles :
//   /review?level=6                → toutes les cartes d'un deck
//   /review?mode=due[&track=2]     → cartes à revoir aujourd'hui (option : un seul parcours)
//   /review?mode=retry&ids=1,2,3   → revoir les cartes ratées d'une session
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Alert } from '@/components/Alert';
import { AnswerButtons } from '@/components/AnswerButtons';
import { Button } from '@/components/Button';
import { FlashCard } from '@/components/FlashCard';
import { focusStyles, type PressState } from '@/components/focus';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { LoadError, Loading } from '@/components/StateViews';
import { getCardsByIds, getChallenge, getDeckCards, getDueCards, getLevel } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { pick, useLang } from '@/lib/i18n';
import { useOnline } from '@/lib/network';
import { setLastResult } from '@/lib/sessionResult';
import { recordAnswer, recordCompletion, recordSession } from '@/lib/sync';
import { makeStyles } from '@/lib/theme';
import type { Answer, Level, ReviewCard } from '@/lib/types';
import { layout, spacing, typography } from '@/theme';

type Params = { level?: string; mode?: string; track?: string; ids?: string };

export default function Review() {
  const styles = useStyles();
  const { t, lang } = useLang();
  const params = useLocalSearchParams<Params>();
  const { session, isGuest } = useAuth();
  const online = useOnline();
  const { width } = useWindowDimensions();

  const [cards, setCards] = useState<ReviewCard[] | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [hasChallenge, setHasChallenge] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);

  const counts = useRef({ known: 0, almost: 0, toReview: 0, retryIds: [] as number[], allOnline: true });
  const startedAt = useRef(new Date().toISOString());

  const levelId = params.level ? Number(params.level) : null;

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      if (levelId) {
        const [c, l, ch] = await Promise.all([getDeckCards(levelId), getLevel(levelId), getChallenge(levelId)]);
        setCards(c);
        setLevel(l);
        setHasChallenge(!!ch);
      } else if (params.mode === 'retry' && params.ids) {
        setCards(await getCardsByIds(params.ids.split(',').map(Number)));
      } else if (!isGuest) {
        setCards(await getDueCards(params.track ? Number(params.track) : undefined));
      } else {
        setCards([]);
      }
    } catch {
      setLoadError(true);
    }
  }, [levelId, params.mode, params.ids, params.track, isGuest]);

  useEffect(() => {
    load();
  }, [load]);

  const title = level
    ? pick(lang, level.title, level.title_en)
    : params.mode === 'retry'
      ? t.review.titleRetry
      : t.review.titleDue;
  const card = cards?.[index];
  const total = cards?.length ?? 0;

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  const answer = useCallback(
    async (a: Answer) => {
      if (!card || busy) return;
      setBusy(true);
      const c = counts.current;
      if (a === 'je_savais') c.known++;
      else {
        if (a === 'presque') c.almost++;
        else c.toReview++;
        c.retryIds.push(card.id);
      }

      const savedOnline = await recordAnswer(card.id, a, isGuest, card.level_id);
      if (!savedOnline) c.allOnline = false;

      if (index + 1 < total) {
        setIndex(index + 1);
        setFlipped(false);
        setBusy(false);
        return;
      }

      // Dernière carte : on enregistre la session puis on affiche les résultats.
      // Un deck est "terminé" quand on réussit son défi final ; s'il n'a pas de défi,
      // il est terminé dès qu'on a révisé toutes ses cartes.
      const deckRef =
        level && level.track_id && !hasChallenge
          ? { levelId: level.id, trackId: level.track_id, levelNumber: level.level_number }
          : null;
      let sessionOnline = false;
      if (!isGuest && session) {
        sessionOnline = await recordSession({
          userId: session.user.id,
          levelId,
          startedAt: startedAt.current,
          total,
          known: c.known,
          almost: c.almost,
          toReview: c.toReview,
          completedDeck: deckRef ? { trackId: deckRef.trackId, levelNumber: deckRef.levelNumber } : null,
        });
      } else if (deckRef) {
        await recordCompletion(deckRef, true, null);
      }
      setLastResult({
        trackSlug: card.trackSlug || null,
        levelId,
        total,
        known: c.known,
        almost: c.almost,
        toReview: c.toReview,
        retryIds: c.retryIds,
        savedOnline: !isGuest && c.allOnline && sessionOnline,
        hasChallenge: !!levelId && hasChallenge,
      });
      router.replace('/results');
    },
    [card, busy, index, total, isGuest, session, levelId, level, hasChallenge],
  );

  // Raccourcis clavier sur ordinateur : Espace = retourner, 1 / 2 / 3 = répondre
  useEffect(() => {
    if (Platform.OS !== 'web' || !card) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!flipped && e.key === ' ' && tag !== 'BUTTON' && target?.getAttribute?.('role') !== 'button') {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped && ['1', '2', '3'].includes(e.key)) {
        answer((['a_revoir', 'presque', 'je_savais'] as const)[Number(e.key) - 1]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [card, flipped, answer]);

  return (
    <Screen maxWidth={520}>
      <View style={styles.topBar}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t.review.quit}
          hitSlop={8}
          style={({ focused }: PressState) => [styles.close, focused && focusStyles.ring]}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text role="heading" aria-level={1} style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.counter} aria-label={total ? t.review.counter(index + 1, total) : undefined}>
          {total ? `${index + 1} / ${total}` : ''}
        </Text>
      </View>

      <ProgressBar value={total ? index / total : 0} label={t.review.progress(index, total)} />

      {!online && (
        <Alert
          type="warning"
          title={t.common.noConnectionTitle}
          message={isGuest ? t.review.offlineGuest : t.review.offlineMember}
        />
      )}

      {!cards && !loadError && <Loading label={t.review.loadingCards} />}
      {loadError && <LoadError onRetry={load} />}

      {cards && total === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t.review.emptyTitle}</Text>
          <Text style={styles.emptyText}>{t.review.emptyText}</Text>
          <Button label={t.review.seeTracks} onPress={() => router.replace('/parcours')} />
        </View>
      )}

      {card && (
        <>
          <View style={styles.spacer} />
          <FlashCard card={card} flipped={flipped} onFlip={() => setFlipped(true)} />
          <View style={styles.spacer} />

          {flipped ? (
            <AnswerButtons onAnswer={answer} disabled={busy} />
          ) : (
            <Button label={t.review.flip} variant="secondary" onPress={() => setFlipped(true)} />
          )}

          {Platform.OS === 'web' && width >= layout.wideBreakpoint && (
            <Text style={styles.shortcuts}>{t.review.shortcuts}</Text>
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
  title: { ...typography.label, color: c.text.primary, flex: 1, textAlign: 'center' },
  counter: { ...typography.label, color: c.text.secondary, minWidth: 44, textAlign: 'right' },
  spacer: { flexGrow: 1, minHeight: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h2, color: c.text.primary, textAlign: 'center' },
  emptyText: { ...typography.body, color: c.text.secondary, textAlign: 'center' },
  shortcuts: { ...typography.bodySmall, color: c.text.secondary, textAlign: 'center' },
}));
