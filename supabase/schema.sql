-- RECLAIM 122 — Supabase schema + Row Level Security
-- Run this once in the Supabase SQL editor for your private project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.

-- ============================================================
-- 1. MISSIONS
-- ============================================================
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  timezone text not null default 'UTC',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  constraint missions_valid_range check (end_date > start_date)
);

-- ============================================================
-- 2. DAY RECORDS  (one per mission per date)
-- ============================================================
create table if not exists day_records (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  overall_status text not null default 'not_recorded'
    check (overall_status in ('green', 'blue', 'red', 'yellow', 'not_recorded')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, date)
);

-- ============================================================
-- 3. GOAL RECORDS  (one per goal per day)
-- ============================================================
create table if not exists goal_records (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references day_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null check (goal in ('discipline', 'fitness', 'pm', 'python')),
  status text not null check (status in ('green', 'blue', 'red', 'yellow')),
  discipline_porn_free boolean, -- only meaningful when goal = 'discipline'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day_id, goal)
);

-- ============================================================
-- 4. GOAL-SPECIFIC DATA TABLES
-- ============================================================
create table if not exists fitness_data (
  goal_record_id uuid primary key references goal_records(id) on delete cascade,
  workout_done boolean not null default false,
  steps integer check (steps is null or steps >= 0),
  weight numeric(6,2) check (weight is null or weight > 0)
);

create table if not exists pm_data (
  goal_record_id uuid primary key references goal_records(id) on delete cascade,
  meaningful_progress text not null default 'not_done'
    check (meaningful_progress in ('done', 'partial', 'not_done')),
  application_count integer not null default 0 check (application_count >= 0)
);

create table if not exists python_data (
  goal_record_id uuid primary key references goal_records(id) on delete cascade,
  meaningful_progress text not null default 'not_done'
    check (meaningful_progress in ('done', 'partial', 'not_done')),
  learning_minutes integer not null default 0 check (learning_minutes >= 0)
);

create table if not exists excuse_data (
  goal_record_id uuid primary key references goal_records(id) on delete cascade,
  reason text not null check (reason in ('travel', 'illness', 'family', 'work', 'emergency', 'other'))
);

-- ============================================================
-- 5. INDEXES
-- ============================================================
create index if not exists idx_day_records_mission_date on day_records (mission_id, date);
create index if not exists idx_goal_records_day on goal_records (day_id);
create index if not exists idx_missions_user on missions (user_id);

-- ============================================================
-- 6. updated_at trigger
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_day_records_updated_at on day_records;
create trigger trg_day_records_updated_at before update on day_records
  for each row execute function set_updated_at();

drop trigger if exists trg_goal_records_updated_at on goal_records;
create trigger trg_goal_records_updated_at before update on goal_records
  for each row execute function set_updated_at();

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- Every table is scoped to auth.uid() = user_id (or joined through it).
-- ============================================================
alter table missions enable row level security;
alter table day_records enable row level security;
alter table goal_records enable row level security;
alter table fitness_data enable row level security;
alter table pm_data enable row level security;
alter table python_data enable row level security;
alter table excuse_data enable row level security;

drop policy if exists "own missions" on missions;
create policy "own missions" on missions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own day_records" on day_records;
create policy "own day_records" on day_records for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own goal_records" on goal_records;
create policy "own goal_records" on goal_records for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own fitness_data" on fitness_data;
create policy "own fitness_data" on fitness_data for all
  using (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()))
  with check (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()));

drop policy if exists "own pm_data" on pm_data;
create policy "own pm_data" on pm_data for all
  using (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()))
  with check (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()));

drop policy if exists "own python_data" on python_data;
create policy "own python_data" on python_data for all
  using (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()))
  with check (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()));

drop policy if exists "own excuse_data" on excuse_data;
create policy "own excuse_data" on excuse_data for all
  using (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()))
  with check (exists (select 1 from goal_records g where g.id = goal_record_id and g.user_id = auth.uid()));

-- ============================================================
-- 8. Seed the RECLAIM 122 mission for the signed-in user.
-- Run this manually AFTER you've signed in once via magic link, so auth.uid() resolves.
-- (Run as the authenticated user via the app, or paste your user id below.)
-- ============================================================
-- insert into missions (user_id, name, start_date, end_date, timezone)
-- values (auth.uid(), 'RECLAIM 122', '2026-09-01', '2026-12-31', 'UTC')
-- on conflict do nothing;
