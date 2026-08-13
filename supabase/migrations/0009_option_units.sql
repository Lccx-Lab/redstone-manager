-- オプション項目（旧ステータス項目）に単位（%／数値）を持たせ、
-- 装備アイテムの属性値は同じ項目を複数行持てるようにする（保存時の自動合算をやめる）。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table stat_types
  rename column cap_percent to cap_value;

alter table stat_types
  add column is_percent boolean not null default true;

alter table equipment_item_stats
  rename column value_percent to value;

-- 同じ項目を複数行（別々の値として）持てるようにする
alter table equipment_item_stats
  drop constraint if exists equipment_item_stats_equipment_item_id_stat_type_id_key;
