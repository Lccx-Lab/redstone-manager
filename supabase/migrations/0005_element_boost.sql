-- 装備スロットごとの属性強化%管理
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table character_equipment
  add column element_boost_percent numeric(6, 2) not null default 0;
