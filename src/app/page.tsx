import Link from "next/link";
import { getDashboardData } from "@/lib/data";
import { isMainQuestAvailable } from "@/lib/mainQuest";
import { PushNotificationButton } from "@/components/PushNotificationButton";

export default async function DashboardPage() {
  const { accounts, summaries } = await getDashboardData();

  const mainQuestReady = accounts.flatMap((account) =>
    account.characters
      .filter(
        (c) => c.main_quest_updated_at && isMainQuestAvailable(new Date(c.main_quest_updated_at)),
      )
      .map((character) => ({ accountName: account.name, character })),
  );

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">ダッシュボード</h1>
        <div className="flex items-center gap-4">
          {vapidPublicKey && <PushNotificationButton vapidPublicKey={vapidPublicKey} />}
          <Link
            href="/accounts"
            className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
          >
            アカウントを管理
          </Link>
        </div>
      </div>

      {mainQuestReady.length > 0 && (
        <section className="rounded border border-brand-200 bg-brand-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-brand-700">
            本日メインクエスト更新可能
          </h2>
          <ul className="flex flex-col gap-1">
            {mainQuestReady.map(({ accountName, character }) => (
              <li key={character.id}>
                <Link
                  href={`/characters/${character.id}`}
                  className="text-sm text-slate-900 hover:underline"
                >
                  {accountName} / {character.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {accounts.length === 0 && (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
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
                className="text-sm text-slate-600 hover:underline"
              >
                + キャラクター追加
              </Link>
            </div>

            {account.characters.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">キャラクター未登録</p>
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
                        <span className="font-medium">
                          {character.name}
                          {character.level != null && (
                            <span className="ml-1 text-xs font-normal text-slate-600">
                              Lv.{character.level}
                            </span>
                          )}
                        </span>
                        <span className="flex gap-3 text-xs text-slate-600">
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
