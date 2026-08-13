"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCharacterAction(formData: FormData) {
  const accountId = String(formData.get("account_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!accountId || !name) return;
  const job = String(formData.get("job") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: character, error } = await supabase
    .from("characters")
    .insert({ account_id: accountId, name, job, owner_id: user.id })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath(`/accounts/${accountId}`);
  redirect(`/characters/${character.id}`);
}
