import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メール確認リンク（サインアップ・パスワードリセット等）から戻ってきた際に
// 認証コードをセッションへ交換するためのハンドラ。
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent("認証リンクが無効か期限切れです")}`, request.url),
  );
}
