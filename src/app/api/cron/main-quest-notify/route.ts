import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMainQuestAvailable } from "@/lib/mainQuest";
import { sendMainQuestReminderEmail } from "@/lib/email";
import { sendPushNotification } from "@/lib/push";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: characters, error } = await supabase
    .from("characters")
    .select("id, name, owner_id, main_quest_updated_at")
    .not("main_quest_updated_at", "is", null)
    .eq("main_quest_notification_sent", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  let notified = 0;
  const ownerEmailCache = new Map<string, string | null>();

  async function getOwnerEmail(ownerId: string): Promise<string | null> {
    if (ownerEmailCache.has(ownerId)) return ownerEmailCache.get(ownerId) ?? null;
    const { data, error: userError } = await supabase.auth.admin.getUserById(ownerId);
    const email = userError ? null : (data.user?.email ?? null);
    ownerEmailCache.set(ownerId, email);
    return email;
  }

  for (const character of characters ?? []) {
    const lastUpdated = new Date(character.main_quest_updated_at as string);
    if (!isMainQuestAvailable(lastUpdated, now)) continue;

    const ownerEmail = await getOwnerEmail(character.owner_id);
    if (ownerEmail) {
      await sendMainQuestReminderEmail(character.name, ownerEmail);
    }

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("owner_id", character.owner_id);

    for (const subscription of subscriptions ?? []) {
      try {
        const result = await sendPushNotification(subscription, {
          title: "REDSTONE Manager",
          body: `${character.name} のメインクエストが更新可能です`,
          url: "/",
        });
        if (result.expired) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
        }
      } catch {
        // 1件の送信失敗で通知処理全体を止めない
      }
    }

    await supabase
      .from("characters")
      .update({ main_quest_notification_sent: true })
      .eq("id", character.id);
    notified += 1;
  }

  return NextResponse.json({ checked: characters?.length ?? 0, notified });
}
