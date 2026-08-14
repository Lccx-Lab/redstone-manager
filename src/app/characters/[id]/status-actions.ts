"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "equipment-screenshots";

export async function updateLevelAction(characterId: string, formData: FormData) {
  const raw = String(formData.get("level") ?? "").trim();
  const level = raw === "" ? null : Number(raw);
  if (level !== null && (!Number.isInteger(level) || level < 0)) return;

  const supabase = await createClient();
  const { error } = await supabase.from("characters").update({ level }).eq("id", characterId);
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
}

export async function uploadStatusScreenshotAction(characterId: string, formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const caption = String(formData.get("caption") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${user.id}/status/${characterId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) throw new Error(uploadError.message);

  const { error: insertError } = await supabase.from("character_status_screenshots").insert({
    character_id: characterId,
    storage_path: path,
    caption,
  });
  if (insertError) throw new Error(insertError.message);

  revalidatePath(`/characters/${characterId}`);
}

export async function deleteStatusScreenshotAction(
  characterId: string,
  screenshotId: string,
  storagePath: string,
) {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase
    .from("character_status_screenshots")
    .delete()
    .eq("id", screenshotId);
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}
