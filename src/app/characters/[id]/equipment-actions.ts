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

  const { data: equipmentRow, error: upsertError } = await supabase
    .from("character_equipment")
    .upsert(
      {
        character_id: characterId,
        slot,
        ring_index: ringIndex,
        item_name: itemName,
        memo,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "character_id,slot,ring_index" },
    )
    .select("id")
    .single();
  if (upsertError) throw new Error(upsertError.message);

  const statTypeIds = formData.getAll("stat_type[]").map(String);
  const statValues = formData.getAll("stat_value[]").map(String);

  // 同じステータス項目が複数行選択された場合はユニーク制約に抵触するため合算する
  const mergedStats = new Map<string, number>();
  statTypeIds.forEach((statTypeId, i) => {
    if (statTypeId === "") return;
    const value = Number(statValues[i]) || 0;
    mergedStats.set(statTypeId, (mergedStats.get(statTypeId) ?? 0) + value);
  });

  const statRows = Array.from(mergedStats.entries()).map(([statTypeId, valuePercent]) => ({
    character_equipment_id: equipmentRow.id as string,
    stat_type_id: statTypeId,
    value_percent: valuePercent,
  }));

  const { error: deleteError } = await supabase
    .from("character_equipment_stats")
    .delete()
    .eq("character_equipment_id", equipmentRow.id);
  if (deleteError) throw new Error(deleteError.message);

  if (statRows.length > 0) {
    const { error: insertError } = await supabase
      .from("character_equipment_stats")
      .insert(statRows);
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/characters/${characterId}`);
}
