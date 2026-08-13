import type { EquipmentItem, StatType } from "@/lib/types";
import { StatRowsEditor } from "@/components/StatRowsEditor";
import { ZoomableImage } from "@/components/ZoomableImage";
import {
  deleteItemAction,
  deleteItemScreenshotAction,
  duplicateItemAction,
  updateItemAction,
  uploadItemScreenshotAction,
} from "./actions";

type ItemScreenshot = {
  id: string;
  storage_path: string;
  caption: string | null;
  url: string | null;
};

export function ItemCard({
  item,
  statTypes,
  stats,
  screenshots,
  equippedInfo,
}: {
  item: EquipmentItem;
  statTypes: StatType[];
  stats: { statTypeId: string; value: number }[];
  screenshots: ItemScreenshot[];
  equippedInfo: string | null;
}) {
  const updateAction = updateItemAction.bind(null, item.id);
  const deleteAction = deleteItemAction.bind(null, item.id);
  const duplicateAction = duplicateItemAction.bind(null, item.id);
  const uploadAction = uploadItemScreenshotAction.bind(null, item.id);
  const statTypeOptions = statTypes.map((st) => ({ id: st.id, name: st.name, isPercent: st.is_percent }));

  return (
    <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-3">
      {equippedInfo && (
        <p className="text-xs font-semibold text-brand-700">装備中: {equippedInfo}</p>
      )}

      <form action={updateAction} className="flex flex-col gap-2">
        <input
          name="name"
          required
          defaultValue={item.name}
          placeholder="アイテム名"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
        />
        <input
          name="memo"
          defaultValue={item.memo ?? ""}
          placeholder="メモ（任意）"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
        />
        <StatRowsEditor statTypeOptions={statTypeOptions} initialStats={stats} />
        <button
          type="submit"
          className="self-start rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          保存
        </button>
      </form>

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {screenshots.map((shot) => {
            const deleteShotAction = deleteItemScreenshotAction.bind(
              null,
              item.id,
              shot.id,
              shot.storage_path,
            );
            return (
              <div key={shot.id} className="flex flex-col gap-1">
                {shot.url ? (
                  <ZoomableImage
                    src={shot.url}
                    alt={shot.caption ?? item.name}
                    className="aspect-video w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded bg-slate-100 text-[10px] text-slate-600">
                    読み込み失敗
                  </div>
                )}
                {shot.caption && <p className="truncate text-[11px] text-slate-600">{shot.caption}</p>}
                <form action={deleteShotAction}>
                  <button type="submit" className="text-[11px] text-red-500 hover:underline">
                    削除
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <form action={uploadAction} className="flex flex-col gap-2 border-t border-slate-100 pt-2">
        <input type="file" name="file" accept="image/*" required className="text-xs text-slate-900" />
        <input
          name="caption"
          placeholder="メモ（任意）"
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
        />
        <button
          type="submit"
          className="self-start rounded bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700"
        >
          スクショ追加
        </button>
      </form>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-2">
        <form action={duplicateAction}>
          <button type="submit" className="text-xs text-slate-600 hover:underline">
            複製
          </button>
        </form>
        <form action={deleteAction}>
          <button type="submit" className="text-xs text-red-500 hover:underline">
            削除
          </button>
        </form>
      </div>
    </div>
  );
}
