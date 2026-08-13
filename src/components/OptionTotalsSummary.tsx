import type { StatType } from "@/lib/types";

function StatTotalRow({ statType, total }: { statType: StatType; total: number }) {
  const cap = statType.cap_value;
  const unit = statType.is_percent ? "%" : "";
  const isAtCap = cap != null && total >= cap;
  const progressPercent = cap != null ? Math.min(100, (total / cap) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{statType.name}</span>
        <span className={isAtCap ? "font-semibold text-emerald-600" : "text-slate-700"}>
          {total.toFixed(2)}
          {unit}
          {cap != null && ` / ${cap}${unit}`}
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

/**
 * 装備＋古龍の祝福・ネフォンクリーチャー・ミニペット・コスチューム・潜在能力を横断した
 * オプション項目ごとの合計値。すべて同じ上限を共有するため、キャラのどのタブからでも
 * 同じ合計・上限を確認できるようにする。
 */
export function OptionTotalsSummary({
  statTypes,
  statTotals,
}: {
  statTypes: StatType[];
  statTotals: Map<string, number>;
}) {
  const statTypesWithTotals = statTypes.filter((st) => (statTotals.get(st.id) ?? 0) > 0);

  if (statTypesWithTotals.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4">
      {statTypesWithTotals.map((statType) => (
        <StatTotalRow key={statType.id} statType={statType} total={statTotals.get(statType.id) ?? 0} />
      ))}
    </div>
  );
}
