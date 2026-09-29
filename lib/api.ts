// Toutes les lectures Supabase de l'app, au même endroit.
import { supabase } from '@/lib/supabase';
import type { Challenge, Deck, DeckStatus, ReviewCard, TrackOverview } from '@/lib/types';

// ---------- Parcours & decks ----------

type ReviewRow = { card_id: number; due_at: string; level_id: number | null };

// Réponses de l'utilisatrice (≤ 98 lignes : on peut tout charger d'un coup)
async function getMyReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('card_reviews')
    .select('card_id, due_at, cards(level_id)');
  if (error) throw error;
  return (data ?? []).map((r) => ({
    card_id: r.card_id,
    due_at: r.due_at,
    level_id: r.cards?.level_id ?? null,
  }));
}

export async function getDecks(trackId?: number): Promise<Deck[]> {
  let query = supabase.from('levels').select('*, cards(count)').order('level_number');
  if (trackId) query = query.eq('track_id', trackId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(({ cards, ...level }) => ({
    ...level,
    cardCount: cards?.[0]?.count ?? 0,
  }));
}

// Les 3 parcours avec leurs decks et, si connectée, la progression
export async function getTracksOverview(signedIn: boolean): Promise<TrackOverview[]> {
  const [tracksRes, decks, statsRes, reviews] = await Promise.all([
    supabase.from('tracks').select('*').order('sort_order'),
    getDecks(),
    signedIn ? supabase.from('track_stats').select('*') : Promise.resolve({ data: [], error: null }),
    signedIn ? getMyReviews() : Promise.resolve([] as ReviewRow[]),
  ]);
  if (tracksRes.error) throw tracksRes.error;
  if (statsRes.error) throw statsRes.error;

  return (tracksRes.data ?? []).map((track) => {
    const trackDecks = decks.filter((d) => d.track_id === track.id);
    const levelIds = new Set(trackDecks.map((d) => d.id));
    const stats = statsRes.data?.find((s) => s.track_id === track.id);
    return {
      ...track,
      decks: trackDecks,
      cardsTotal: trackDecks.reduce((sum, d) => sum + d.cardCount, 0),
      mastered: stats?.mastered ?? 0,
      dueNow: stats?.due_now ?? 0,
      seen: reviews.filter((r) => r.level_id !== null && levelIds.has(r.level_id)).length,
    };
  });
}

export type TrackDetail = TrackOverview & {
  deckStatus: Record<number, DeckStatus>;
  // decks dont le défi final est réussi
  completed: Set<number>;
  // decks accessibles (le 1er de chaque parcours, puis ceux dont le défi précédent est réussi)
  unlocked: Set<number>;
  // decks qui ont un défi final
  withChallenge: Set<number>;
};

// Decks terminés (défi réussi) par l'utilisatrice connectée
export async function getCompletedLevels(): Promise<number[]> {
  const { data, error } = await supabase.from('level_completions').select('level_id');
  if (error) throw error;
  return (data ?? []).map((r) => r.level_id).filter((id): id is number => id !== null);
}

async function getChallengeLevelIds(): Promise<number[]> {
  const { data, error } = await supabase.from('level_challenges').select('level_id');
  if (error) throw error;
  return (data ?? []).map((r) => r.level_id);
}

// Règle de progression : un deck est ouvert si c'est le 1er du parcours,
// si le deck juste avant est terminé (défi final réussi), si c'est le deck démo,
// ou s'il est lui-même déjà terminé (un deck réussi ne se re-verrouille jamais).
export function computeUnlocked(decks: Deck[], completed: Set<number>) {
  const sorted = [...decks].sort((a, b) => a.level_number - b.level_number);
  const unlocked = new Set<number>();
  sorted.forEach((deck, i) => {
    if (i === 0 || deck.is_demo || completed.has(deck.id) || completed.has(sorted[i - 1].id)) unlocked.add(deck.id);
  });
  return unlocked;
}

export async function getTrackDetail(
  slug: string,
  signedIn: boolean,
  guest: { completed: number[]; seenByLevel: Record<number, number> } = { completed: [], seenByLevel: {} },
): Promise<TrackDetail | null> {
  const [tracks, reviews, completedIds, challengeIds] = await Promise.all([
    getTracksOverview(signedIn),
    signedIn ? getMyReviews() : Promise.resolve([] as ReviewRow[]),
    signedIn ? getCompletedLevels() : Promise.resolve(guest.completed),
    getChallengeLevelIds(),
  ]);
  const track = tracks.find((t) => t.slug === slug);
  if (!track) return null;

  const completed = new Set(completedIds);
  const unlocked = computeUnlocked(track.decks, completed);
  const now = Date.now();
  const deckStatus: Record<number, DeckStatus> = {};

  for (const deck of track.decks) {
    const deckReviews = reviews.filter((r) => r.level_id === deck.id);
    const seen = signedIn ? deckReviews.length : (guest.seenByLevel[deck.id] ?? 0);
    const due = deckReviews.filter((r) => new Date(r.due_at).getTime() <= now).length;

    if (!unlocked.has(deck.id)) deckStatus[deck.id] = 'verrouille';
    else if (due > 0) deckStatus[deck.id] = 'a_revoir';
    else if (completed.has(deck.id)) deckStatus[deck.id] = 'reussi';
    else if (seen === 0) deckStatus[deck.id] = 'nouveau';
    else if (seen >= deck.cardCount) deckStatus[deck.id] = 'maitrise';
    else deckStatus[deck.id] = 'en_cours';
  }
  return { ...track, deckStatus, completed, unlocked, withChallenge: new Set(challengeIds) };
}

export async function getChallenge(levelId: number): Promise<Challenge | null> {
  const { data, error } = await supabase.from('level_challenges').select('*').eq('level_id', levelId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    pieces: (data.pieces as string[]) ?? [],
    distractors: (data.distractors as string[]) ?? [],
  };
}

export async function getDemoDeck(): Promise<Deck | null> {
  const { data, error } = await supabase
    .from('levels')
    .select('*, cards(count)')
    .eq('is_demo', true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { cards, ...level } = data;
  return { ...level, cardCount: cards?.[0]?.count ?? 0 };
}

export async function getTrackSlug(trackId: number | null): Promise<string> {
  if (!trackId) return '';
  const { data, error } = await supabase.from('tracks').select('slug').eq('id', trackId).maybeSingle();
  if (error) throw error;
  return data?.slug ?? '';
}

export async function getLevel(levelId: number) {
  const { data, error } = await supabase.from('levels').select('*').eq('id', levelId).maybeSingle();
  if (error) throw error;
  return data;
}

// ---------- Cartes à réviser ----------

const CARD_WITH_DECK = '*, levels(title, title_en, track_id, tracks(slug))';

type CardWithDeck = {
  id: number;
  level_id: number | null;
  card_order: number | null;
  front: string | null;
  front_en: string | null;
  code_snippet: string | null;
  explanation_fr: string | null;
  explanation_en: string | null;
  levels: {
    title: string | null;
    title_en: string | null;
    track_id: number | null;
    tracks: { slug: string } | null;
  } | null;
};

function toReviewCard(c: CardWithDeck): ReviewCard {
  const { levels, ...card } = c;
  return {
    ...card,
    deckTitle: levels?.title ?? '',
    deckTitleEn: levels?.title_en ?? null,
    trackSlug: levels?.tracks?.slug ?? '',
  };
}

export async function getDeckCards(levelId: number): Promise<ReviewCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select(CARD_WITH_DECK)
    .eq('level_id', levelId)
    .order('card_order');
  if (error) throw error;
  return ((data ?? []) as CardWithDeck[]).map(toReviewCard);
}

export async function getCardsByIds(ids: number[]): Promise<ReviewCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('cards').select(CARD_WITH_DECK).in('id', ids);
  if (error) throw error;
  const cards = ((data ?? []) as CardWithDeck[]).map(toReviewCard);
  // On garde l'ordre demandé
  return ids.map((id) => cards.find((c) => c.id === id)).filter((c): c is ReviewCard => !!c);
}

// Cartes dont la date de révision est passée (option : un seul parcours)
export async function getDueCards(trackId?: number): Promise<ReviewCard[]> {
  const { data, error } = await supabase
    .from('card_reviews')
    .select(`due_at, cards(${CARD_WITH_DECK})`)
    .lte('due_at', new Date().toISOString())
    .order('due_at');
  if (error) throw error;
  return (data ?? [])
    .map((r) => r.cards as CardWithDeck | null)
    .filter((c): c is CardWithDeck => !!c)
    .filter((c) => !trackId || c.levels?.track_id === trackId)
    .map(toReviewCard);
}

// ---------- Profil, série, stats ----------

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, email, is_admin')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateDisplayName(userId: string, displayName: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId);
  if (error) throw error;
}

export async function getStreak(): Promise<number> {
  const { data, error } = await supabase.rpc('get_streak');
  if (error) throw error;
  return data ?? 0;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// 7 derniers jours (du plus ancien à aujourd'hui) : true = au moins une session terminée
export async function getWeekActivity(): Promise<boolean[]> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  const { data, error } = await supabase
    .from('review_sessions')
    .select('finished_at')
    .not('finished_at', 'is', null)
    .gte('finished_at', start.toISOString());
  if (error) throw error;

  const active = new Set((data ?? []).map((s) => dayKey(new Date(s.finished_at!))));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return active.has(dayKey(d));
  });
}

export async function getRecentSessions(limit = 5) {
  const { data, error } = await supabase
    .from('review_sessions')
    .select('id, finished_at, cards_total, known_count, almost_count, to_review_count, levels(title, title_en)')
    .not('finished_at', 'is', null)
    .order('finished_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getReviewTotals() {
  const { data, error } = await supabase.from('card_reviews').select('review_count');
  if (error) throw error;
  const rows = data ?? [];
  return {
    cardsSeen: rows.length,
    reviewsDone: rows.reduce((sum, r) => sum + (r.review_count ?? 0), 0),
  };
}
