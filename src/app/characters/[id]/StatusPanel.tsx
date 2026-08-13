import type { StatusScreenshot } from "@/lib/types";
import { ZoomableImage } from "@/components/ZoomableImage";
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
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            保存
          </button>
        </form>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">ステータス画面スクリーンショット</h2>

        <form action={uploadAction} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            画像
            <input type="file" name="file" accept="image/*" required className="text-sm text-slate-900" />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            メモ（任意）
            <input
              name="caption"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            アップロード
          </button>
        </form>

        {screenshots.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            ステータス画面のスクリーンショットはまだありません。
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screenshots.map((shot) => {
              const deleteAction = deleteStatusScreenshotAction.bind(
                null,
                characterId,
                shot.id,
                shot.storage_path,
              );
              return (
                <div key={shot.id} className="flex flex-col gap-2 rounded border border-slate-200 p-3">
                  {shot.url ? (
                    <ZoomableImage
                      src={shot.url}
                      alt={shot.caption ?? "ステータス画面"}
                      className="aspect-video w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                      画像を読み込めません
                    </div>
                  )}
                  {shot.caption && <p className="truncate text-xs text-slate-500">{shot.caption}</p>}
                  <form action={deleteAction}>
                    <button type="submit" className="text-xs text-red-400 hover:underline">
                      削除
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
