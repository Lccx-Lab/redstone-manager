"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentSlotKey } from "@/lib/types";

const BUCKET = "equipment-screenshots";

export async function createItemAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slot = String(formData.get("slot") ?? "") as EquipmentSlotKey;
  if (!name || !slot) return;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("equipment_items").insert({
    owner_id: user.id,
    slot,
    name,
    memo,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/equipment-items");
}

export async function updateItemAction(itemId: string, formData: FormData) {
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

  // 同じ項目が複数行選択されていても、それぞれ別の値として保持する
  const statRows = statTypeIds
    .map((statTypeId, i) => ({
      equipment_item_id: itemId,
      stat_type_id: statTypeId,
      value: Number(statValues[i]) || 0,
    }))
    .filter((row) => row.stat_type_id !== "");

  const { error: deleteError } = await supabase
    .from("equipment_item_stats")
    .delete()
    .eq("equipment_item_id", itemId);
  if (deleteError) throw new Error(deleteError.message);

  if (statRows.length > 0) {
    const { error: insertError } = await supabase.from("equipment_item_stats").insert(statRows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath("/equipment-items");
  revalidatePath("/", "layout");
}

export async function deleteItemAction(itemId: string) {
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

  revalidatePath("/equipment-items");
  revalidatePath("/", "layout");
}

export async function duplicateItemAction(itemId: string) {
  const supabase = await createClient();
  const { data: source, error: sourceError } = await supabase
    .from("equipment_items")
    .select("*, equipment_item_stats(stat_type_id, value)")
    .eq("id", itemId)
    .single();
  if (sourceError || !source) throw new Error(sourceError?.message ?? "item not found");

  const { data: newItem, error: insertError } = await supabase
    .from("equipment_items")
    .insert({
      owner_id: source.owner_id,
      slot: source.slot,
      name: `${source.name}のコピー`,
      memo: source.memo,
    })
    .select("id")
    .single();
  if (insertError) throw new Error(insertError.message);

  const stats = (source.equipment_item_stats ?? []) as {
    stat_type_id: string;
    value: number;
  }[];
  if (stats.length > 0) {
    const { error: statsError } = await supabase.from("equipment_item_stats").insert(
      stats.map((s) => ({
        equipment_item_id: newItem.id,
        stat_type_id: s.stat_type_id,
        value: s.value,
      })),
    );
    if (statsError) throw new Error(statsError.message);
  }

  revalidatePath("/equipment-items");
}

export async function uploadItemScreenshotAction(itemId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${user.id}/items/${itemId}/${crypto.randomUUID()}.${extension}`;

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

  revalidatePath("/equipment-items");
}

export async function deleteItemScreenshotAction(
  itemId: string,
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
  revalidatePath("/equipment-items");
}
