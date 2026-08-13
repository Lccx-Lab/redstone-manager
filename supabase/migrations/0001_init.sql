-- REDSTONEオンライン 装備・タスク管理ツール 初期スキーマ
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

create extension if not exists pgcrypto;

create type equipment_slot as enum (
  'weapon', 'sub_weapon', 'neck', 'head', 'back_ear', 'waist', 'hands', 'armor', 'feet', 'ring'
);

-- ============ accounts ============
create table accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  memo text,
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;

create policy "accounts_owner_all" on accounts
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============ characters ============
create table characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  name text not null,
  job text,
  memo text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index characters_account_id_idx on characters(account_id);

alter table characters enable row level security;

create policy "characters_owner_all" on characters
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============ character_equipment ============
create table character_equipment (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  slot equipment_slot not null,
  ring_index integer not null default 0,
  item_name text,
  memo text,
  updated_at timestamptz not null default now(),
  constraint ring_index_range check (
    (slot = 'ring' and ring_index between 1 and 10)
    or (slot <> 'ring' and ring_index = 0)
  ),
  unique (character_id, slot, ring_index)
);

create index character_equipment_character_id_idx on character_equipment(character_id);

alter table character_equipment enable row level security;

create policy "character_equipment_owner_all" on character_equipment
  for all
  using (exists (
    select 1 from characters c
    where c.id = character_equipment.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = character_equipment.character_id and c.owner_id = auth.uid()
  ));

-- ============ equipment_screenshots ============
create table equipment_screenshots (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  storage_path text not null,
  caption text,
  taken_at date,
  created_at timestamptz not null default now()
);

create index equipment_screenshots_character_id_idx on equipment_screenshots(character_id);

alter table equipment_screenshots enable row level security;

create policy "equipment_screenshots_owner_all" on equipment_screenshots
  for all
  using (exists (
    select 1 from characters c
    where c.id = equipment_screenshots.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = equipment_screenshots.character_id and c.owner_id = auth.uid()
  ));

-- ============ daily_tasks / daily_task_completions ============
create table daily_tasks (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  name text not null,
  memo text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index daily_tasks_character_id_idx on daily_tasks(character_id);

alter table daily_tasks enable row level security;

create policy "daily_tasks_owner_all" on daily_tasks
  for all
  using (exists (
    select 1 from characters c
    where c.id = daily_tasks.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = daily_tasks.character_id and c.owner_id = auth.uid()
  ));

create table daily_task_completions (
  id uuid primary key default gen_random_uuid(),
  daily_task_id uuid not null references daily_tasks(id) on delete cascade,
  reset_date date not null,
  completed_at timestamptz not null default now(),
  unique (daily_task_id, reset_date)
);

create index daily_task_completions_task_id_idx on daily_task_completions(daily_task_id);

alter table daily_task_completions enable row level security;

create policy "daily_task_completions_owner_all" on daily_task_completions
  for all
  using (exists (
    select 1 from daily_tasks t
    join characters c on c.id = t.character_id
    where t.id = daily_task_completions.daily_task_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from daily_tasks t
    join characters c on c.id = t.character_id
    where t.id = daily_task_completions.daily_task_id and c.owner_id = auth.uid()
  ));

-- ============ weekly_tasks / weekly_task_completions ============
create table weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  name text not null,
  memo text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index weekly_tasks_character_id_idx on weekly_tasks(character_id);

alter table weekly_tasks enable row level security;

create policy "weekly_tasks_owner_all" on weekly_tasks
  for all
  using (exists (
    select 1 from characters c
    where c.id = weekly_tasks.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = weekly_tasks.character_id and c.owner_id = auth.uid()
  ));

create table weekly_task_completions (
  id uuid primary key default gen_random_uuid(),
  weekly_task_id uuid not null references weekly_tasks(id) on delete cascade,
  reset_week_start date not null,
  completed_at timestamptz not null default now(),
  unique (weekly_task_id, reset_week_start)
);

create index weekly_task_completions_task_id_idx on weekly_task_completions(weekly_task_id);

alter table weekly_task_completions enable row level security;

create policy "weekly_task_completions_owner_all" on weekly_task_completions
  for all
  using (exists (
    select 1 from weekly_tasks t
    join characters c on c.id = t.character_id
    where t.id = weekly_task_completions.weekly_task_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from weekly_tasks t
    join characters c on c.id = t.character_id
    where t.id = weekly_task_completions.weekly_task_id and c.owner_id = auth.uid()
  ));

-- ============ storage: 装備スクリーンショット ============
insert into storage.buckets (id, name, public)
values ('equipment-screenshots', 'equipment-screenshots', false)
on conflict (id) do nothing;

create policy "equipment_screenshots_storage_owner_all" on storage.objects
  for all
  using (bucket_id = 'equipment-screenshots' and auth.role() = 'authenticated')
  with check (bucket_id = 'equipment-screenshots' and auth.role() = 'authenticated');
