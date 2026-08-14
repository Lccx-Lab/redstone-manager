// 第三者利用の解禁に向けたワンショット移行スクリプト。
//
// 既存のスクリーンショットは `${characterId}/status/...` のように所有者情報を
// 含まないパスで保存されている。0013_storage_owner_scoped.sql の新ポリシーは
// パス先頭セグメントが auth.uid() であることを要求するため、先にこのスクリプトで
// 既存オブジェクトを `${ownerId}/...` 形式へ移動し、各テーブルの storage_path 列を
// 更新しておく必要がある（実行は冪等: 既に新形式のパスはスキップする）。
//
// 実行方法（プロジェクトルートで）:
//   npm run migrate:storage
//   （内部的には node --env-file=.env.local scripts/migrate-storage-paths.ts を実行する）
//
// SUPABASE_SERVICE_ROLE_KEY と NEXT_PUBLIC_SUPABASE_URL が .env.local に必要。
// 0013_storage_owner_scoped.sql を適用する前に、このスクリプトを完走させること。

import { createClient } from "@supabase/supabase-js";

const BUCKET = "equipment-screenshots";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定です。--env-file=.env.local を付けて実行してください。",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function moveOne(oldPath: string, newPath: string): Promise<"moved" | "skipped" | "missing"> {
  if (oldPath === newPath) return "skipped";
  const { error } = await supabase.storage.from(BUCKET).move(oldPath, newPath);
  if (error) {
    // 既にオブジェクトが存在しない（手動削除済み等）場合はスキップして続行する
    if (/not.?found/i.test(error.message)) return "missing";
    throw new Error(`move failed ${oldPath} -> ${newPath}: ${error.message}`);
  }
  return "moved";
}

async function migrateStatusScreenshots() {
  const { data, error } = await supabase
    .from("character_status_screenshots")
    .select("id, storage_path, characters!inner(id, owner_id)");
  if (error) throw new Error(error.message);

  let moved = 0;
  let skipped = 0;
  let missing = 0;
  for (const row of data ?? []) {
    const character = row.characters as unknown as { id: string; owner_id: string };
    const oldPath = row.storage_path as string;
    const filename = oldPath.split("/").pop();
    const newPath = `${character.owner_id}/status/${character.id}/${filename}`;
    const result = await moveOne(oldPath, newPath);
    if (result === "moved") {
      const { error: updateError } = await supabase
        .from("character_status_screenshots")
        .update({ storage_path: newPath })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      moved += 1;
    } else if (result === "skipped") {
      skipped += 1;
    } else {
      missing += 1;
    }
  }
  console.log(`character_status_screenshots: moved=${moved} skipped=${skipped} missing=${missing}`);
}

async function migrateContentScreenshots() {
  const { data, error } = await supabase
    .from("character_content_screenshots")
    .select("id, storage_path, category, characters!inner(id, owner_id)");
  if (error) throw new Error(error.message);

  let moved = 0;
  let skipped = 0;
  let missing = 0;
  for (const row of data ?? []) {
    const character = row.characters as unknown as { id: string; owner_id: string };
    const oldPath = row.storage_path as string;
    const filename = oldPath.split("/").pop();
    const newPath = `${character.owner_id}/content/${character.id}/${row.category}/${filename}`;
    const result = await moveOne(oldPath, newPath);
    if (result === "moved") {
      const { error: updateError } = await supabase
        .from("character_content_screenshots")
        .update({ storage_path: newPath })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      moved += 1;
    } else if (result === "skipped") {
      skipped += 1;
    } else {
      missing += 1;
    }
  }
  console.log(`character_content_screenshots: moved=${moved} skipped=${skipped} missing=${missing}`);
}

async function migrateItemScreenshots() {
  const { data, error } = await supabase
    .from("equipment_item_screenshots")
    .select("id, storage_path, equipment_items!inner(id, owner_id)");
  if (error) throw new Error(error.message);

  let moved = 0;
  let skipped = 0;
  let missing = 0;
  for (const row of data ?? []) {
    const item = row.equipment_items as unknown as { id: string; owner_id: string };
    const oldPath = row.storage_path as string;
    const filename = oldPath.split("/").pop();
    const newPath = `${item.owner_id}/items/${item.id}/${filename}`;
    const result = await moveOne(oldPath, newPath);
    if (result === "moved") {
      const { error: updateError } = await supabase
        .from("equipment_item_screenshots")
        .update({ storage_path: newPath })
        .eq("id", row.id);
      if (updateError) throw new Error(updateError.message);
      moved += 1;
    } else if (result === "skipped") {
      skipped += 1;
    } else {
      missing += 1;
    }
  }
  console.log(`equipment_item_screenshots: moved=${moved} skipped=${skipped} missing=${missing}`);
}

async function main() {
  await migrateStatusScreenshots();
  await migrateContentScreenshots();
  await migrateItemScreenshots();
  console.log("完了。すべて moved/skipped であることを確認してから 0013_storage_owner_scoped.sql を適用してください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
