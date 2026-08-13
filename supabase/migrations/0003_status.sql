-- キャラクターのレベル・ステータス画面スクリーンショット管理
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table characters
  add column level integer;

create table character_status_screenshots (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index character_status_screenshots_character_id_idx
  on character_status_screenshots(character_id);

alter table character_status_screenshots enable row level security;

create policy "character_status_screenshots_owner_all" on character_status_screenshots
  for all
  using (exists (
    select 1 from characters c
    where c.id = character_status_screenshots.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = character_status_screenshots.character_id and c.owner_id = auth.uid()
  ));
