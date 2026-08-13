"use client";

import { useState } from "react";

export function RevealableInput({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        name={name}
        type={visible ? "text" : "password"}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="flex-1 rounded border border-slate-300 px-3 py-2 text-slate-900"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-xs text-slate-500 hover:underline"
      >
        {visible ? "隠す" : "表示"}
      </button>
    </div>
  );
}
