-- 第三者利用の解禁に向けたセキュリティ修正
--
-- これまでの storage.objects ポリシーは「認証済みであれば誰でも」バケット内の
-- 全オブジェクトを読み書き・削除できる状態だった（本人以外のスクリーンショットも
-- 閲覧・削除可能）。個人利用では実害がなかったが、第三者にサインアップを開放する
-- 前提では他ユーザーのファイルへの不正アクセスが可能になってしまうため、
-- パスの先頭セグメント（auth.uid()）で所有者を判定するポリシーに置き換える。
--
-- 注意: このポリシーは「パスの先頭が自分の auth.uid() であること」を要求するため、
-- 既存データ（旧パス形式）は先に scripts/migrate-storage-paths.ts で
-- 新パス（${ownerId}/...）へ移行してから、このマイグレーションを適用すること。
-- 先にこのポリシーだけ適用すると、既存スクリーンショットが閲覧・削除不能になる。

drop policy if exists "equipment_screenshots_storage_owner_all" on storage.objects;

create policy "equipment_screenshots_storage_owner_all" on storage.objects
  for all
  using (
    bucket_id = 'equipment-screenshots'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'equipment-screenshots'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
