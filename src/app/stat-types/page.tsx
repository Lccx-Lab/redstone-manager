import { createClient } from "@/lib/supabase/server";
import { createStatTypeAction, deleteStatTypeAction, updateStatTypeAction } from "./actions";

export default async function StatTypesPage() {
  const supabase = await createClient();
  const { data: statTypes } = await supabase
    .from("stat_types")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold">ステータス項目マスタ</h1>
        <p className="mt-1 text-sm text-slate-500">
          装備の各スロットに設定できるステータス項目（例: 火属性強化、攻撃速度など）と、その上限値を管理します。
        </p>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">新規項目追加</h2>
        <form action={createStatTypeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            項目名
            <input
              name="name"
              required
              placeholder="例: 火属性強化"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            上限%（任意）
            <input
              name="cap_percent"
              type="number"
              min={0}
              step={0.01}
              placeholder="例: 400"
              className="w-32 rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            追加
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        {(statTypes ?? []).length === 0 && (
          <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            まだステータス項目がありません。
          </p>
        )}
        {(statTypes ?? []).map((statType) => {
          const updateWithId = updateStatTypeAction.bind(null, statType.id);
          const deleteWithId = deleteStatTypeAction.bind(null, statType.id);
          return (
            <div
              key={statType.id}
              className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 sm:flex-row sm:items-end"
            >
              <form action={updateWithId} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
                  項目名
                  <input
                    name="name"
                    required
                    defaultValue={statType.name}
                    className="rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600">
                  上限%
                  <input
                    name="cap_percent"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={statType.cap_percent ?? ""}
                    placeholder="上限なし"
                    className="w-32 rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  保存
                </button>
              </form>
              <form action={deleteWithId}>
                <button type="submit" className="text-xs text-red-500 hover:underline">
                  削除
                </button>
              </form>
            </div>
          );
        })}
      </section>
    </main>
  );
}
