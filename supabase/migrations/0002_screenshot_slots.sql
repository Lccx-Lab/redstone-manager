-- 装備スクリーンショットを部位（スロット）別に紐付ける
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table equipment_screenshots
  add column slot equipment_slot not null default 'weapon',
  add column ring_index integer not null default 0;

alter table equipment_screenshots
  alter column slot drop default;

alter table equipment_screenshots
  add constraint equipment_screenshots_ring_index_range check (
    (slot = 'ring' and ring_index between 1 and 10)
    or (slot <> 'ring' and ring_index = 0)
  );

create index equipment_screenshots_slot_idx
  on equipment_screenshots(character_id, slot, ring_index);
