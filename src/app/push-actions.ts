"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/push";

export async function savePushSubscriptionAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      owner_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw new Error(error.message);
}

export async function deletePushSubscriptionAction(endpoint: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw new Error(error.message);
}

export async function sendTestPushNotificationAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("owner_id", user.id);
  if (error) throw new Error(error.message);

  if (!subscriptions || subscriptions.length === 0) {
    throw new Error("有効な通知購読が見つかりません");
  }

  let sent = 0;
  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, {
        title: "REDSTONE Manager",
        body: "テスト通知です。これが届けばブラウザ通知は正常に動作しています。",
        url: "/",
      });
      if (result.expired) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
      } else {
        sent += 1;
      }
    } catch {
      // 個別の送信失敗は無視して他の購読への送信を続ける
    }
  }

  if (sent === 0) {
    throw new Error("通知の送信に失敗しました（購読が失効している可能性があります）");
  }
}
