-- Właściciel wniosku z perspektywy schroniska (konto, które zarządza pupilem).
-- Nowe wnioski dostają shelter_user_id z aplikacji (zwierzę.shelter_user_id).

alter table public.applications
  add column if not exists shelter_user_id uuid references auth.users (id) on delete set null;

create index if not exists applications_shelter_user_id_idx on public.applications (shelter_user_id);

comment on column public.applications.shelter_user_id is 'UUID konta schroniska będącego właścicielem zwierzęcia w momencie złożenia wniosku.';
