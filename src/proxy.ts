import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: いわゆる middleware は Proxy に名称変更されている（機能は同一）
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // sw.js はService Workerの仕様上リダイレクト応答を返せないため対象外にする
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
