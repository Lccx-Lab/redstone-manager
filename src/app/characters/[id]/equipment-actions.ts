"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentSlotKey } from "@/lib/types";

export async function equipItemAction(
  characterId: string,
  slot: EquipmentSlotKey,
  ringIndex: number,
  itemId: string,
) {
  if (!itemId) return;

  const supabase = await createClient();

  // 対象アイテムが既に別スロットに装備されていれば先に外す（unique制約対策）
  const { error: clearError } = await supabase
    .from("character_equipment")
    .update({ equipped_item_id: null })
    .eq("equipped_item_id", itemId);
  if (clearError) throw new Error(clearError.message);

  const { error } = await supabase.from("character_equipment").upsert(
    {
      character_id: characterId,
      slot,
      ring_index: ringIndex,
      equipped_item_id: itemId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "character_id,slot,ring_index" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function unequipSlotAction(
  characterId: string,
  slot: EquipmentSlotKey,
  ringIndex: number,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("character_equipment")
    .update({ equipped_item_id: null, updated_at: new Date().toISOString() })
    .eq("character_id", characterId)
    .eq("slot", slot)
    .eq("ring_index", ringIndex);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
