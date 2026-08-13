"use client";

import { useState, useTransition } from "react";
import { EQUIPMENT_SLOTS, RING_SLOT_COUNT, equipmentSlotStorageKey } from "@/lib/types";
import type { EquipmentSlotKey, StatType } from "@/lib/types";
import type { EquippedItemDetail, LibraryItem } from "./data";
import { equipItemAction, unequipSlotAction } from "./equipment-actions";
import { EquipmentSlotCard } from "./EquipmentSlotCard";

type BoardSlotDef = { slot: EquipmentSlotKey; ringIndex: number; label: string };

const SLOT_DEFS: BoardSlotDef[] = [
  ...EQUIPMENT_SLOTS.map((s) => ({ slot: s.key as EquipmentSlotKey, ringIndex: 0, label: s.label })),
  ...Array.from({ length: RING_SLOT_COUNT }, (_, i) => ({
    slot: "ring" as EquipmentSlotKey,
    ringIndex: i + 1,
    label: `指 ${i + 1}`,
  })),
];

type DragPayload = { itemId: string; slot: EquipmentSlotKey };

export function EquipmentBoard({
  characterId,
  equippedBySlot,
  itemLibrary,
  statTypes,
}: {
  characterId: string;
  equippedBySlot: Map<string, EquippedItemDetail | null>;
  itemLibrary: LibraryItem[];
  statTypes: StatType[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  function equip(slot: EquipmentSlotKey, ringIndex: number, itemId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await equipItemAction(characterId, slot, ringIndex, itemId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "装備に失敗しました");
      }
    });
  }

  function unequip(slot: EquipmentSlotKey, ringIndex: number) {
    setError(null);
    startTransition(async () => {
      try {
        await unequipSlotAction(characterId, slot, ringIndex);
      } catch (e) {
        setError(e instanceof Error ? e.message : "解除に失敗しました");
      }
    });
  }

  function handleDrop(slot: EquipmentSlotKey, ringIndex: number, e: React.DragEvent) {
    e.preventDefault();
    setDragOverKey(null);
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    try {
      const payload = JSON.parse(raw) as DragPayload;
      if (payload.slot !== slot) {
        setError("その部位には装備できません");
        return;
      }
      equip(slot, ringIndex, payload.itemId);
    } catch {
      // 不正なペイロードは無視
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">
          アイテム一覧（ドラッグしてスロットへ装備）
        </h2>
        {itemLibrary.length === 0 ? (
          <p className="text-sm text-slate-400">
            装備アイテムがまだありません。ヘッダーの「装備アイテム」から作成してください。
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {itemLibrary.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ itemId: item.id, slot: item.slot } satisfies DragPayload),
                  );
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="cursor-grab rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-700 active:cursor-grabbing"
                title={item.equippedOn ? `装備中: ${item.equippedOn}` : "未装備"}
              >
                <div>
                  {item.name}
                  {item.equippedOn && (
                    <span className="ml-1 text-[10px] text-brand-700">（{item.equippedOn}）</span>
                  )}
                </div>
                {item.memo && <div className="text-[10px] text-slate-400">{item.memo}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SLOT_DEFS.map(({ slot, ringIndex, label }) => {
          const key = equipmentSlotStorageKey(slot, ringIndex);
          const equipped = equippedBySlot.get(key) ?? null;
          const options = itemLibrary.filter((i) => i.slot === slot);
          const isDragOver = dragOverKey === key;

          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverKey(key);
              }}
              onDragLeave={() => setDragOverKey((k) => (k === key ? null : k))}
              onDrop={(e) => handleDrop(slot, ringIndex, e)}
              className={`flex flex-col gap-2 rounded border p-3 ${
                isDragOver ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-slate-600">{label}</p>

              <EquipmentSlotCard
                equipped={equipped}
                statTypes={statTypes}
                onUnequip={() => unequip(slot, ringIndex)}
              />

              {options.length > 0 && (
                <SlotSelectFallback
                  disabled={isPending}
                  options={options}
                  onEquip={(itemId) => equip(slot, ringIndex, itemId)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlotSelectFallback({
  options,
  onEquip,
  disabled,
}: {
  options: LibraryItem[];
  onEquip: (itemId: string) => void;
  disabled: boolean;
}) {
  const [selected, setSelected] = useState("");
  return (
    <div className="flex items-center gap-1 border-t border-slate-100 pt-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs text-slate-900"
      >
        <option value="">アイテムを選択</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
            {o.equippedOn ? `（${o.equippedOn}）` : ""}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={disabled || !selected}
        onClick={() => selected && onEquip(selected)}
        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        装備する
      </button>
    </div>
  );
}
