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
