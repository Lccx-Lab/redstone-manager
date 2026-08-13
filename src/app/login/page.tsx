import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-xl font-bold text-brand-700">REDSTONE Manager</h1>
        <p className="mt-1 text-sm text-slate-500">アカウント・キャラクター管理ツール</p>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form action={login} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          メールアドレス
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          パスワード
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="rounded border border-slate-300 px-3 py-2 text-slate-900"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          ログイン
        </button>
      </form>
    </main>
  );
}
