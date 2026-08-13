"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { jstDateString, jstWeekStartString } from "@/lib/reset";

export async function createDailyTaskAction(characterId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  const { error } = await supabase.from("daily_tasks").insert({ character_id: characterId, name });
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

export async function deleteDailyTaskAction(characterId: string, taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

export async function toggleDailyTaskAction(
  characterId: string,
  taskId: string,
  isDoneToday: boolean,
) {
  const supabase = await createClient();
  const today = jstDateString();

  if (isDoneToday) {
    const { error } = await supabase
      .from("daily_task_completions")
      .delete()
      .eq("daily_task_id", taskId)
      .eq("reset_date", today);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("daily_task_completions")
      .insert({ daily_task_id: taskId, reset_date: today });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/");
}

export async function createWeeklyTaskAction(characterId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_tasks").insert({ character_id: characterId, name });
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

export async function deleteWeeklyTaskAction(characterId: string, taskId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("weekly_tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath(`/characters/${characterId}`);
}

export async function toggleWeeklyTaskAction(
  characterId: string,
  taskId: string,
  isDoneThisWeek: boolean,
) {
  const supabase = await createClient();
  const weekStart = jstWeekStartString();

  if (isDoneThisWeek) {
    const { error } = await supabase
      .from("weekly_task_completions")
      .delete()
      .eq("weekly_task_id", taskId)
      .eq("reset_week_start", weekStart);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("weekly_task_completions")
      .insert({ weekly_task_id: taskId, reset_week_start: weekStart });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/characters/${characterId}`);
  revalidatePath("/");
}
