import { describe, expect, it } from "vitest";
import {
  formatJstDateTimeInputValue,
  jstDateString,
  jstWeekStartString,
  parseJstDateTimeInputValue,
} from "./reset";

describe("jstDateString", () => {
  it("JST正午のUTC時刻をそのまま日付に変換する", () => {
    expect(jstDateString(new Date("2024-01-01T00:00:00Z"))).toBe("2024-01-01");
  });

  it("JST 00:00 の境界を越えたら日付が進む", () => {
    expect(jstDateString(new Date("2024-01-01T14:59:00Z"))).toBe("2024-01-01"); // JST 23:59
    expect(jstDateString(new Date("2024-01-01T15:00:00Z"))).toBe("2024-01-02"); // JST 00:00
  });
});

describe("jstWeekStartString", () => {
  it("月曜日はその日自身が週の開始日になる", () => {
    // 2024-01-01 は月曜日
    expect(jstWeekStartString(new Date("2024-01-01T00:00:00Z"))).toBe("2024-01-01");
  });

  it("日曜日の終わりまでは同じ週の開始日を返す", () => {
    // 2024-01-07 23:59 JST (日曜) はまだ 01-01 の週
    expect(jstWeekStartString(new Date("2024-01-07T14:59:00Z"))).toBe("2024-01-01");
  });

  it("月曜 00:00 JST を越えたら次の週になる", () => {
    expect(jstWeekStartString(new Date("2024-01-07T15:00:00Z"))).toBe("2024-01-08");
  });
});

describe("parseJstDateTimeInputValue / formatJstDateTimeInputValue", () => {
  it("datetime-localの値をJSTとして解釈しUTCへ変換する", () => {
    const date = parseJstDateTimeInputValue("2024-01-01T09:00");
    expect(date?.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });

  it("フォーマットとパースが往復して一致する", () => {
    const original = new Date("2024-06-15T03:21:00Z");
    const inputValue = formatJstDateTimeInputValue(original);
    const parsed = parseJstDateTimeInputValue(inputValue);
    expect(parsed?.toISOString()).toBe(original.toISOString());
  });

  it("不正な形式の場合はnullを返す", () => {
    expect(parseJstDateTimeInputValue("not-a-date")).toBeNull();
  });
});
