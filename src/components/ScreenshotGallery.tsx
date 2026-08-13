import { ZoomableImage } from "@/components/ZoomableImage";

type Screenshot = {
  id: string;
  storage_path: string;
  caption: string | null;
  url: string | null;
};

export function ScreenshotGallery({
  screenshots,
  uploadAction,
  makeDeleteAction,
  emptyLabel = "スクリーンショットはまだありません。",
  altFallback = "スクリーンショット",
}: {
  screenshots: Screenshot[];
  uploadAction: (formData: FormData) => Promise<void>;
  makeDeleteAction: (screenshotId: string, storagePath: string) => (formData: FormData) => Promise<void>;
  emptyLabel?: string;
  altFallback?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <form action={uploadAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
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
          className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
        >
          アップロード
        </button>
      </form>

      {screenshots.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          {emptyLabel}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {screenshots.map((shot) => (
            <div key={shot.id} className="flex flex-col gap-2 rounded border border-slate-200 p-3">
              {shot.url ? (
                <ZoomableImage
                  src={shot.url}
                  alt={shot.caption ?? altFallback}
                  className="aspect-video w-full rounded object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
                  画像を読み込めません
                </div>
              )}
              {shot.caption && <p className="truncate text-xs text-slate-500">{shot.caption}</p>}
              <form action={makeDeleteAction(shot.id, shot.storage_path)}>
                <button type="submit" className="text-xs text-red-400 hover:underline">
                  削除
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
