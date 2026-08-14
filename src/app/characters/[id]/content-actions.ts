"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CharacterContentCategory } from "@/lib/types";

const BUCKET = "equipment-screenshots";

export async function uploadContentScreenshotAction(
  characterId: string,
  category: CharacterContentCategory,
  formData: FormData,
) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${user.id}/content/${characterId}/${category}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("character_content_screenshots").insert({
    character_id: characterId,
    category,
    storage_path: path,
    caption,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/characters/${characterId}`);
}

export async function deleteContentScreenshotAction(
  characterId: string,
  screenshotId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase
    .from("character_content_screenshots")
    .delete()
    .eq("id", screenshotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

export async function saveContentOptionsAction(
  characterId: string,
  category: CharacterContentCategory,
  formData: FormData,
) {
  const statTypeIds = formData.getAll("stat_type[]").map(String);
  const statValues = formData.getAll("stat_value[]").map(String);

  // 同じ項目が複数行選択されていても、それぞれ別の値として保持する
  const rows = statTypeIds
    .map((statTypeId, i) => ({
      character_id: characterId,
      category,
      stat_type_id: statTypeId,
      value: Number(statValues[i]) || 0,
    }))
    .filter((row) => row.stat_type_id !== "");

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("character_content_options")
    .delete()
    .eq("character_id", characterId)
    .eq("category", category);
  if (deleteError) throw new Error(deleteError.message);

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("character_content_options").insert(rows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/characters/${characterId}`);
}
