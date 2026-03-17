create extension if not exists pgcrypto;

alter table if exists public.filmes_oscar rename to oscar_movies;
alter table if exists public.series_pessoais rename to personal_series;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null default '',
  created_at timestamptz not null default now()
);

alter table public.oscar_movies
  add column if not exists created_at timestamptz not null default now();

alter table public.oscar_movies
  add column if not exists plataforma_slug text;

create table if not exists public.user_oscar_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  oscar_movie_id uuid not null references public.oscar_movies(id) on delete cascade,
  status text not null default 'watchlist' check (status in ('watchlist', 'watched')),
  updated_at timestamptz not null default now(),
  unique (user_id, oscar_movie_id)
);

create table if not exists public.personal_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  titulo text not null,
  ano_lancamento integer,
  capa_url text,
  plataforma_slug text,
  status text not null default 'watchlist' check (status in ('watchlist', 'watched')),
  source text not null default 'manual' check (source in ('manual', 'oscar')),
  source_movie_id uuid references public.oscar_movies(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, source_movie_id)
);

alter table public.personal_series
  add column if not exists user_id uuid references public.app_users(id) on delete cascade;

alter table public.personal_series
  add column if not exists created_at timestamptz not null default now();

alter table public.personal_series
  add column if not exists temporada integer not null default 1;

alter table public.personal_series
  add column if not exists plataforma_slug text;

alter table public.personal_series
  add column if not exists status text not null default 'watching';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'oscar_movies'
      and column_name = 'status'
  ) then
    alter table public.oscar_movies drop column status;
  end if;
exception
  when undefined_column then null;
end $$;

alter table public.app_users enable row level security;
alter table public.oscar_movies enable row level security;
alter table public.user_oscar_movies enable row level security;
alter table public.personal_movies enable row level security;
alter table public.personal_series enable row level security;

drop policy if exists "public app users select" on public.app_users;
drop policy if exists "public app users insert" on public.app_users;
drop policy if exists "public oscar movies all" on public.oscar_movies;
drop policy if exists "public user oscar movies all" on public.user_oscar_movies;
drop policy if exists "public personal movies all" on public.personal_movies;
drop policy if exists "public personal series all" on public.personal_series;

create policy "public app users select"
on public.app_users for select
using (true);

create policy "public app users insert"
on public.app_users for insert
with check (true);

create policy "public oscar movies all"
on public.oscar_movies for all
using (true)
with check (true);

create policy "public user oscar movies all"
on public.user_oscar_movies for all
using (true)
with check (true);

create policy "public personal movies all"
on public.personal_movies for all
using (true)
with check (true);

create policy "public personal series all"
on public.personal_series for all
using (true)
with check (true);
