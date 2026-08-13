import { createClient } from "@/lib/supabase/server";
import { jstDateString, jstWeekStartString } from "@/lib/reset";
import { equipmentSlotStorageKey } from "@/lib/types";
import type { Character, DailyTask, EquipmentSlotKey, WeeklyTask } from "@/lib/types";

export type ScreenshotWithUrl = {
  id: string;
  caption: string | null;
  storage_path: string;
  url: string | null;
};

export type SlotEquipment = {
  itemName: string | null;
  memo: string | null;
  elementBoostPercent: number;
};

export type StatusScreenshotWithUrl = {
  id: string;
  character_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  url: string | null;
};

export type CharacterDetail = {
  character: Character;
  equipmentBySlot: Map<string, SlotEquipment>;
  screenshotsBySlot: Map<string, ScreenshotWithUrl[]>;
  statusScreenshots: StatusScreenshotWithUrl[];
  dailyTasks: (DailyTask & { isDoneToday: boolean })[];
  weeklyTasks: (WeeklyTask & { isDoneThisWeek: boolean })[];
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
    { data: equipmentRaw },
    { data: dailyTasksRaw },
    { data: weeklyTasksRaw },
    { data: screenshotsRaw },
    { data: statusScreenshotsRaw },
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
      .select("id, slot, ring_index, storage_path, caption")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false }),
    supabase
      .from("character_status_screenshots")
      .select("id, character_id, storage_path, caption, created_at")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false }),
  ]);

  const equipmentBySlot = new Map<string, SlotEquipment>();
  for (const row of equipmentRaw ?? []) {
    equipmentBySlot.set(equipmentSlotStorageKey(row.slot as EquipmentSlotKey, row.ring_index), {
      itemName: row.item_name,
      memo: row.memo,
      elementBoostPercent: Number(row.element_boost_percent) || 0,
    });
  }

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

  const screenshotsBySlot = new Map<string, ScreenshotWithUrl[]>();
  for (const s of screenshotsRaw ?? []) {
    const { data: signed } = await supabase.storage
      .from("equipment-screenshots")
      .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
    const key = equipmentSlotStorageKey(s.slot as EquipmentSlotKey, s.ring_index);
    const list = screenshotsBySlot.get(key) ?? [];
    list.push({
      id: s.id,
      caption: s.caption,
      storage_path: s.storage_path,
      url: signed?.signedUrl ?? null,
    });
    screenshotsBySlot.set(key, list);
  }

  const statusScreenshots = await Promise.all(
    (statusScreenshotsRaw ?? []).map(async (s) => {
      const { data: signed } = await supabase.storage
        .from("equipment-screenshots")
        .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
      return { ...s, url: signed?.signedUrl ?? null };
    }),
  );

  return {
    character,
    equipmentBySlot,
    screenshotsBySlot,
    statusScreenshots,
    dailyTasks,
    weeklyTasks,
  };
}
