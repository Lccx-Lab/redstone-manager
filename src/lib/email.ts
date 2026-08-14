import { Resend } from "resend";

export async function sendMainQuestReminderEmail(characterName: string, to: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) {
    console.warn("RESEND_API_KEY が未設定、または送信先メールアドレスがないためメール送信をスキップしました");
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.NOTIFICATION_FROM_EMAIL || "REDSTONE Manager <onboarding@resend.dev>",
    to,
    subject: `【REDSTONE Manager】${characterName} のメインクエストが更新可能です`,
    text: `${characterName} のメインクエストが更新可能になりました。ゲーム内で更新してください。`,
  });

  if (error) throw new Error(error.message);
}
