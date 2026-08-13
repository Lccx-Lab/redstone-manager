import type { StatType } from "@/lib/types";
import { OptionTotalsSummary } from "@/components/OptionTotalsSummary";
import type { EquippedItemDetail, LibraryItem } from "./data";
import { EquipmentBoard } from "./EquipmentBoard";

export function EquipmentForm({
  characterId,
  equippedBySlot,
  itemLibrary,
  statTypes,
  statTotals,
}: {
  characterId: string;
  equippedBySlot: Map<string, EquippedItemDetail | null>;
  itemLibrary: LibraryItem[];
  statTypes: StatType[];
  statTotals: Map<string, number>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <OptionTotalsSummary statTypes={statTypes} statTotals={statTotals} />

      <EquipmentBoard
        characterId={characterId}
        equippedBySlot={equippedBySlot}
        itemLibrary={itemLibrary}
        statTypes={statTypes}
      />
    </div>
  );
}
