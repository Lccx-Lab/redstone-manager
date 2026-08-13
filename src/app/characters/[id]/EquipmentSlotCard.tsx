import type { EquipmentSlotKey } from "@/lib/types";
import type { ScreenshotWithUrl, SlotEquipment } from "./data";
import { saveEquipmentSlotAction } from "./equipment-actions";
import { deleteScreenshotAction, uploadScreenshotAction } from "./screenshot-actions";

export function EquipmentSlotCard({
  characterId,
  slot,
  ringIndex,
  label,
  equipment,
  screenshots,
}: {
  characterId: string;
  slot: EquipmentSlotKey;
  ringIndex: number;
  label: string;
  equipment: SlotEquipment | undefined;
  screenshots: ScreenshotWithUrl[];
}) {
  const saveAction = saveEquipmentSlotAction.bind(null, characterId, slot, ringIndex);
  const uploadAction = uploadScreenshotAction.bind(null, characterId, slot, ringIndex);

  return (
    <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-3">
      <p className="text-sm font-semibold text-slate-600">{label}</p>

      <form action={saveAction} className="flex flex-col gap-2">
        <input
          name="item_name"
          defaultValue={equipment?.itemName ?? ""}
          placeholder="アイテム名"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
        />
        <input
          name="memo"
          defaultValue={equipment?.memo ?? ""}
          placeholder="メモ（任意）"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
        />
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
            const deleteAction = deleteScreenshotAction.bind(
              null,
              characterId,
              shot.id,
              shot.storage_path,
            );
            return (
              <div key={shot.id} className="flex flex-col gap-1">
                {shot.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shot.url}
                    alt={shot.caption ?? label}
                    className="aspect-video w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center rounded bg-slate-100 text-[10px] text-slate-400">
                    読み込み失敗
                  </div>
                )}
                {shot.caption && <p className="truncate text-[11px] text-slate-500">{shot.caption}</p>}
                <form action={deleteAction}>
                  <button type="submit" className="text-[11px] text-red-400 hover:underline">
                    削除
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}

      <form action={uploadAction} encType="multipart/form-data" className="flex flex-col gap-2 border-t border-slate-100 pt-2">
        <input type="file" name="file" accept="image/*" required className="text-xs text-slate-900" />
        <input
          name="caption"
          placeholder="メモ（任意）"
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900"
        />
        <button
          type="submit"
          className="self-start rounded bg-slate-900 px-3 py-1 text-xs text-white hover:bg-slate-700"
        >
          スクショ追加
        </button>
      </form>
    </div>
  );
}
