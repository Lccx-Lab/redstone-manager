import type { StatusScreenshot } from "@/lib/types";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import {
  deleteStatusScreenshotAction,
  updateLevelAction,
  uploadStatusScreenshotAction,
} from "./status-actions";

type StatusScreenshotWithUrl = StatusScreenshot & { url: string | null };

export function StatusPanel({
  characterId,
  level,
  screenshots,
}: {
  characterId: string;
  level: number | null;
  screenshots: StatusScreenshotWithUrl[];
}) {
  const levelAction = updateLevelAction.bind(null, characterId);
  const uploadAction = uploadStatusScreenshotAction.bind(null, characterId);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-600">レベル</h2>
        <form action={levelAction} className="flex items-end gap-2">
          <input
            name="level"
            type="number"
            min={0}
            step={1}
            defaultValue={level ?? ""}
            placeholder="未設定"
            className="w-32 rounded border border-slate-300 px-3 py-2 text-slate-900"
          />
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            保存
          </button>
        </form>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">ステータス画面スクリーンショット</h2>
        <ScreenshotGallery
          screenshots={screenshots}
          uploadAction={uploadAction}
          makeDeleteAction={(screenshotId, storagePath) =>
            deleteStatusScreenshotAction.bind(null, characterId, screenshotId, storagePath)
          }
          emptyLabel="ステータス画面のスクリーンショットはまだありません。"
          altFallback="ステータス画面"
        />
      </section>
    </div>
  );
}
