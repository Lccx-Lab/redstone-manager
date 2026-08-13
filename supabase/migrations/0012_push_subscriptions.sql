-- ブラウザ通知（Web Push）用の購読情報を保存する
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_owner_id_idx on push_subscriptions(owner_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_owner_all" on push_subscriptions
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
