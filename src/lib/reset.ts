const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function toJstShifted(date: Date): Date {
  return new Date(date.getTime() + JST_OFFSET_MS);
}

function formatShifted(shifted: Date): string {
  return `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`;
}

/** 日本時間 00:00 を境界とした「今日の日付」(YYYY-MM-DD) を返す */
export function jstDateString(date: Date = new Date()): string {
  return formatShifted(toJstShifted(date));
}

/** 日本時間 月曜 00:00 を境界とした「今週の開始日」(YYYY-MM-DD) を返す */
export function jstWeekStartString(date: Date = new Date()): string {
  const shifted = toJstShifted(date);
  const weekday = shifted.getUTCDay(); // 0=日, 1=月, ..., 6=土
  const daysSinceMonday = (weekday + 6) % 7;
  shifted.setUTCDate(shifted.getUTCDate() - daysSinceMonday);
  return formatShifted(shifted);
}

/** 表示用に日本時間の "YYYY-MM-DD HH:mm" 文字列を返す */
export function formatJstDateTime(date: Date): string {
  const shifted = toJstShifted(date);
  const datePart = formatShifted(shifted);
  const timePart = `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`;
  return `${datePart} ${timePart}`;
}

/** <input type="datetime-local"> 用に日本時間の "YYYY-MM-DDTHH:mm" 文字列を返す */
export function formatJstDateTimeInputValue(date: Date): string {
  const shifted = toJstShifted(date);
  const datePart = formatShifted(shifted);
  const timePart = `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`;
  return `${datePart}T${timePart}`;
}

/** <input type="datetime-local"> の値（日本時間として入力された日時）をDateに変換する */
export function parseJstDateTimeInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const utcMs = Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm)) - JST_OFFSET_MS;
  return new Date(utcMs);
}
