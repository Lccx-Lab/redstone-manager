-- 装備以外のコンテンツ（古龍の祝福・ネフォンクリーチャー・ミニペット・コスチューム・潜在能力）に、
-- 装備のオプション項目と同じ仕組みで値を設定できるようにする。
-- 既存の stat_types（オプション項目マスタ）をそのまま流用し、カテゴリごとに複数行・同一項目の重複も許容する。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

create table character_content_options (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references characters(id) on delete cascade,
  category character_content_category not null,
  stat_type_id uuid not null references stat_types(id) on delete cascade,
  value numeric(10, 2) not null default 0
);

create index character_content_options_character_category_idx
  on character_content_options(character_id, category);

alter table character_content_options enable row level security;

create policy "character_content_options_owner_all" on character_content_options
  for all
  using (exists (
    select 1 from characters c
    where c.id = character_content_options.character_id and c.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from characters c
    where c.id = character_content_options.character_id and c.owner_id = auth.uid()
  ));
