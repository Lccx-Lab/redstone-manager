-- ステータス項目マスタ方式への一般化（Phase 3改訂）
-- 0005で追加した character_equipment.element_boost_percent を廃止し、
-- 項目ごとに上限値が異なる・1スロットに複数項目を持てる形に置き換える。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table character_equipment
  drop column if exists element_boost_percent;

create table stat_types (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cap_percent numeric(6, 2),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

alter table stat_types enable row level security;

create policy "stat_types_owner_all" on stat_types
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create table character_equipment_stats (
  id uuid primary key default gen_random_uuid(),
  character_equipment_id uuid not null references character_equipment(id) on delete cascade,
  stat_type_id uuid not null references stat_types(id) on delete cascade,
  value_percent numeric(6, 2) not null default 0,
  unique (character_equipment_id, stat_type_id)
);

create index character_equipment_stats_equipment_id_idx
  on character_equipment_stats(character_equipment_id);

alter table character_equipment_stats enable row level security;

create policy "character_equipment_stats_owner_all" on character_equipment_stats
  for all
  using (exists (
    select 1 from character_equipment ce
    join characters c on c.id = ce.character_id
    where ce.id = character_equipment_stats.character_equipment_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from character_equipment ce
    join characters c on c.id = ce.character_id
    where ce.id = character_equipment_stats.character_equipment_id and c.owner_id = auth.uid()
  ));
