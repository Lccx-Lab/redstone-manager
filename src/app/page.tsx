import Link from "next/link";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const { accounts, summaries } = await getDashboardData();

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ダッシュボード</h1>
        <Link
          href="/accounts"
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
        >
          アカウントを管理
        </Link>
      </div>

      {accounts.length === 0 && (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          まだアカウントが登録されていません。「アカウントを管理」から追加してください。
        </p>
      )}

      <div className="flex flex-col gap-4">
        {accounts.map((account) => (
          <section key={account.id} className="rounded border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{account.name}</h2>
              <Link
                href={`/characters/new?account_id=${account.id}`}
                className="text-sm text-slate-500 hover:underline"
              >
                + キャラクター追加
              </Link>
            </div>

            {account.characters.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">キャラクター未登録</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {account.characters.map((character) => {
                  const summary = summaries.get(character.id);
                  const dailyRemaining = summary ? summary.dailyTotal - summary.dailyDone : 0;
                  const weeklyRemaining = summary ? summary.weeklyTotal - summary.weeklyDone : 0;
                  return (
                    <li key={character.id}>
                      <Link
                        href={`/characters/${character.id}`}
                        className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 hover:bg-slate-50"
                      >
                        <span className="font-medium">{character.name}</span>
                        <span className="flex gap-3 text-xs text-slate-500">
                          <span>
                            デイリー未完了 {dailyRemaining}/{summary?.dailyTotal ?? 0}
                          </span>
                          <span>
                            ウィークリー未完了 {weeklyRemaining}/{summary?.weeklyTotal ?? 0}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
