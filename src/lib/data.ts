import { createClient } from "@/lib/supabase/server";
import { jstDateString, jstWeekStartString } from "@/lib/reset";
import type { Account, Character } from "@/lib/types";

export type TaskSummary = {
  dailyTotal: number;
  dailyDone: number;
  weeklyTotal: number;
  weeklyDone: number;
};

export type AccountWithCharacters = Account & { characters: Character[] };

export async function getDashboardData(): Promise<{
  accounts: AccountWithCharacters[];
  summaries: Map<string, TaskSummary>;
}> {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*, characters(*)")
    .order("created_at", { ascending: true });

  const accountsList = (accounts ?? []) as AccountWithCharacters[];
  const characterIds = accountsList.flatMap((a) => a.characters.map((c) => c.id));

  const summaries = new Map<string, TaskSummary>();
  for (const id of characterIds) {
    summaries.set(id, { dailyTotal: 0, dailyDone: 0, weeklyTotal: 0, weeklyDone: 0 });
  }

  if (characterIds.length === 0) {
    return { accounts: accountsList, summaries };
  }

  const today = jstDateString();
  const weekStart = jstWeekStartString();

  const [{ data: dailyTasks }, { data: weeklyTasks }] = await Promise.all([
    supabase
      .from("daily_tasks")
      .select("id, character_id, is_active, daily_task_completions(reset_date)")
      .in("character_id", characterIds)
      .eq("is_active", true),
    supabase
      .from("weekly_tasks")
      .select("id, character_id, is_active, weekly_task_completions(reset_week_start)")
      .in("character_id", characterIds)
      .eq("is_active", true),
  ]);

  for (const task of dailyTasks ?? []) {
    const summary = summaries.get(task.character_id);
    if (!summary) continue;
    summary.dailyTotal += 1;
    const completions = (task.daily_task_completions ?? []) as { reset_date: string }[];
    if (completions.some((c) => c.reset_date === today)) summary.dailyDone += 1;
  }

  for (const task of weeklyTasks ?? []) {
    const summary = summaries.get(task.character_id);
    if (!summary) continue;
    summary.weeklyTotal += 1;
    const completions = (task.weekly_task_completions ?? []) as { reset_week_start: string }[];
    if (completions.some((c) => c.reset_week_start === weekStart)) summary.weeklyDone += 1;
  }

  return { accounts: accountsList, summaries };
}
