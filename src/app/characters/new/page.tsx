import { createClient } from "@/lib/supabase/server";
import { createCharacterAction } from "../actions";

export default async function NewCharacterPage({
  searchParams,
}: {
  searchParams: Promise<{ account_id?: string }>;
}) {
  const { account_id: presetAccountId } = await searchParams;
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name")
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-lg font-bold">キャラクター追加</h1>

      {(accounts ?? []).length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          先にアカウントを登録してください。
        </p>
      ) : (
        <form action={createCharacterAction} className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            所属アカウント
            <select
              name="account_id"
              required
              defaultValue={presetAccountId ?? ""}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="" disabled>
                選択してください
              </option>
              {(accounts ?? []).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            キャラクター名
            <input
              name="name"
              required
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            職業（任意）
            <input
              name="job"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            追加
          </button>
        </form>
      )}
    </main>
  );
}
