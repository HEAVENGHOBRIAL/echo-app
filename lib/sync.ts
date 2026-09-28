// Enregistrement des réponses : en ligne, hors ligne (file d'attente) ou en mode invité (local).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import type { Answer } from '@/lib/types';

const QUEUE_KEY = 'echo.pendingOps';

// Une action à envoyer à Supabase (tout de suite, ou plus tard si pas de réseau)
type Op =
  | { type: 'review'; cardId: number; answer: Answer }
  | {
      type: 'session';
      userId: string;
      levelId: number | null;
      startedAt: string;
      finishedAt: string;
      total: number;
      known: number;
      almost: number;
      toReview: number;
    }
  | { type: 'completion'; userId: string; levelId: number; trackId: number; levelNumber: number };

// ---------- Réseau ----------

// Erreur de réseau (pas de connexion) ≠ erreur Supabase (droits, données…)
function isNetworkError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return !error.code && /fetch|network|timeout|offline/i.test(error.message ?? '');
}

async function runOp(op: Op) {
  if (op.type === 'review') {
    const { error } = await supabase.rpc('record_review', { p_card_id: op.cardId, p_answer: op.answer });
    return error;
  }
  if (op.type === 'session') {
    const { error } = await supabase.from('review_sessions').insert({
      user_id: op.userId,
      level_id: op.levelId,
      started_at: op.startedAt,
      finished_at: op.finishedAt,
      cards_total: op.total,
      known_count: op.known,
      almost_count: op.almost,
      to_review_count: op.toReview,
    });
    return error;
  }
  // Deck terminé → level_completions + niveau actuel du parcours
  const { error } = await supabase
    .from('level_completions')
    .upsert({ user_id: op.userId, level_id: op.levelId }, { onConflict: 'user_id,level_id', ignoreDuplicates: true });
  if (error) return error;

  const { data: progress } = await supabase
    .from('user_progress')
    .select('current_level')
    .eq('user_id', op.userId)
    .eq('track_id', op.trackId)
    .maybeSingle();
  if ((progress?.current_level ?? 0) <= op.levelNumber) {
    const { error: pErr } = await supabase
      .from('user_progress')
      .upsert(
        { user_id: op.userId, track_id: op.trackId, current_level: op.levelNumber + 1 },
        { onConflict: 'user_id,track_id' },
      );
    return pErr;
  }
  return null;
}

// ---------- File d'attente hors ligne ----------

async function readQueue(): Promise<Op[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) ?? '[]');
  } catch {
    return [];
  }
}

async function addToQueue(op: Op) {
  const queue = await readQueue();
  queue.push(op);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue)).catch(() => {});
}

export async function pendingCount() {
  return (await readQueue()).length;
}

// Essaie d'envoyer une action ; si pas de réseau, on la garde pour plus tard.
// Renvoie true si c'est enregistré en ligne.
async function sendOrQueue(op: Op): Promise<boolean> {
  const error = await runOp(op).catch((e: Error) => ({ message: e.message, code: undefined }));
  if (!error) return true;
  if (isNetworkError(error)) {
    await addToQueue(op);
  } else {
    console.warn('Echo : enregistrement refusé', error);
  }
  return false;
}

let flushing = false;

// Renvoie les actions en attente (appelé au retour du réseau / à la connexion)
export async function flushQueue() {
  if (flushing) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  flushing = true;
  try {
    const queue = await readQueue();
    const remaining: Op[] = [];
    for (let i = 0; i < queue.length; i++) {
      const error = await runOp(queue[i]).catch((e: Error) => ({ message: e.message, code: undefined }));
      if (error && isNetworkError(error)) {
        // Toujours pas de réseau : on garde celle-ci et toutes les suivantes
        remaining.push(...queue.slice(i));
        break;
      }
    }
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)).catch(() => {});
  } finally {
    flushing = false;
  }
}

// ---------- API utilisée par les écrans ----------

export async function recordAnswer(cardId: number, answer: Answer, guest: boolean, levelId: number | null) {
  if (guest) {
    saveGuestAnswer(cardId, answer, levelId);
    return false;
  }
  return sendOrQueue({ type: 'review', cardId, answer });
}

export async function recordSession(params: {
  userId: string;
  levelId: number | null;
  startedAt: string;
  total: number;
  known: number;
  almost: number;
  toReview: number;
  completedDeck: { trackId: number; levelNumber: number } | null;
}): Promise<boolean> {
  const { completedDeck, ...s } = params;
  let online = await sendOrQueue({ type: 'session', ...s, finishedAt: new Date().toISOString() });
  if (completedDeck && s.levelId) {
    online =
      (await sendOrQueue({ type: 'completion', userId: s.userId, levelId: s.levelId, ...completedDeck })) && online;
  }
  return online;
}

// ---------- Mode invité ----------

// Les réponses de l'invitée restent EN MÉMOIRE seulement :
// fermer l'app (ou quitter le mode invité) efface tout, on repart de zéro.
type GuestAnswer = { answer: Answer; levelId: number | null };
const guestAnswers = new Map<number, GuestAnswer>();

function saveGuestAnswer(cardId: number, answer: Answer, levelId: number | null) {
  guestAnswers.set(cardId, { answer, levelId });
}

// Nombre de cartes révisées par deck (sert aux barres de progression en mode invité)
export function getGuestProgress() {
  const byLevel: Record<number, number> = {};
  for (const { levelId } of guestAnswers.values()) {
    if (levelId) byLevel[levelId] = (byLevel[levelId] ?? 0) + 1;
  }
  return { total: guestAnswers.size, byLevel };
}

// Défis réussis par l'invitée (en mémoire aussi)
type DeckRef = { levelId: number; trackId: number; levelNumber: number };
const guestCompleted = new Map<number, DeckRef>();

export function getGuestCompleted() {
  return [...guestCompleted.keys()];
}

export function clearGuestAnswers() {
  guestAnswers.clear();
  guestCompleted.clear();
}

// Défi final réussi → le deck est terminé et le suivant se débloque
export async function recordCompletion(deck: DeckRef, guest: boolean, userId: string | null) {
  if (guest || !userId) {
    guestCompleted.set(deck.levelId, deck);
    return false;
  }
  return sendOrQueue({ type: 'completion', userId, ...deck });
}

// Après l'inscription / la connexion : on importe les réponses et les défis de l'invitée dans le compte
export async function importGuestAnswers() {
  const answers = [...guestAnswers.entries()];
  const completions = [...guestCompleted.values()];
  if (answers.length === 0 && completions.length === 0) return;
  // On vide d'abord pour ne jamais importer deux fois
  clearGuestAnswers();
  for (const [cardId, { answer }] of answers) {
    await sendOrQueue({ type: 'review', cardId, answer });
  }
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  for (const deck of completions) {
    await sendOrQueue({ type: 'completion', userId: data.user.id, ...deck });
  }
}
