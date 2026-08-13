import { EQUIPMENT_SLOTS, RING_SLOT_COUNT, equipmentSlotStorageKey } from "@/lib/types";
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

  return (
    <div className="flex flex-col gap-4">
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
