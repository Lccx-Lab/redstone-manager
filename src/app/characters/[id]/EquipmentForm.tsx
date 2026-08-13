import {
  ELEMENT_BOOST_PERCENT_CAP,
  EQUIPMENT_SLOTS,
  RING_SLOT_COUNT,
  equipmentSlotStorageKey,
} from "@/lib/types";
import type { ScreenshotWithUrl, SlotEquipment } from "./data";
import { EquipmentSlotCard } from "./EquipmentSlotCard";

export function EquipmentForm({
  characterId,
  equipmentBySlot,
  screenshotsBySlot,
}: {
  characterId: string;
  equipmentBySlot: Map<string, SlotEquipment>;
  screenshotsBySlot: Map<string, ScreenshotWithUrl[]>;
}) {
  const emptyScreenshots: ScreenshotWithUrl[] = [];

  const totalElementBoostPercent = Array.from(equipmentBySlot.values()).reduce(
    (sum, e) => sum + e.elementBoostPercent,
    0,
  );
  const isAtCap = totalElementBoostPercent >= ELEMENT_BOOST_PERCENT_CAP;
  const progressPercent = Math.min(
    100,
    (totalElementBoostPercent / ELEMENT_BOOST_PERCENT_CAP) * 100,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-600">属性強化 合計</span>
          <span className={isAtCap ? "font-semibold text-emerald-600" : "text-slate-700"}>
            {totalElementBoostPercent.toFixed(2)}% / {ELEMENT_BOOST_PERCENT_CAP}%
            {isAtCap && "（上限到達）"}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full ${isAtCap ? "bg-emerald-500" : "bg-slate-900"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {totalElementBoostPercent > ELEMENT_BOOST_PERCENT_CAP && (
          <p className="mt-1 text-xs text-slate-400">
            {(totalElementBoostPercent - ELEMENT_BOOST_PERCENT_CAP).toFixed(2)}% 分は上限超過のため反映されません
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EQUIPMENT_SLOTS.map((slot) => {
          const key = equipmentSlotStorageKey(slot.key, 0);
          return (
            <EquipmentSlotCard
              key={slot.key}
              characterId={characterId}
              slot={slot.key}
              ringIndex={0}
              label={slot.label}
              equipment={equipmentBySlot.get(key)}
              screenshots={screenshotsBySlot.get(key) ?? emptyScreenshots}
            />
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-600">指（10スロット）</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: RING_SLOT_COUNT }, (_, i) => i + 1).map((ringIndex) => {
            const key = equipmentSlotStorageKey("ring", ringIndex);
            return (
              <EquipmentSlotCard
                key={ringIndex}
                characterId={characterId}
                slot="ring"
                ringIndex={ringIndex}
                label={`指 ${ringIndex}`}
                equipment={equipmentBySlot.get(key)}
                screenshots={screenshotsBySlot.get(key) ?? emptyScreenshots}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
