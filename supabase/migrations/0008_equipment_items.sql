-- 装備アイテムマスタ化（アカウント単位）＋ドラッグ&ドロップ装備対応
-- character_equipment に直接ぶら下がっていた item_name / character_equipment_stats /
-- equipment_screenshots を、独立した「装備アイテム」エンティティ（equipment_items）に正規化する。
-- 既存データは自動的に equipment_items へ移行される。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

-- ============ equipment_items ============
create table equipment_items (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references accounts(id) on delete cascade,
  slot equipment_slot not null,
  name text not null,
  memo text,
  created_at timestamptz not null default now()
);

create index equipment_items_account_id_idx on equipment_items(account_id);

alter table equipment_items enable row level security;

create policy "equipment_items_owner_all" on equipment_items
  for all
  using (exists (
    select 1 from accounts a where a.id = equipment_items.account_id and a.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from accounts a where a.id = equipment_items.account_id and a.owner_id = auth.uid()
  ));

-- ============ equipment_item_stats ============
create table equipment_item_stats (
  id uuid primary key default gen_random_uuid(),
  equipment_item_id uuid not null references equipment_items(id) on delete cascade,
  stat_type_id uuid not null references stat_types(id) on delete cascade,
  value_percent numeric(6, 2) not null default 0,
  unique (equipment_item_id, stat_type_id)
);

create index equipment_item_stats_item_id_idx on equipment_item_stats(equipment_item_id);

alter table equipment_item_stats enable row level security;

create policy "equipment_item_stats_owner_all" on equipment_item_stats
  for all
  using (exists (
    select 1 from equipment_items ei
    join accounts a on a.id = ei.account_id
    where ei.id = equipment_item_stats.equipment_item_id and a.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from equipment_items ei
    join accounts a on a.id = ei.account_id
    where ei.id = equipment_item_stats.equipment_item_id and a.owner_id = auth.uid()
  ));

-- ============ equipment_item_screenshots ============
create table equipment_item_screenshots (
  id uuid primary key default gen_random_uuid(),
  equipment_item_id uuid not null references equipment_items(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index equipment_item_screenshots_item_id_idx on equipment_item_screenshots(equipment_item_id);

alter table equipment_item_screenshots enable row level security;

create policy "equipment_item_screenshots_owner_all" on equipment_item_screenshots
  for all
  using (exists (
    select 1 from equipment_items ei
    join accounts a on a.id = ei.account_id
    where ei.id = equipment_item_screenshots.equipment_item_id and a.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from equipment_items ei
    join accounts a on a.id = ei.account_id
    where ei.id = equipment_item_screenshots.equipment_item_id and a.owner_id = auth.uid()
  ));

-- ============ character_equipment: アイテム参照に変更 ============
alter table character_equipment
  add column equipped_item_id uuid references equipment_items(id) on delete set null;

-- 同じアイテムが同時に複数スロットへ装備されないようにする
create unique index character_equipment_equipped_item_unique
  on character_equipment(equipped_item_id) where equipped_item_id is not null;

-- ---- 既存データの移行 ----
alter table equipment_items add column _migration_source_ce_id uuid;

insert into equipment_items (account_id, slot, name, memo, _migration_source_ce_id)
select c.account_id, ce.slot, ce.item_name, ce.memo, ce.id
from character_equipment ce
join characters c on c.id = ce.character_id
where ce.item_name is not null and ce.item_name <> '';

update character_equipment ce
set equipped_item_id = ei.id
from equipment_items ei
where ei._migration_source_ce_id = ce.id;

insert into equipment_item_stats (equipment_item_id, stat_type_id, value_percent)
select ei.id, ces.stat_type_id, ces.value_percent
from character_equipment_stats ces
join equipment_items ei on ei._migration_source_ce_id = ces.character_equipment_id;

insert into equipment_item_screenshots (equipment_item_id, storage_path, caption, created_at)
select ei.id, es.storage_path, es.caption, es.created_at
from equipment_screenshots es
join character_equipment ce
  on ce.character_id = es.character_id and ce.slot = es.slot and ce.ring_index = es.ring_index
join equipment_items ei on ei._migration_source_ce_id = ce.id;

alter table equipment_items drop column _migration_source_ce_id;

-- ---- 旧構造の後始末 ----
drop table character_equipment_stats;
drop table equipment_screenshots;

alter table character_equipment
  drop column item_name,
  drop column memo;
