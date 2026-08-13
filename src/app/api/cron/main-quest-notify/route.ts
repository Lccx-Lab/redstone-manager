import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMainQuestAvailable } from "@/lib/mainQuest";
import { sendMainQuestReminderEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: characters, error } = await supabase
    .from("characters")
    .select("id, name, main_quest_updated_at")
    .not("main_quest_updated_at", "is", null)
    .eq("main_quest_notification_sent", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  let notified = 0;

  for (const character of characters ?? []) {
    const lastUpdated = new Date(character.main_quest_updated_at as string);
    if (!isMainQuestAvailable(lastUpdated, now)) continue;

    await sendMainQuestReminderEmail(character.name);
    await supabase
      .from("characters")
      .update({ main_quest_notification_sent: true })
      .eq("id", character.id);
    notified += 1;
  }

  return NextResponse.json({ checked: characters?.length ?? 0, notified });
}
