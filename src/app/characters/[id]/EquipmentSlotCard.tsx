import type { StatType } from "@/lib/types";
import { ZoomableImage } from "@/components/ZoomableImage";
import type { EquippedItemDetail } from "./data";

export function EquipmentSlotCard({
  equipped,
  statTypes,
  onUnequip,
}: {
  equipped: EquippedItemDetail | null;
  statTypes: StatType[];
  onUnequip: () => void;
}) {
  if (!equipped) {
    return <p className="text-sm text-slate-400">未装備</p>;
  }

  const statTypeById = new Map(statTypes.map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-900">{equipped.name}</p>
      {equipped.memo && <p className="text-xs text-slate-500">{equipped.memo}</p>}
      {equipped.stats.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs text-slate-500">
          {equipped.stats.map((s) => (
            <li key={s.statTypeId}>
              {statTypeById.get(s.statTypeId)?.name ?? "?"}: {s.valuePercent}%
            </li>
          ))}
        </ul>
      )}
      {equipped.screenshots.length > 0 && (
        <div className="grid grid-cols-2 gap-1">
          {equipped.screenshots.map((shot) =>
            shot.url ? (
              <ZoomableImage
                key={shot.id}
                src={shot.url}
                alt={shot.caption ?? equipped.name}
                className="aspect-video w-full rounded object-cover"
              />
            ) : null,
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onUnequip}
        className="self-start text-xs text-red-400 hover:underline"
      >
        外す
      </button>
    </div>
  );
}
