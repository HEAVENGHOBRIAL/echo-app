// Fonctions de l'espace admin : créer / modifier / supprimer des decks et des cartes.
// La sécurité est aussi garantie côté Supabase : seules les personnes avec
// profiles.is_admin = true ont le droit d'écrire (policies "Admin write access").
import type { Dict } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { Card, Level } from '@/lib/types';

// ---------- Decks ----------

export type DeckInput = {
  title: string;
  description: string;
  title_en: string | null;
  description_en: string | null;
  is_demo: boolean;
};

export async function createDeck(trackId: number, input: DeckInput): Promise<Level> {
  // Le nouveau deck se place après le dernier deck du parcours
  const { data: last } = await supabase
    .from('levels')
    .select('level_number')
    .eq('track_id', trackId)
    .order('level_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (input.is_demo) await clearOtherDemo();
  const { data, error } = await supabase
    .from('levels')
    .insert({ track_id: trackId, level_number: (last?.level_number ?? 0) + 1, ...input })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDeck(id: number, input: DeckInput) {
  if (input.is_demo) await clearOtherDemo(id);
  const { error } = await supabase.from('levels').update(input).eq('id', id);
  if (error) throw error;
}

// Un seul deck démo à la fois (c'est lui que voit le mode invité)
async function clearOtherDemo(exceptId?: number) {
  let query = supabase.from('levels').update({ is_demo: false }).eq('is_demo', true);
  if (exceptId) query = query.neq('id', exceptId);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteDeck(id: number) {
  const { error } = await supabase.from('levels').delete().eq('id', id);
  if (error) throw error;
}

// ---------- Cartes ----------

export async function getAdminCards(levelId: number): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('level_id', levelId)
    .order('card_order');
  if (error) throw error;
  return data ?? [];
}

export async function getCard(id: number): Promise<Card | null> {
  const { data, error } = await supabase.from('cards').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export type CardInput = {
  front: string;
  front_en: string | null;
  code_snippet: string;
  explanation_fr: string;
  explanation_en: string | null;
};

export async function createCard(levelId: number, input: CardInput) {
  const { data: last } = await supabase
    .from('cards')
    .select('card_order')
    .eq('level_id', levelId)
    .order('card_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from('cards')
    .insert({ level_id: levelId, card_order: (last?.card_order ?? 0) + 1, ...input });
  if (error) throw error;
}

export async function updateCard(id: number, input: CardInput) {
  const { error } = await supabase.from('cards').update(input).eq('id', id);
  if (error) throw error;
}

export async function deleteCard(id: number) {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
}

// Échange la place de deux cartes (flèches ↑ ↓)
export async function swapCards(a: Card, b: Card) {
  const [r1, r2] = await Promise.all([
    supabase.from('cards').update({ card_order: b.card_order }).eq('id', a.id),
    supabase.from('cards').update({ card_order: a.card_order }).eq('id', b.id),
  ]);
  if (r1.error) throw r1.error;
  if (r2.error) throw r2.error;
}

// Message lisible pour les erreurs Supabase les plus courantes
export function adminErrorMessage(error: unknown, t: Dict) {
  const e = error as { code?: string; message?: string };
  if (e?.code === '23503') return t.admin.errFk;
  if (e?.code === '42501') return t.admin.errRights;
  return t.admin.errGeneric;
}
