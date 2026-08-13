import { EQUIPMENT_SLOTS, RING_SLOT_COUNT } from "@/lib/types";
import type { CharacterEquipment } from "@/lib/types";
import { saveEquipmentAction } from "./equipment-actions";

export function EquipmentForm({
  characterId,
  equipment,
}: {
  characterId: string;
  equipment: CharacterEquipment[];
}) {
  const find = (slot: string, ringIndex: number) =>
    equipment.find((e) => e.slot === slot && e.ring_index === ringIndex);

  const action = saveEquipmentAction.bind(null, characterId);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {EQUIPMENT_SLOTS.map((slot) => {
          const current = find(slot.key, 0);
          return (
            <div key={slot.key} className="rounded border border-slate-200 bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-slate-600">{slot.label}</p>
              <input
                name={`${slot.key}__item_name`}
                defaultValue={current?.item_name ?? ""}
                placeholder="アイテム名"
                className="mb-2 w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
              />
              <input
                name={`${slot.key}__memo`}
                defaultValue={current?.memo ?? ""}
                placeholder="メモ（任意）"
                className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
              />
            </div>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-600">指（10スロット）</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: RING_SLOT_COUNT }, (_, i) => i + 1).map((ringIndex) => {
            const current = find("ring", ringIndex);
            return (
              <div key={ringIndex} className="rounded border border-slate-200 bg-white p-3">
                <p className="mb-2 text-sm font-semibold text-slate-600">指 {ringIndex}</p>
                <input
                  name={`ring_${ringIndex}__item_name`}
                  defaultValue={current?.item_name ?? ""}
                  placeholder="アイテム名"
                  className="mb-2 w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                />
                <input
                  name={`ring_${ringIndex}__memo`}
                  defaultValue={current?.memo ?? ""}
                  placeholder="メモ（任意）"
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        装備を保存
      </button>
    </form>
  );
}
