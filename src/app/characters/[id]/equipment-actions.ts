"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentSlotKey } from "@/lib/types";

export async function saveEquipmentSlotAction(
  characterId: string,
  slot: EquipmentSlotKey,
  ringIndex: number,
  formData: FormData,
) {
  const itemName = String(formData.get("item_name") ?? "").trim() || null;
  const memo = String(formData.get("memo") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("character_equipment").upsert(
    {
      character_id: characterId,
      slot,
      ring_index: ringIndex,
      item_name: itemName,
      memo,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "character_id,slot,ring_index" },
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
}
