import Link from "next/link";
import { notFound } from "next/navigation";
import { CHARACTER_CONTENT_CATEGORIES } from "@/lib/types";
import { getCharacterDetail } from "./data";
import { updateCharacterAction, deleteCharacterAction } from "./actions";
import {
  createDailyTaskAction,
  createWeeklyTaskAction,
  deleteDailyTaskAction,
  deleteWeeklyTaskAction,
  toggleDailyTaskAction,
  toggleWeeklyTaskAction,
} from "./tasks-actions";
import { TaskColumn } from "./TaskColumn";
import { EquipmentForm } from "./EquipmentForm";
import { StatusPanel } from "./StatusPanel";
import { MainQuestPanel } from "./MainQuestPanel";
import { ContentPanel } from "./ContentPanel";

const FIXED_TABS = [
  { key: "tasks", label: "タスク" },
  { key: "equipment", label: "装備" },
  { key: "status", label: "ステータス" },
] as const;

const TABS = [...FIXED_TABS, ...CHARACTER_CONTENT_CATEGORIES] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function CharacterDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const activeTab: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : "tasks";

  const detail = await getCharacterDetail(id);
  if (!detail) notFound();

  const {
    character,
    equippedBySlot,
    itemLibrary,
    statusScreenshots,
    contentScreenshotsByCategory,
    statTypes,
    statTotals,
    dailyTasks,
    weeklyTasks,
  } = detail;

  const updateWithId = updateCharacterAction.bind(null, id);
  const deleteWithId = deleteCharacterAction.bind(null, id, character.account_id);
  const createDailyWithId = createDailyTaskAction.bind(null, id);
  const createWeeklyWithId = createWeeklyTaskAction.bind(null, id);
  const toggleDailyWithId = toggleDailyTaskAction.bind(null, id);
  const toggleWeeklyWithId = toggleWeeklyTaskAction.bind(null, id);
  const deleteDailyWithId = deleteDailyTaskAction.bind(null, id);
  const deleteWeeklyWithId = deleteWeeklyTaskAction.bind(null, id);

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← ダッシュボード
        </Link>
        <h1 className="mt-1 text-lg font-bold">
          {character.name}
          {character.level != null && (
            <span className="ml-2 text-sm font-normal text-slate-500">Lv.{character.level}</span>
          )}
        </h1>
        {character.job && <p className="text-sm text-slate-500">{character.job}</p>}
      </div>

      <details className="rounded border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-600">
          キャラクター設定
        </summary>
        <form action={updateWithId} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            名前
            <input
              name="name"
              required
              defaultValue={character.name}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            職業
            <input
              name="job"
              defaultValue={character.job ?? ""}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            メモ
            <input
              name="memo"
              defaultValue={character.memo ?? ""}
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            保存
          </button>
        </form>
        <form action={deleteWithId} className="mt-3">
          <button type="submit" className="text-xs text-red-500 hover:underline">
            このキャラクターを削除する（装備・タスク・スクリーンショットも全て削除されます）
          </button>
        </form>
      </details>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/characters/${id}?tab=${t.key}`}
            className={`px-3 py-2 text-sm ${
              activeTab === t.key
                ? "border-b-2 border-brand-600 font-semibold text-brand-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {activeTab === "tasks" && (
        <div className="flex flex-col gap-4">
          <MainQuestPanel characterId={id} mainQuestUpdatedAt={character.main_quest_updated_at} />
          <div className="flex flex-col gap-4 sm:flex-row">
            <TaskColumn
              title="デイリータスク（毎日 JST 00:00 リセット）"
              tasks={dailyTasks.map((t) => ({ id: t.id, name: t.name, isDone: t.isDoneToday }))}
              onCreate={createDailyWithId}
              onToggle={toggleDailyWithId}
              onDelete={deleteDailyWithId}
            />
            <TaskColumn
              title="ウィークリータスク（毎週月曜 JST 00:00 リセット）"
              tasks={weeklyTasks.map((t) => ({ id: t.id, name: t.name, isDone: t.isDoneThisWeek }))}
              onCreate={createWeeklyWithId}
              onToggle={toggleWeeklyWithId}
              onDelete={deleteWeeklyWithId}
            />
          </div>
        </div>
      )}

      {activeTab === "equipment" && (
        <EquipmentForm
          characterId={id}
          equippedBySlot={equippedBySlot}
          itemLibrary={itemLibrary}
          statTypes={statTypes}
          statTotals={statTotals}
        />
      )}

      {activeTab === "status" && (
        <StatusPanel characterId={id} level={character.level} screenshots={statusScreenshots} />
      )}

      {CHARACTER_CONTENT_CATEGORIES.map(
        (c) =>
          activeTab === c.key && (
            <ContentPanel
              key={c.key}
              characterId={id}
              category={c.key}
              label={c.label}
              screenshots={contentScreenshotsByCategory.get(c.key) ?? []}
            />
          ),
      )}
    </main>
  );
}
