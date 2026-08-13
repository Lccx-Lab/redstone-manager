"use client";

import { useState } from "react";

type StatTypeOption = {
  id: string;
  name: string;
  isPercent: boolean;
};

type Row = {
  key: number;
  statTypeId: string;
  value: string;
};

export function StatRowsEditor({
  statTypeOptions,
  initialStats,
}: {
  statTypeOptions: StatTypeOption[];
  initialStats: { statTypeId: string; value: number }[];
}) {
  const [nextKey, setNextKey] = useState(initialStats.length);
  const [rows, setRows] = useState<Row[]>(
    initialStats.map((s, i) => ({
      key: i,
      statTypeId: s.statTypeId,
      value: String(s.value),
    })),
  );

  const isPercentById = new Map(statTypeOptions.map((o) => [o.id, o.isPercent]));

  function addRow() {
    setRows((prev) => [...prev, { key: nextKey, statTypeId: "", value: "0" }]);
    setNextKey((k) => k + 1);
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row) => {
        const isPercent = isPercentById.get(row.statTypeId) ?? true;
        return (
          <div key={row.key} className="flex items-center gap-1">
            <select
              name="stat_type[]"
              value={row.statTypeId}
              onChange={(e) => updateRow(row.key, { statTypeId: e.target.value })}
              className="flex-1 rounded border border-slate-300 px-1.5 py-1 text-xs text-slate-900"
            >
              <option value="">項目を選択</option>
              {statTypeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <input
              name="stat_value[]"
              type="number"
              step={0.01}
              value={row.value}
              onChange={(e) => updateRow(row.key, { value: e.target.value })}
              className="w-16 rounded border border-slate-300 px-1.5 py-1 text-xs text-slate-900"
            />
            {isPercent && <span className="text-xs text-slate-400">%</span>}
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-xs text-red-400 hover:underline"
            >
              削除
            </button>
          </div>
        );
      })}
      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs text-slate-500 hover:underline"
      >
        + 項目追加
      </button>
    </div>
  );
}
