import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { BoxIcon, LogoutIcon, SlidersIcon, UserIcon } from "@/components/icons";

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
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/redstone-logo.png" alt="REDSTONE" width={102} height={66} priority />
          <span className="font-bold text-brand-50">Manager</span>
        </Link>
        {user && (
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/accounts"
              className="flex items-center gap-1.5 text-sm text-brand-100 hover:text-white hover:underline"
            >
              <UserIcon />
              アカウント管理
            </Link>
            <Link
              href="/equipment-items"
              className="flex items-center gap-1.5 text-sm text-brand-100 hover:text-white hover:underline"
            >
              <BoxIcon />
              装備アイテム管理
            </Link>
            <Link
              href="/option-types"
              className="flex items-center gap-1.5 text-sm text-brand-100 hover:text-white hover:underline"
            >
              <SlidersIcon />
              オプション管理
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-brand-100 hover:text-white hover:underline"
              >
                <LogoutIcon />
                ログアウト
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
