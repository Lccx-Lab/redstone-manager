import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAccountAction } from "./actions";

export default async function AccountsPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-lg font-bold">アカウント管理</h1>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">新規アカウント追加</h2>
        <form action={createAccountAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            アカウント名
            <input
              name="name"
              required
              placeholder="例: メインアカウント"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            メモ
            <input
              name="memo"
              placeholder="任意"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            追加
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        {(accounts ?? []).length === 0 && (
          <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            まだアカウントがありません。
          </p>
        )}
        {(accounts ?? []).map((account) => (
          <Link
            key={account.id}
            href={`/accounts/${account.id}`}
            className="flex items-center justify-between rounded border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium">{account.name}</p>
              {account.memo && <p className="text-xs text-slate-600">{account.memo}</p>}
            </div>
            <span className="text-sm text-slate-600">詳細 →</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
