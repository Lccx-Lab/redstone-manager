type TaskItem = {
  id: string;
  name: string;
  isDone: boolean;
};

export function TaskColumn({
  title,
  tasks,
  onCreate,
  onToggle,
  onDelete,
}: {
  title: string;
  tasks: TaskItem[];
  onCreate: (formData: FormData) => Promise<void>;
  onToggle: (taskId: string, isDone: boolean) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}) {
  const doneCount = tasks.filter((t) => t.isDone).length;

  return (
    <section className="flex-1 rounded border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600">{title}</h2>
        <span className="text-xs text-slate-400">
          {doneCount}/{tasks.length} 完了
        </span>
      </div>

      <ul className="mb-3 flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-2 rounded border border-slate-100 px-3 py-2">
            <form action={onToggle.bind(null, task.id, task.isDone)} className="flex-1">
              <button
                type="submit"
                className={`text-left text-sm ${task.isDone ? "text-slate-400 line-through" : "text-slate-900"}`}
              >
                {task.isDone ? "✅" : "⬜"} {task.name}
              </button>
            </form>
            <form action={onDelete.bind(null, task.id)}>
              <button type="submit" className="text-xs text-red-400 hover:underline">
                削除
              </button>
            </form>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-400">タスク未登録</p>}
      </ul>

      <form action={onCreate} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="タスク名を追加"
          className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-900"
        />
        <button
          type="submit"
          className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
        >
          追加
        </button>
      </form>
    </section>
  );
}
