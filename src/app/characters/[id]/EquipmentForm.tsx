import type { StatType } from "@/lib/types";
import type { EquippedItemDetail, LibraryItem } from "./data";
import { EquipmentBoard } from "./EquipmentBoard";

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

      <EquipmentBoard
        characterId={characterId}
        equippedBySlot={equippedBySlot}
        itemLibrary={itemLibrary}
        statTypes={statTypes}
      />
    </div>
  );
}
