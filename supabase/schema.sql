-- RECLAIM 122 — Supabase schema + Row Level Security
--
-- Private personal deployment.
-- Run this once in the Supabase SQL editor.
--
-- IMPORTANT:
-- This schema ensures one user can have only one RECLAIM 122 mission.

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
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  constraint missions_valid_range check (end_date > start_date)
);

-- One user can have only one mission with a given name.
-- This prevents duplicate RECLAIM 122 missions.
create unique index if not exists ux_missions_user_name
  on missions (user_id, name);


-- ============================================================
-- 2. DAY RECORDS
-- One record per mission per date.
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
-- 3. GOAL RECORDS
-- One record per goal per day.
-- ============================================================

create table if not exists goal_records (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references day_records(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  goal text not null
    check (goal in ('discipline', 'fitness', 'pm', 'python')),
  status text not null
    check (status in ('green', 'blue', 'red', 'yellow')),
  discipline_porn_free boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day_id, goal)
);


-- ============================================================
-- 4. GOAL-SPECIFIC DATA TABLES
-- ============================================================

create table if not exists fitness_data (
  goal_record_id uuid primary key
    references goal_records(id) on delete cascade,
  workout_done boolean not null default false,
  steps integer
    check (steps is null or steps >= 0),
  weight numeric(6,2)
    check (weight is null or weight > 0)
);


create table if not exists pm_data (
  goal_record_id uuid primary key
    references goal_records(id) on delete cascade,
  meaningful_progress text not null default 'not_done'
    check (meaningful_progress in ('done', 'partial', 'not_done')),
  application_count integer not null default 0
    check (application_count >= 0)
);


create table if not exists python_data (
  goal_record_id uuid primary key
    references goal_records(id) on delete cascade,
  meaningful_progress text not null default 'not_done'
    check (meaningful_progress in ('done', 'partial', 'not_done')),
  learning_minutes integer not null default 0
    check (learning_minutes >= 0)
);


create table if not exists excuse_data (
  goal_record_id uuid primary key
    references goal_records(id) on delete cascade,
  reason text not null
    check (reason in ('travel', 'illness', 'family', 'work', 'emergency', 'other'))
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

create index if not exists idx_day_records_mission_date
  on day_records (mission_id, date);

create index if not exists idx_goal_records_day
  on goal_records (day_id);

create index if not exists idx_missions_user
  on missions (user_id);


-- ============================================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================================

create or replace function set_updated_at()
returns trigger
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


drop trigger if exists trg_day_records_updated_at on day_records;

create trigger trg_day_records_updated_at
before update on day_records
for each row
execute function set_updated_at();


drop trigger if exists trg_goal_records_updated_at on goal_records;

create trigger trg_goal_records_updated_at
before update on goal_records
for each row
execute function set_updated_at();


-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

alter table missions enable row level security;
alter table day_records enable row level security;
alter table goal_records enable row level security;
alter table fitness_data enable row level security;
alter table pm_data enable row level security;
alter table python_data enable row level security;
alter table excuse_data enable row level security;


-- ------------------------------------------------------------
-- MISSIONS
-- ------------------------------------------------------------

drop policy if exists "own missions" on missions;

create policy "own missions"
on missions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- DAY RECORDS
-- ------------------------------------------------------------

drop policy if exists "own day_records" on day_records;

create policy "own day_records"
on day_records
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- GOAL RECORDS
-- ------------------------------------------------------------

drop policy if exists "own goal_records" on goal_records;

create policy "own goal_records"
on goal_records
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- ------------------------------------------------------------
-- FITNESS DATA
-- ------------------------------------------------------------

drop policy if exists "own fitness_data" on fitness_data;

create policy "own fitness_data"
on fitness_data
for all
using (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- PM DATA
-- ------------------------------------------------------------

drop policy if exists "own pm_data" on pm_data;

create policy "own pm_data"
on pm_data
for all
using (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- PYTHON DATA
-- ------------------------------------------------------------

drop policy if exists "own python_data" on python_data;

create policy "own python_data"
on python_data
for all
using (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
);


-- ------------------------------------------------------------
-- EXCUSE DATA
-- ------------------------------------------------------------

drop policy if exists "own excuse_data" on excuse_data;

create policy "own excuse_data"
on excuse_data
for all
using (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from goal_records g
    where g.id = goal_record_id
      and g.user_id = auth.uid()
  )
);


-- ============================================================
-- 8. OPTIONAL MANUAL SEED
-- ============================================================
--
-- Normally the application creates the mission automatically
-- after the user signs in.
--
-- If you ever need to manually create it:
--
-- insert into missions (
--   user_id,
--   name,
--   start_date,
--   end_date,
--   timezone
-- )
-- values (
--   auth.uid(),
--   'RECLAIM 122',
--   '2026-09-01',
--   '2026-12-31',
--   'UTC'
-- )
-- on conflict (user_id, name) do nothing;