import { createClient } from "@/lib/supabase/server";
import { createOptionTypeAction, deleteOptionTypeAction, updateOptionTypeAction } from "./actions";

export default async function OptionTypesPage() {
  const supabase = await createClient();
  const { data: optionTypes } = await supabase
    .from("stat_types")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <main className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold">オプション項目マスタ</h1>
        <p className="mt-1 text-sm text-slate-600">
          装備の各スロットに設定できるオプション項目（例: 火属性強化、攻撃速度など）と、その単位・上限値を管理します。
        </p>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">新規項目追加</h2>
        <form action={createOptionTypeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
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
            単位
            <select
              name="unit"
              defaultValue="percent"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="percent">%（割合）</option>
              <option value="number">数値</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            上限値（任意）
            <input
              name="cap_value"
              type="number"
              min={0}
              step={0.01}
              placeholder="例: 400"
              className="w-32 rounded border border-slate-300 px-3 py-2 text-slate-900"
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
        {(optionTypes ?? []).length === 0 && (
          <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
            まだオプション項目がありません。
          </p>
        )}
        {(optionTypes ?? []).map((optionType) => {
          const updateWithId = updateOptionTypeAction.bind(null, optionType.id);
          const deleteWithId = deleteOptionTypeAction.bind(null, optionType.id);
          return (
            <div
              key={optionType.id}
              className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 sm:flex-row sm:items-end"
            >
              <form action={updateWithId} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
                  項目名
                  <input
                    name="name"
                    required
                    defaultValue={optionType.name}
                    className="rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600">
                  単位
                  <select
                    name="unit"
                    defaultValue={optionType.is_percent ? "percent" : "number"}
                    className="rounded border border-slate-300 px-3 py-2 text-slate-900"
                  >
                    <option value="percent">%（割合）</option>
                    <option value="number">数値</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-600">
                  上限値
                  <input
                    name="cap_value"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={optionType.cap_value ?? ""}
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
