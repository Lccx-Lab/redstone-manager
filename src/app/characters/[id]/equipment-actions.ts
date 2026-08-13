"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EQUIPMENT_SLOTS, RING_SLOT_COUNT } from "@/lib/types";
import type { EquipmentSlotKey } from "@/lib/types";

type EquipmentRow = {
  character_id: string;
  slot: EquipmentSlotKey;
  ring_index: number;
  item_name: string | null;
  memo: string | null;
  updated_at: string;
};

export async function saveEquipmentAction(characterId: string, formData: FormData) {
  const now = new Date().toISOString();

  const rows: EquipmentRow[] = EQUIPMENT_SLOTS.map((slot) => ({
    character_id: characterId,
    slot: slot.key,
    ring_index: 0,
    item_name: String(formData.get(`${slot.key}__item_name`) ?? "").trim() || null,
    memo: String(formData.get(`${slot.key}__memo`) ?? "").trim() || null,
    updated_at: now,
  }));

  for (let i = 1; i <= RING_SLOT_COUNT; i += 1) {
    rows.push({
      character_id: characterId,
      slot: "ring",
      ring_index: i,
      item_name: String(formData.get(`ring_${i}__item_name`) ?? "").trim() || null,
      memo: String(formData.get(`ring_${i}__memo`) ?? "").trim() || null,
      updated_at: now,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("character_equipment")
    .upsert(rows, { onConflict: "character_id,slot,ring_index" });
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
}
