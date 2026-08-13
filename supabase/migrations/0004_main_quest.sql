-- メインクエスト次回更新日時の管理・通知用
-- Supabase の SQL Editor で実行するか `supabase db push` で適用してください。

alter table characters
  add column main_quest_updated_at timestamptz,
  add column main_quest_notification_sent boolean not null default false;
