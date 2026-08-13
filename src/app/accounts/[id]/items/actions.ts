"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentSlotKey } from "@/lib/types";

const BUCKET = "equipment-screenshots";

export async function createItemAction(accountId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slot = String(formData.get("slot") ?? "") as EquipmentSlotKey;
  if (!name || !slot) return;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("equipment_items").insert({
    account_id: accountId,
    slot,
    name,
    memo,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}/items`);
}

export async function updateItemAction(itemId: string, accountId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("equipment_items")
    .update({ name, memo })
    .eq("id", itemId);
  if (updateError) throw new Error(updateError.message);

  const statTypeIds = formData.getAll("stat_type[]").map(String);
  const statValues = formData.getAll("stat_value[]").map(String);

  // 同じステータス項目が複数行選択された場合はユニーク制約に抵触するため合算する
  const mergedStats = new Map<string, number>();
  statTypeIds.forEach((statTypeId, i) => {
    if (statTypeId === "") return;
    const value = Number(statValues[i]) || 0;
    mergedStats.set(statTypeId, (mergedStats.get(statTypeId) ?? 0) + value);
  });

  const statRows = Array.from(mergedStats.entries()).map(([statTypeId, valuePercent]) => ({
    equipment_item_id: itemId,
    stat_type_id: statTypeId,
    value_percent: valuePercent,
  }));

  const { error: deleteError } = await supabase
    .from("equipment_item_stats")
    .delete()
    .eq("equipment_item_id", itemId);
  if (deleteError) throw new Error(deleteError.message);

  if (statRows.length > 0) {
    const { error: insertError } = await supabase.from("equipment_item_stats").insert(statRows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/accounts/${accountId}/items`);
  revalidatePath("/", "layout");
}

export async function deleteItemAction(itemId: string, accountId: string) {
  const supabase = await createClient();

  const { data: shots } = await supabase
    .from("equipment_item_screenshots")
    .select("storage_path")
    .eq("equipment_item_id", itemId);
  if (shots && shots.length > 0) {
    await supabase.storage.from(BUCKET).remove(shots.map((s) => s.storage_path));
  }

  const { error } = await supabase.from("equipment_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}/items`);
  revalidatePath("/", "layout");
}

export async function copyItemAction(itemId: string, formData: FormData) {
  const targetAccountId = String(formData.get("target_account_id") ?? "");
  if (!targetAccountId) return;

  const supabase = await createClient();
  const { data: source, error: sourceError } = await supabase
    .from("equipment_items")
    .select("*, equipment_item_stats(stat_type_id, value_percent)")
    .eq("id", itemId)
    .single();
  if (sourceError || !source) throw new Error(sourceError?.message ?? "item not found");

  const { data: newItem, error: insertError } = await supabase
    .from("equipment_items")
    .insert({
      account_id: targetAccountId,
      slot: source.slot,
      name: source.name,
      memo: source.memo,
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  const stats = (source.equipment_item_stats ?? []) as {
    stat_type_id: string;
    value_percent: number;
  }[];
  if (stats.length > 0) {
    const { error: statsError } = await supabase.from("equipment_item_stats").insert(
      stats.map((s) => ({
        equipment_item_id: newItem.id,
        stat_type_id: s.stat_type_id,
        value_percent: s.value_percent,
      })),
    );
    if (statsError) throw new Error(statsError.message);
  }

  revalidatePath(`/accounts/${targetAccountId}/items`);
}

export async function uploadItemScreenshotAction(
  itemId: string,
  accountId: string,
  formData: FormData,
) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${accountId}/items/${itemId}/${crypto.randomUUID()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("equipment_item_screenshots").insert({
    equipment_item_id: itemId,
    storage_path: path,
    caption,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/accounts/${accountId}/items`);
}

export async function deleteItemScreenshotAction(
  itemId: string,
  accountId: string,
  screenshotId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase
    .from("equipment_item_screenshots")
    .delete()
    .eq("id", screenshotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/accounts/${accountId}/items`);
}
