import { EQUIPMENT_SLOTS, RING_SLOT_COUNT, equipmentSlotStorageKey } from "@/lib/types";
import type { StatType } from "@/lib/types";
import type { ScreenshotWithUrl, SlotEquipment } from "./data";
import { EquipmentSlotCard } from "./EquipmentSlotCard";

function StatTotalRow({ statType, total }: { statType: StatType; total: number }) {
  const cap = statType.cap_percent;
  const isAtCap = cap != null && total >= cap;
  const progressPercent = cap != null ? Math.min(100, (total / cap) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{statType.name}</span>
        <span className={isAtCap ? "font-semibold text-emerald-600" : "text-slate-700"}>
          {total.toFixed(2)}%{cap != null && ` / ${cap}%`}
          {isAtCap && "（上限到達）"}
        </span>
      </div>
      {cap != null && (
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full ${isAtCap ? "bg-emerald-500" : "bg-brand-600"}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function EquipmentForm({
  characterId,
  equipmentBySlot,
  screenshotsBySlot,
  statTypes,
  statTotals,
}: {
  characterId: string;
  equipmentBySlot: Map<string, SlotEquipment>;
  screenshotsBySlot: Map<string, ScreenshotWithUrl[]>;
  statTypes: StatType[];
  statTotals: Map<string, number>;
}) {
  const emptyScreenshots: ScreenshotWithUrl[] = [];
  const statTypesWithTotals = statTypes.filter((st) => (statTotals.get(st.id) ?? 0) > 0);

  return (
    <div className="flex flex-col gap-4">
      {statTypesWithTotals.length > 0 && (
        <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4">
          {statTypesWithTotals.map((statType) => (
            <StatTotalRow key={statType.id} statType={statType} total={statTotals.get(statType.id) ?? 0} />
          ))}
        </div>
      )}

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
              statTypes={statTypes}
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
                statTypes={statTypes}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
