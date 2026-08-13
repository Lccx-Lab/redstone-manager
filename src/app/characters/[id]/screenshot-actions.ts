"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentSlotKey } from "@/lib/types";

const BUCKET = "equipment-screenshots";

export async function uploadScreenshotAction(
  characterId: string,
  slot: EquipmentSlotKey,
  ringIndex: number,
  formData: FormData,
) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${characterId}/${slot}-${ringIndex}/${crypto.randomUUID()}.${extension}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("equipment_screenshots").insert({
    character_id: characterId,
    slot,
    ring_index: ringIndex,
    storage_path: path,
    caption,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/characters/${characterId}`);
}

export async function deleteScreenshotAction(
  characterId: string,
  screenshotId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase.from("equipment_screenshots").delete().eq("id", screenshotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}
