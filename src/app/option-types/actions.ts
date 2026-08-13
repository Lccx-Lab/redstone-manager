"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function parseCapValue(formData: FormData): number | null {
  const raw = String(formData.get("cap_value") ?? "").trim();
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function parseIsPercent(formData: FormData): boolean {
  return String(formData.get("unit") ?? "percent") === "percent";
}

export async function createOptionTypeAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const capValue = parseCapValue(formData);
  const isPercent = parseIsPercent(formData);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("stat_types")
    .insert({ name, cap_value: capValue, is_percent: isPercent, owner_id: user.id });
  if (error) throw new Error(error.message);

  revalidatePath("/option-types");
  revalidatePath("/", "layout");
}

export async function updateOptionTypeAction(optionTypeId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const capValue = parseCapValue(formData);
  const isPercent = parseIsPercent(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("stat_types")
    .update({ name, cap_value: capValue, is_percent: isPercent })
    .eq("id", optionTypeId);
  if (error) throw new Error(error.message);

  revalidatePath("/option-types");
  revalidatePath("/", "layout");
}

export async function deleteOptionTypeAction(optionTypeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("stat_types").delete().eq("id", optionTypeId);
  if (error) throw new Error(error.message);

  revalidatePath("/option-types");
  revalidatePath("/", "layout");
}
