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
--  1-b. users 사용 시간 제한 컬럼
-- =========================
alter table public.users
  add column if not exists used_seconds  integer not null default 0,
  add column if not exists limit_seconds integer not null default 3600;

-- used_seconds 원자적 증가 함수 (타이머에서 호출)
create or replace function public.increment_used_seconds(uid uuid, delta integer)
returns void
language sql
security definer
as $$
  update public.users
  set used_seconds = used_seconds + delta
  where id = uid;
$$;

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

-- =========================
--  3. projects 테이블 (폴더)
-- =========================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_projects_user_id on public.projects(user_id);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- =========================
--  4. meetings ↔ projects 연결
-- =========================
alter table public.meetings
  add column if not exists project_id uuid references public.projects(id) on delete set null;

create index if not exists idx_meetings_project_id on public.meetings(project_id);

-- =========================
--  5. custom_words 테이블 (나만의 용어 사전)
-- =========================
create table if not exists public.custom_words (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  word        text not null,
  description text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists idx_custom_words_user_id on public.custom_words(user_id);

alter table public.custom_words enable row level security;

create policy "custom_words_select_own"
  on public.custom_words for select
  using (auth.uid() = user_id);

create policy "custom_words_insert_own"
  on public.custom_words for insert
  with check (auth.uid() = user_id);

create policy "custom_words_update_own"
  on public.custom_words for update
  using (auth.uid() = user_id);

create policy "custom_words_delete_own"
  on public.custom_words for delete
  using (auth.uid() = user_id);
