-- MERGED. — schema
-- Paste this whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- ── profiles ─────────────────────────────────────────────────────────
-- One row per person on the board. Bulky read-mostly blobs (the contribution
-- calendar, the language mix, their own repos) live as jsonb because nothing
-- ever queries inside them; the numbers the board sorts by are real columns.
create table if not exists profiles (
  login                 text primary key,
  name                  text not null,
  avatar                text,
  bio                   text,
  company               text,
  location              text,
  blog                  text,
  followers             integer not null default 0,
  public_repos          integer not null default 0,
  github_created_at     timestamptz,
  url                   text,

  total_stars           integer not null default 0,
  merged_total          integer not null default 0,
  upstream_total        integer not null default 0,
  upstream_owner_count  integer not null default 0,
  last90                integer not null default 0,

  orgs                  text[]  not null default '{}',
  langs                 jsonb   not null default '[]',
  days                  jsonb   not null default '[]',
  repos                 jsonb   not null default '[]',
  links                 jsonb   not null default '[]',

  score                 integer not null default 0,
  score_parts           jsonb   not null default '[]',

  -- ready | hidden | failed.  'hidden' is the opt-out: the row is kept so a
  -- removed person cannot be silently re-added by the next passer-by.
  status                text    not null default 'ready',
  source                text    not null default 'live',

  submitted_ip_hash     text,
  fetched_at            timestamptz not null default now(),
  created_at            timestamptz not null default now()
);

create index if not exists profiles_score_idx   on profiles (score desc);
create index if not exists profiles_status_idx  on profiles (status);
create index if not exists profiles_fetched_idx on profiles (fetched_at asc);

-- ── patches ──────────────────────────────────────────────────────────
-- Upstream pull requests, one row each. A real table rather than jsonb
-- because the wall queries across everybody at once.
create table if not exists patches (
  id         bigserial primary key,
  login      text not null references profiles(login) on delete cascade,
  repo       text not null,
  owner      text not null,
  number     integer not null,
  title      text not null,
  url        text not null,
  merged_at  timestamptz,
  unique (login, url)
);

create index if not exists patches_login_idx  on patches (login);
create index if not exists patches_merged_idx on patches (merged_at desc);

-- ── moderation + abuse ───────────────────────────────────────────────
create table if not exists removal_requests (
  id         bigserial primary key,
  login      text not null,
  reason     text,
  contact    text,
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id         bigserial primary key,
  ip_hash    text not null,
  login      text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_ip_idx on submissions (ip_hash, created_at desc);

-- ── sponsor inquiries ────────────────────────────────────────────────
-- Who asked about the four placements. There is no sponsors table on purpose:
-- the live sponsor is a hand-edited file in the repo, so "one sponsor at a
-- time" is enforced by there being exactly one slot to type into.
create table if not exists sponsor_inquiries (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  company_url text,
  message     text,
  ip_hash     text,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists sponsor_inquiries_created_idx
  on sponsor_inquiries (created_at desc);
-- The rate limit counts a sender's own recent rows rather than borrowing the
-- submissions ledger, which pairs an address with a GitHub handle and means
-- something else entirely.
create index if not exists sponsor_inquiries_ip_idx
  on sponsor_inquiries (ip_hash, created_at desc);

-- ── the wall ─────────────────────────────────────────────────────────
-- Strict date order lets whoever shipped most recently own the whole screen,
-- and one person merging a hundred patches buries everyone else. So deal the
-- wall in rounds: each pass takes each contributor's next-newest patch.
-- This is the SQL form of the round-robin the app used to do in memory.
create or replace function wall(limit_n integer default 60,
                               per_person integer default 12)
returns table (
  login text, name text, avatar text,
  repo text, owner text, number integer,
  title text, url text, merged_at timestamptz
)
language sql
stable
as $$
  select t.login, t.name, t.avatar, t.repo, t.owner,
         t.number, t.title, t.url, t.merged_at
  from (
    select pa.login, pr.name, pr.avatar, pa.repo, pa.owner,
           pa.number, pa.title, pa.url, pa.merged_at,
           row_number() over (
             partition by pa.login order by pa.merged_at desc nulls last
           ) as rn
    from patches pa
    join profiles pr on pr.login = pa.login
    where pr.status = 'ready'
  ) t
  where t.rn <= per_person
  order by t.rn asc, t.merged_at desc nulls last
  limit limit_n;
$$;

-- ── board totals ─────────────────────────────────────────────────────
create or replace function board_totals()
returns table (
  contributors bigint, upstream bigint, stars bigint, repos bigint
)
language sql
stable
as $$
  select
    (select count(*)                     from profiles where status = 'ready'),
    (select coalesce(sum(upstream_total),0)::bigint
                                         from profiles where status = 'ready'),
    (select coalesce(sum(total_stars),0)::bigint
                                         from profiles where status = 'ready'),
    (select count(distinct pa.repo)
       from patches pa
       join profiles pr on pr.login = pa.login
      where pr.status = 'ready');
$$;

-- ── lock everything down ─────────────────────────────────────────────
-- The app only ever reaches Supabase from the server with the service_role
-- key, which bypasses RLS. Enabling RLS with no policies means a leaked anon
-- key grants nothing at all.
alter table profiles         enable row level security;
alter table patches          enable row level security;
alter table removal_requests enable row level security;
alter table submissions      enable row level security;
alter table sponsor_inquiries enable row level security;
