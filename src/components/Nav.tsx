import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header
      className="border-b border-brand-950"
      style={{ background: "linear-gradient(to bottom, #8a1614 0%, #470000 100%)" }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/redstone-logo.png" alt="REDSTONE" width={102} height={66} priority />
          <span className="font-bold text-brand-50">Manager</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link href="/equipment-items" className="text-sm text-brand-100 hover:text-white hover:underline">
              装備アイテム
            </Link>
            <Link href="/stat-types" className="text-sm text-brand-100 hover:text-white hover:underline">
              ステータス項目
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-brand-100 hover:text-white hover:underline">
                ログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
