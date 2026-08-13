-- 装備以外のコンテンツ（古龍の祝福・ネフォンクリーチャー・ミニペット・コスチューム・潜在能力）の
-- スクリーンショット管理。今回はスクリーンショットのみ。各要素の詳細項目は後日拡張予定。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

create type character_content_category as enum (
  'ancient_dragon_blessing', -- 古龍の祝福
  'nephon_creature',         -- ネフォンクリーチャー
  'mini_pet',                -- ミニペット
  'costume',                 -- コスチューム
  'potential'                -- 潜在能力
);

create table character_content_screenshots (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  category character_content_category not null,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index character_content_screenshots_character_category_idx
  on character_content_screenshots(character_id, category);

alter table character_content_screenshots enable row level security;

create policy "character_content_screenshots_owner_all" on character_content_screenshots
  for all
  using (exists (
    select 1 from characters c
    where c.id = character_content_screenshots.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = character_content_screenshots.character_id and c.owner_id = auth.uid()
  ));
