"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseCapPercent(formData: FormData): number | null {
  const raw = String(formData.get("cap_percent") ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function createStatTypeAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const capPercent = parseCapPercent(formData);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("stat_types")
    .insert({ name, cap_percent: capPercent, owner_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/stat-types");
  revalidatePath("/", "layout");
}

export async function updateStatTypeAction(statTypeId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const capPercent = parseCapPercent(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("stat_types")
    .update({ name, cap_percent: capPercent })
    .eq("id", statTypeId);
  if (error) throw new Error(error.message);

  revalidatePath("/stat-types");
  revalidatePath("/", "layout");
}

export async function deleteStatTypeAction(statTypeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("stat_types").delete().eq("id", statTypeId);
  if (error) throw new Error(error.message);

  revalidatePath("/stat-types");
  revalidatePath("/", "layout");
}
