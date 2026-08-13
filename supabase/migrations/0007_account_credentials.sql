-- アカウントのゲームログイン情報管理
-- パスワード系はアプリ層（AES-256-GCM）で暗号化してから保存するため、
-- ここでは暗号化済み文字列を保持するテキスト列として定義する。
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

create table account_credentials (
  account_id uuid primary key references accounts(id) on delete cascade,
  login_id text,
  password_encrypted text,
  secondary_password_encrypted text,
  birthdate date,
  registered_email text,
  updated_at timestamptz not null default now()
);

alter table account_credentials enable row level security;

create policy "account_credentials_owner_all" on account_credentials
  for all
  using (exists (
    select 1 from accounts a
    where a.id = account_credentials.account_id and a.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from accounts a
    where a.id = account_credentials.account_id and a.owner_id = auth.uid()
  ));
