"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCharacterAction(characterId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const job = String(formData.get("job") ?? "").trim() || null;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({ name, job, memo })
    .eq("id", characterId);
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/");
}

export async function deleteCharacterAction(characterId: string, accountId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("characters").delete().eq("id", characterId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/accounts/${accountId}`);
  redirect(`/accounts/${accountId}`);
}
