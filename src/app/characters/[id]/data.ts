import { createClient } from "@/lib/supabase/server";
import { jstDateString, jstWeekStartString } from "@/lib/reset";
import { EQUIPMENT_SLOTS, equipmentSlotStorageKey } from "@/lib/types";
import type {
  Character,
  CharacterContentCategory,
  DailyTask,
  EquipmentSlotKey,
  StatType,
  WeeklyTask,
} from "@/lib/types";

const SCREENSHOT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1時間

function slotLabel(slot: EquipmentSlotKey): string {
  if (slot === "ring") return "指";
  return EQUIPMENT_SLOTS.find((s) => s.key === slot)?.label ?? slot;
}

export type EquippedItemDetail = {
  id: string;
  name: string;
  memo: string | null;
  slot: EquipmentSlotKey;
  stats: { statTypeId: string; value: number }[];
  screenshots: { id: string; storage_path: string; caption: string | null; url: string | null }[];
};

export type LibraryItem = {
  id: string;
  slot: EquipmentSlotKey;
  name: string;
  memo: string | null;
  /** このキャラのどこかに装備中なら "このキャラ / 首" 、他キャラなら "キャラB / 首" 、未装備なら null */
  equippedOn: string | null;
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
  equippedBySlot: Map<string, EquippedItemDetail | null>;
  itemLibrary: LibraryItem[];
  statusScreenshots: StatusScreenshotWithUrl[];
  contentScreenshotsByCategory: Map<CharacterContentCategory, StatusScreenshotWithUrl[]>;
  contentOptionsByCategory: Map<CharacterContentCategory, { statTypeId: string; value: number }[]>;
  statTypes: StatType[];
  statTotals: Map<string, number>;
  dailyTasks: (DailyTask & { isDoneToday: boolean })[];
  weeklyTasks: (WeeklyTask & { isDoneThisWeek: boolean })[];
};

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
    { data: ceRows },
    { data: itemsRaw },
    { data: statTypesRaw },
    { data: dailyTasksRaw },
    { data: weeklyTasksRaw },
    { data: statusScreenshotsRaw },
    { data: contentScreenshotsRaw },
    { data: contentOptionsRaw },
    { data: allCharacters },
  ] = await Promise.all([
    supabase.from("character_equipment").select("*").eq("character_id", characterId),
    supabase
      .from("equipment_items")
      .select(
        "*, equipment_item_stats(stat_type_id, value), equipment_item_screenshots(id, storage_path, caption)",
      ),
    supabase.from("stat_types").select("*").order("sort_order", { ascending: true }).order("name"),
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
      .from("character_status_screenshots")
      .select("id, character_id, storage_path, caption, created_at")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false }),
    supabase
      .from("character_content_screenshots")
      .select("id, character_id, category, storage_path, caption, created_at")
      .eq("character_id", characterId)
      .order("created_at", { ascending: false }),
    supabase
      .from("character_content_options")
      .select("category, stat_type_id, value")
      .eq("character_id", characterId),
    supabase.from("characters").select("id, name"),
  ]);

  const characterNameById = new Map((allCharacters ?? []).map((c) => [c.id, c.name as string]));
  const allCharacterIds = (allCharacters ?? []).map((c) => c.id);

  const { data: allEquippedRows } =
    allCharacterIds.length > 0
      ? await supabase
          .from("character_equipment")
          .select("character_id, slot, ring_index, equipped_item_id")
          .in("character_id", allCharacterIds)
          .not("equipped_item_id", "is", null)
      : {
          data: [] as {
            character_id: string;
            slot: string;
            ring_index: number;
            equipped_item_id: string;
          }[],
        };

  const equippedLocationByItemId = new Map<string, string>();
  for (const row of allEquippedRows ?? []) {
    const slot = row.slot as EquipmentSlotKey;
    const label = slot === "ring" ? `指${row.ring_index}` : slotLabel(slot);
    const who = row.character_id === characterId ? "このキャラ" : characterNameById.get(row.character_id) ?? "?";
    equippedLocationByItemId.set(row.equipped_item_id, `${who} / ${label}`);
  }

  const itemDetails: EquippedItemDetail[] = await Promise.all(
    (itemsRaw ?? []).map(async (raw) => {
      const stats = (
        (raw.equipment_item_stats ?? []) as { stat_type_id: string; value: number }[]
      ).map((s) => ({ statTypeId: s.stat_type_id, value: Number(s.value) || 0 }));

      const rawShots = (raw.equipment_item_screenshots ?? []) as {
        id: string;
        storage_path: string;
        caption: string | null;
      }[];
      const screenshots = await Promise.all(
        rawShots.map(async (s) => {
          const { data: signed } = await supabase.storage
            .from("equipment-screenshots")
            .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
          return { ...s, url: signed?.signedUrl ?? null };
        }),
      );

      return {
        id: raw.id,
        name: raw.name,
        memo: raw.memo,
        slot: raw.slot as EquipmentSlotKey,
        stats,
        screenshots,
      };
    }),
  );

  const itemById = new Map(itemDetails.map((d) => [d.id, d]));
  const itemLibrary: LibraryItem[] = itemDetails.map((d) => ({
    id: d.id,
    slot: d.slot,
    name: d.name,
    memo: d.memo,
    equippedOn: equippedLocationByItemId.get(d.id) ?? null,
  }));

  const equippedBySlot = new Map<string, EquippedItemDetail | null>();
  const statTotals = new Map<string, number>();
  for (const ce of ceRows ?? []) {
    const key = equipmentSlotStorageKey(ce.slot as EquipmentSlotKey, ce.ring_index);
    const detail = ce.equipped_item_id ? (itemById.get(ce.equipped_item_id) ?? null) : null;
    equippedBySlot.set(key, detail);
    if (detail) {
      for (const s of detail.stats) {
        statTotals.set(s.statTypeId, (statTotals.get(s.statTypeId) ?? 0) + s.value);
      }
    }
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

  const statusScreenshots = await Promise.all(
    (statusScreenshotsRaw ?? []).map(async (s) => {
      const { data: signed } = await supabase.storage
        .from("equipment-screenshots")
        .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
      return { ...s, url: signed?.signedUrl ?? null };
    }),
  );

  const contentScreenshotsByCategory = new Map<CharacterContentCategory, StatusScreenshotWithUrl[]>();
  for (const s of contentScreenshotsRaw ?? []) {
    const { data: signed } = await supabase.storage
      .from("equipment-screenshots")
      .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
    const category = s.category as CharacterContentCategory;
    const list = contentScreenshotsByCategory.get(category) ?? [];
    list.push({
      id: s.id,
      character_id: s.character_id,
      storage_path: s.storage_path,
      caption: s.caption,
      created_at: s.created_at,
      url: signed?.signedUrl ?? null,
    });
    contentScreenshotsByCategory.set(category, list);
  }

  const contentOptionsByCategory = new Map<CharacterContentCategory, { statTypeId: string; value: number }[]>();
  for (const o of contentOptionsRaw ?? []) {
    const category = o.category as CharacterContentCategory;
    const list = contentOptionsByCategory.get(category) ?? [];
    list.push({ statTypeId: o.stat_type_id, value: Number(o.value) || 0 });
    contentOptionsByCategory.set(category, list);
  }

  return {
    character,
    equippedBySlot,
    itemLibrary,
    statusScreenshots,
    contentScreenshotsByCategory,
    contentOptionsByCategory,
    statTypes: statTypesRaw ?? [],
    statTotals,
    dailyTasks,
    weeklyTasks,
  };
}
