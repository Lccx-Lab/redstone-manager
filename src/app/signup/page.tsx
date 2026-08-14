import Link from "next/link";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-xl font-bold text-brand-700">REDSTONE Manager</h1>
        <p className="mt-1 text-sm text-slate-600">新規登録</p>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {sent ? (
        <p className="rounded border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
          確認メールを送信しました。メール内のリンクを開いて登録を完了してください。
        </p>
      ) : (
        <form action={signup} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            メールアドレス
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            パスワード（8文字以上）
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            パスワード（確認）
            <input
              name="password_confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            登録する
          </button>
        </form>
      )}

      <p className="text-sm text-slate-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-brand-700 hover:underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
