-- Kolumna właściciela ogłoszenia (konto schroniska w Supabase Auth).
-- Po wdrożeniu: nowe ogłoszenia dostają shelter_user_id z aplikacji;
-- opcjonalnie uzupełnij stare wiersze ręcznie, np.:
--   update public.animals set shelter_user_id = '<uuid>' where shelter_email = '...' and shelter_user_id is null;

alter table public.animals
  add column if not exists shelter_user_id uuid references auth.users (id) on delete set null;

create index if not exists animals_shelter_user_id_idx on public.animals (shelter_user_id);

comment on column public.animals.shelter_user_id is 'UUID konta schroniska, które utworzyło ogłoszenie.';
