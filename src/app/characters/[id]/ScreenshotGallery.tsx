import {
  deleteScreenshotAction,
  updateScreenshotCaptionAction,
  uploadScreenshotAction,
} from "./screenshot-actions";

type Screenshot = {
  id: string;
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  url: string | null;
};

export function ScreenshotGallery({
  characterId,
  screenshots,
}: {
  characterId: string;
  screenshots: Screenshot[];
}) {
  const uploadAction = uploadScreenshotAction.bind(null, characterId);

  return (
    <section className="flex flex-col gap-4">
      <form
        action={uploadAction}
        encType="multipart/form-data"
        className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
          スクリーンショット
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-sm text-slate-900"
          />
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
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          スクリーンショットはまだありません。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((shot) => {
            const deleteAction = deleteScreenshotAction.bind(
              null,
              characterId,
              shot.id,
              shot.storage_path,
            );
            const captionAction = updateScreenshotCaptionAction.bind(null, characterId, shot.id);
            return (
              <div key={shot.id} className="flex flex-col gap-2 rounded border border-slate-200 bg-white p-3">
                {shot.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shot.url}
                    alt={shot.caption ?? "装備スクリーンショット"}
                    className="aspect-video w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                    画像を読み込めません
                  </div>
                )}
                <form action={captionAction} className="flex gap-2">
                  <input
                    name="caption"
                    defaultValue={shot.caption ?? ""}
                    placeholder="メモ"
                    className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                  />
                  <button type="submit" className="rounded border border-slate-300 px-2 text-xs text-slate-600">
                    保存
                  </button>
                </form>
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
  );
}
