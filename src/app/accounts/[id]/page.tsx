import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateAccountAction, deleteAccountAction } from "../actions";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase.from("accounts").select("*").eq("id", id).single();
  if (!account) notFound();

  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("account_id", id)
    .order("created_at", { ascending: true });

  const updateWithId = updateAccountAction.bind(null, id);
  const deleteWithId = deleteAccountAction.bind(null, id);

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{account.name}</h1>
        <Link href="/accounts" className="text-sm text-slate-500 hover:underline">
          ← アカウント一覧
        </Link>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">アカウント情報の編集</h2>
        <form action={updateWithId} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            アカウント名
            <input
              name="name"
              required
              defaultValue={account.name}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            メモ
            <input
              name="memo"
              defaultValue={account.memo ?? ""}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            保存
          </button>
        </form>
        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="text-xs text-red-500 hover:underline">
            このアカウントを削除する（所属キャラクター・装備・タスクも全て削除されます）
          </button>
        </form>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-600">キャラクター一覧</h2>
          <Link
            href={`/characters/new?account_id=${account.id}`}
            className="text-sm text-slate-500 hover:underline"
          >
            + キャラクター追加
          </Link>
        </div>
        {(characters ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">キャラクター未登録</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(characters ?? []).map((character) => (
              <li key={character.id}>
                <Link
                  href={`/characters/${character.id}`}
                  className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <span className="font-medium">
                    {character.name}
                    {character.level != null && (
                      <span className="ml-1 text-xs font-normal text-slate-400">Lv.{character.level}</span>
                    )}
                  </span>
                  {character.job && <span className="text-xs text-slate-500">{character.job}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
