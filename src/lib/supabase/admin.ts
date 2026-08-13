import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * RLSを回避するService Roleクライアント。
 * Cronなどログインセッションを持たないサーバー処理専用。
 * NEXT_PUBLIC_ 系ではない SUPABASE_SERVICE_ROLE_KEY を使うため、
 * クライアントサイドのバンドルには絶対に含めないこと。
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
