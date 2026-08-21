-- Quiz Platform Supabase schema
-- Run this in Supabase SQL Editor once per project.

create extension if not exists pgcrypto;

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  max_students integer not null default 50 check (max_students > 0),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  closed_at timestamptz
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index >= 0),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_name text not null,
  email text,
  dob date,
  student_key text not null,
  session_id text not null unique,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score integer,
  total integer,
  percentage integer,
  answered_count integer,
  time_taken_ms integer,
  auto_submitted boolean not null default false,
  violations integer not null default 0,
  status text not null default 'active' check (status in ('active', 'submitted', 'reset')),
  unique (quiz_id, student_key)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_index integer not null,
  correct_index integer not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists quizzes_status_created_idx on public.quizzes(status, created_at desc);
create index if not exists questions_quiz_position_idx on public.questions(quiz_id, position);
create index if not exists attempts_quiz_status_idx on public.attempts(quiz_id, status);
create index if not exists attempts_student_key_idx on public.attempts(student_key);

-- ============================================================================
--  V2 — running several quizzes at once (added for Utkarsh 2026)
--
--  The platform was built around ONE globally active quiz. Utkarsh needs three
--  running side by side, one per class group, so a quiz now belongs to a lane:
--
--      event       'utkarsh', or null for an ordinary standalone quiz
--      group_code  'A' | 'B' | 'C' within that event
--      stage       1 today; a later prelim/final split needs no migration
--      slug        stable id for a URL, e.g. 'utkarsh-2026-a'
--
--  Publishing now closes only the quizzes in the SAME lane. Quizzes with no
--  event keep the old behaviour exactly — one global active slot — so nothing
--  already deployed changes, and publishing an ordinary quiz can no longer
--  knock the three Utkarsh quizzes offline.
--
--  Every statement here is additive and safe to re-run on the live database.
-- ============================================================================

alter table public.quizzes add column if not exists event text;
alter table public.quizzes add column if not exists group_code text;
alter table public.quizzes add column if not exists slug text;
alter table public.quizzes add column if not exists stage integer not null default 1;

-- The school a student attends. Replaces email as the thing that makes two
-- students of the same name distinguishable — see student_key in api/start.js.
alter table public.attempts add column if not exists school text;

-- Partial, so the many existing quizzes with a null slug do not collide.
create unique index if not exists quizzes_slug_idx
  on public.quizzes(slug) where slug is not null;

create index if not exists quizzes_lane_idx
  on public.quizzes(event, group_code, stage, status);
