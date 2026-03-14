-- ============================================================
-- Contexta DB Schema
-- Supabase 대시보드 > SQL Editor 에서 이 파일 전체를 실행하세요.
-- ============================================================

-- =========================
--  1. users 테이블
-- =========================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  display_name text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  using (auth.uid() = id);

create policy "users_insert_own"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users_update_own"
  on public.users for update
  using (auth.uid() = id);

-- =========================
--  2. meetings 테이블
-- =========================
create table if not exists public.meetings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null default '',
  transcript  text not null default '',
  summary     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_meetings_user_id on public.meetings(user_id);

alter table public.meetings enable row level security;

create policy "meetings_select_own"
  on public.meetings for select
  using (auth.uid() = user_id);

create policy "meetings_insert_own"
  on public.meetings for insert
  with check (auth.uid() = user_id);

create policy "meetings_update_own"
  on public.meetings for update
  using (auth.uid() = user_id);

create policy "meetings_delete_own"
  on public.meetings for delete
  using (auth.uid() = user_id);
