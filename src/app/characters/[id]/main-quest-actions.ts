"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
