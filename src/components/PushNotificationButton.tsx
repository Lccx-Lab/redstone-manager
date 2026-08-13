"use client";

import { useEffect, useState } from "react";
import { deletePushSubscriptionAction, savePushSubscriptionAction } from "@/app/push-actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  // 環境変数のコピペ時に混入しがちな空白・改行を除去してからデコードする
  const cleaned = base64String.trim().replace(/\s+/g, "");
  const padding = "=".repeat((4 - (cleaned.length % 4)) % 4);
  const base64 = (cleaned + padding).replace(/-/g, "+").replace(/_/g, "/");

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    const invalidChars = Array.from(new Set(cleaned.split("").filter((c) => !/[A-Za-z0-9_-]/.test(c))));
    throw new Error(
      `VAPID公開鍵の形式が不正です（長さ:${cleaned.length}文字, 先頭:"${cleaned.slice(0, 6)}", 末尾:"${cleaned.slice(-6)}"${
        invalidChars.length > 0 ? `, 不正な文字:${invalidChars.map((c) => JSON.stringify(c)).join(",")}` : ""
      }）。NEXT_PUBLIC_VAPID_PUBLIC_KEY の値を確認してください。`,
    );
  }

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = "checking" | "unsupported" | "idle" | "subscribed" | "loading";

export function PushNotificationButton({ vapidPublicKey }: { vapidPublicKey: string }) {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSupport() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const existing = await registration.pushManager.getSubscription();
        if (!cancelled) setStatus(existing ? "subscribed" : "idle");
      } catch {
        if (!cancelled) setStatus("idle");
      }
    }

    checkSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  async function subscribe() {
    setError(null);
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("通知が許可されませんでした");
        setStatus("idle");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("購読情報の取得に失敗しました");
      }
      await savePushSubscriptionAction({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setStatus("subscribed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知の設定に失敗しました");
      setStatus("idle");
    }
  }

  async function unsubscribe() {
    setError(null);
    setStatus("loading");
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscriptionAction(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "解除に失敗しました");
      setStatus("subscribed");
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-500">{error}</span>}
      {status === "subscribed" ? (
        <button
          type="button"
          onClick={unsubscribe}
          className="text-xs text-slate-600 hover:underline"
        >
          🔔 ブラウザ通知: 有効（解除する）
        </button>
      ) : (
        <button
          type="button"
          onClick={subscribe}
          disabled={status === "loading"}
          className="text-xs text-brand-700 hover:underline disabled:opacity-50"
        >
          🔔 ブラウザ通知を有効にする
        </button>
      )}
    </div>
  );
}
