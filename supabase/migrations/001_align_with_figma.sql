-- Echo : aligne la base existante sur les maquettes Figma.
-- Additif uniquement (aucune colonne/table supprimée), relançable sans risque.

-- Parcours : infos d'affichage (« PHP · SQL », pastille colorée)
alter table public.tracks add column if not exists subtitle text;
alter table public.tracks add column if not exists badge text;
alter table public.tracks add column if not exists color text;

-- Levels = « Decks » dans le Figma (Flexbox, Grid, Balises sémantiques…)
alter table public.levels add column if not exists title text;

-- Cartes : recto (question) + verso (réponse, code, explication)
alter table public.cards add column if not exists question_fr text;
alter table public.cards add column if not exists answer text;

-- Profil : prénom (« Salut, Heaven »)
alter table public.profiles add column if not exists first_name text;

-- Révisions : dernier état de chaque carte par utilisateur (répétition espacée)
-- rating : 0 = À revoir, 1 = Presque, 2 = Je savais
create table if not exists public.card_reviews (
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id integer not null references public.cards (id) on delete cascade,
  rating smallint not null check (rating between 0 and 2),
  interval_days integer not null default 0,
  due_at timestamptz not null default now(),
  reviewed_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

-- Jours de révision : sert à calculer la série (« 5 jours »)
create table if not exists public.review_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default current_date,
  cards_reviewed integer not null default 0,
  primary key (user_id, day)
);

alter table public.card_reviews enable row level security;
alter table public.review_days enable row level security;

drop policy if exists "own card_reviews" on public.card_reviews;
create policy "own card_reviews" on public.card_reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own review_days" on public.review_days;
create policy "own review_days" on public.review_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
