import { computeNextMainQuestAvailableAt, isMainQuestAvailable } from "@/lib/mainQuest";
import { formatJstDateTime, formatJstDateTimeInputValue } from "@/lib/reset";
import { markMainQuestUpdatedAction, setMainQuestUpdatedAtAction } from "./main-quest-actions";

export function MainQuestPanel({
  characterId,
  mainQuestUpdatedAt,
}: {
  characterId: string;
  mainQuestUpdatedAt: string | null;
}) {
  const lastUpdated = mainQuestUpdatedAt ? new Date(mainQuestUpdatedAt) : null;
  const available = isMainQuestAvailable(lastUpdated);
  const nextAvailableAt = lastUpdated ? computeNextMainQuestAvailableAt(lastUpdated) : null;
  const markNowAction = markMainQuestUpdatedAction.bind(null, characterId);
  const setAtAction = setMainQuestUpdatedAtAction.bind(null, characterId);

  return (
    <section className="rounded border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-600">メインクエスト</h2>
          {lastUpdated ? (
            <p className="mt-1 text-sm text-slate-500">
              前回更新: {formatJstDateTime(lastUpdated)}
              <br />
              次回更新可能:{" "}
              <span className={available ? "font-semibold text-emerald-600" : "text-slate-700"}>
                {nextAvailableAt ? formatJstDateTime(nextAvailableAt) : ""}
                {available && "（更新可能）"}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">まだ記録がありません。</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <form action={markNowAction}>
            <button
              type="submit"
              className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
            >
              今日更新した
            </button>
          </form>

          <form action={setAtAction} className="flex items-center gap-2">
            <input
              type="datetime-local"
              name="updated_at"
              defaultValue={lastUpdated ? formatJstDateTimeInputValue(lastUpdated) : ""}
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
            />
            <button
              type="submit"
              className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
            >
              この日時で保存
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
