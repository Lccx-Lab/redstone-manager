const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

/** 前回更新から次回更新可能になるまでのクールダウン（7日と1分） */
export const MAIN_QUEST_COOLDOWN_MS = SEVEN_DAYS_MS + ONE_MINUTE_MS;

/** 前回更新日時から、次に更新可能になる日時を返す */
export function computeNextMainQuestAvailableAt(lastUpdatedAt: Date): Date {
  return new Date(lastUpdatedAt.getTime() + MAIN_QUEST_COOLDOWN_MS);
}

/** 前回更新日時（未更新なら null）を基に、現時点で更新可能かどうかを返す */
export function isMainQuestAvailable(
  lastUpdatedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (lastUpdatedAt === null) return true;
  return now.getTime() >= computeNextMainQuestAvailableAt(lastUpdatedAt).getTime();
}
