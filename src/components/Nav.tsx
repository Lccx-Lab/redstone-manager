import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-slate-900">
          REDSTONE Manager
        </Link>
        {user && (
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-500 hover:underline">
              ログアウト
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
