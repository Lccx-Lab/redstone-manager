export const EQUIPMENT_SLOTS = [
  { key: "weapon", label: "武器" },
  { key: "sub_weapon", label: "補助武器" },
  { key: "neck", label: "首" },
  { key: "head", label: "頭" },
  { key: "back_ear", label: "背・耳" },
  { key: "waist", label: "腰" },
  { key: "hands", label: "手" },
  { key: "armor", label: "鎧" },
  { key: "feet", label: "足" },
] as const;

export const RING_SLOT_COUNT = 10;

export type NonRingEquipmentSlotKey = (typeof EQUIPMENT_SLOTS)[number]["key"];
export type EquipmentSlotKey = NonRingEquipmentSlotKey | "ring";

export type Account = {
  id: string;
  owner_id: string;
  name: string;
  memo: string | null;
  created_at: string;
};

export type Character = {
  id: string;
  owner_id: string;
  account_id: string;
  name: string;
  job: string | null;
  memo: string | null;
  level: number | null;
  main_quest_updated_at: string | null;
  main_quest_notification_sent: boolean;
  sort_order: number;
  created_at: string;
};

export type CharacterEquipment = {
  id: string;
  character_id: string;
  slot: EquipmentSlotKey;
  ring_index: number;
  equipped_item_id: string | null;
  updated_at: string;
};

export type StatType = {
  id: string;
  owner_id: string;
  name: string;
  cap_percent: number | null;
  sort_order: number;
  created_at: string;
};

export type EquipmentItem = {
  id: string;
  account_id: string;
  slot: EquipmentSlotKey;
  name: string;
  memo: string | null;
  created_at: string;
};

export type EquipmentItemStat = {
  id: string;
  equipment_item_id: string;
  stat_type_id: string;
  value_percent: number;
};

export type EquipmentItemScreenshot = {
  id: string;
  equipment_item_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

export function equipmentSlotStorageKey(slot: EquipmentSlotKey, ringIndex: number): string {
  return `${slot}:${ringIndex}`;
}

export type StatusScreenshot = {
  id: string;
  character_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
};

export type DailyTask = {
  id: string;
  character_id: string;
  name: string;
  memo: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type WeeklyTask = {
  id: string;
  character_id: string;
  name: string;
  memo: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type DailyTaskCompletion = {
  id: string;
  daily_task_id: string;
  reset_date: string;
  completed_at: string;
};

export type WeeklyTaskCompletion = {
  id: string;
  weekly_task_id: string;
  reset_week_start: string;
  completed_at: string;
};
