import { createClient } from "@/lib/supabase/server";
import { jstDateString, jstWeekStartString } from "@/lib/reset";
import type {
  Character,
  CharacterEquipment,
  DailyTask,
  WeeklyTask,
} from "@/lib/types";

export type CharacterDetail = {
  character: Character;
  equipment: CharacterEquipment[];
  dailyTasks: (DailyTask & { isDoneToday: boolean })[];
  weeklyTasks: (WeeklyTask & { isDoneThisWeek: boolean })[];
  screenshots: {
    id: string;
    storage_path: string;
    caption: string | null;
    taken_at: string | null;
    url: string | null;
  }[];
};

const SCREENSHOT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1時間

export async function getCharacterDetail(characterId: string): Promise<CharacterDetail | null> {
  const supabase = await createClient();

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("id", characterId)
    .single();

  if (!character) return null;

  const today = jstDateString();
  const weekStart = jstWeekStartString();

  const [
    { data: equipment },
    { data: dailyTasksRaw },
    { data: weeklyTasksRaw },
    { data: screenshotsRaw },
  ] = await Promise.all([
    supabase.from("character_equipment").select("*").eq("character_id", characterId),
    supabase
      .from("daily_tasks")
      .select("*, daily_task_completions(reset_date)")
      .eq("character_id", characterId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("weekly_tasks")
      .select("*, weekly_task_completions(reset_week_start)")
      .eq("character_id", characterId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("equipment_screenshots")
      .select("id, storage_path, caption, taken_at")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false }),
  ]);

  const dailyTasks = (dailyTasksRaw ?? []).map((task) => {
    const completions = (task.daily_task_completions ?? []) as { reset_date: string }[];
    return {
      id: task.id,
      character_id: task.character_id,
      name: task.name,
      memo: task.memo,
      sort_order: task.sort_order,
      is_active: task.is_active,
      created_at: task.created_at,
      isDoneToday: completions.some((c) => c.reset_date === today),
    };
  });

  const weeklyTasks = (weeklyTasksRaw ?? []).map((task) => {
    const completions = (task.weekly_task_completions ?? []) as { reset_week_start: string }[];
    return {
      id: task.id,
      character_id: task.character_id,
      name: task.name,
      memo: task.memo,
      sort_order: task.sort_order,
      is_active: task.is_active,
      created_at: task.created_at,
      isDoneThisWeek: completions.some((c) => c.reset_week_start === weekStart),
    };
  });

  const screenshots = await Promise.all(
    (screenshotsRaw ?? []).map(async (s) => {
      const { data: signed } = await supabase.storage
        .from("equipment-screenshots")
        .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
      return {
        id: s.id,
        storage_path: s.storage_path,
        caption: s.caption,
        taken_at: s.taken_at,
        url: signed?.signedUrl ?? null,
      };
    }),
  );

  return {
    character,
    equipment: equipment ?? [],
    dailyTasks,
    weeklyTasks,
    screenshots,
  };
}
