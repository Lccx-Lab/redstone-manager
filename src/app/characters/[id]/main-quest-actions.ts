"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseJstDateTimeInputValue } from "@/lib/reset";

export async function markMainQuestUpdatedAction(characterId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({
      main_quest_updated_at: new Date().toISOString(),
      main_quest_notification_sent: false,
    })
    .eq("id", characterId);
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
}

export async function setMainQuestUpdatedAtAction(characterId: string, formData: FormData) {
  const raw = String(formData.get("updated_at") ?? "");
  const date = parseJstDateTimeInputValue(raw);
  if (!date || Number.isNaN(date.getTime())) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({
      main_quest_updated_at: date.toISOString(),
      main_quest_notification_sent: false,
    })
    .eq("id", characterId);
  if (error) throw new Error(error.message);

  revalidatePath(`/characters/${characterId}`);
}
