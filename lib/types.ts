import type { Tables } from '@/types/supabase';

export type Track = Tables<'tracks'>;
export type Level = Tables<'levels'>;
export type Card = Tables<'cards'>;

// Les 3 réponses possibles (mêmes valeurs que dans la fonction record_review)
export type Answer = 'a_revoir' | 'presque' | 'je_savais';

// Un deck (= level) avec son nombre de cartes
export type Deck = Level & { cardCount: number };

// Statut d'un deck affiché dans la liste (badge)
export type DeckStatus = 'nouveau' | 'en_cours' | 'a_revoir' | 'maitrise' | 'verrouille' | 'reussi';

// Défi final d'un deck (jeu de cartes : construire un code)
export type Challenge = {
  id: number;
  level_id: number;
  prompt_fr: string;
  prompt_en: string | null;
  hint_fr: string | null;
  hint_en: string | null;
  code_before: string | null;
  code_after: string | null;
  pieces: string[];
  distractors: string[];
  ordered: boolean;
};

export type TrackOverview = Track & {
  decks: Deck[];
  cardsTotal: number;
  mastered: number;
  dueNow: number;
  // cartes déjà révisées au moins une fois (sert à la barre de progression)
  seen: number;
};

// Carte à réviser + infos du deck (pour l'étiquette "FLEXBOX · QUESTION")
export type ReviewCard = Card & { deckTitle: string; deckTitleEn: string | null; trackSlug: string };

// Résultat d'une session, transmis à l'écran Résultats
export type SessionResult = {
  trackSlug: string | null;
  levelId: number | null;
  total: number;
  known: number;
  almost: number;
  toReview: number;
  // cartes "Presque" + "À revoir" → bouton "Revoir les X cartes"
  retryIds: number[];
  savedOnline: boolean;
  // le deck révisé a un défi final → bouton "Relever le défi"
  hasChallenge: boolean;
};
