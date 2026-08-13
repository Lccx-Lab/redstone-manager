import { describe, expect, it } from "vitest";
import { computeNextMainQuestAvailableAt, isMainQuestAvailable } from "./mainQuest";

describe("computeNextMainQuestAvailableAt", () => {
  it("7日と1分後の日時を返す", () => {
    const last = new Date("2024-01-01T00:00:00Z");
    const next = computeNextMainQuestAvailableAt(last);
    expect(next.toISOString()).toBe("2024-01-08T00:01:00.000Z");
  });
});

describe("isMainQuestAvailable", () => {
  it("一度も更新していない場合は常に利用可能", () => {
    expect(isMainQuestAvailable(null)).toBe(true);
  });

  it("クールダウン終了直前は利用不可", () => {
    const last = new Date("2024-01-01T00:00:00Z");
    const justBefore = new Date("2024-01-08T00:00:59.999Z");
    expect(isMainQuestAvailable(last, justBefore)).toBe(false);
  });

  it("クールダウン終了時刻ちょうどで利用可能になる", () => {
    const last = new Date("2024-01-01T00:00:00Z");
    const exact = new Date("2024-01-08T00:01:00.000Z");
    expect(isMainQuestAvailable(last, exact)).toBe(true);
  });
});
