# REDSTONE Manager

REDSTONEオンラインのアカウント・キャラクター・装備・タスクを一元管理する、個人専用のWebツール。

- 本人専用（ログイン1アカウントのみ）
- Next.js（App Router）+ Supabase（Postgres / Auth / Storage）+ Vercel
- 常時アクセス可能なクラウドホスティング

## 主な機能

### アカウント・キャラクター管理
- ゲーム内アカウントを複数登録し、それぞれに複数キャラクターを紐づけて管理
- アカウントごとにログイン情報（ID・パスワード・二次パスワード・登録生年月日・登録メールアドレス）を保存。パスワード類はアプリ層でAES-256-GCM暗号化してからDBに保存し、画面では表示/非表示を切り替えられる

### デイリー/ウィークリータスク
- キャラクターごとにデイリー・ウィークリータスクを登録し、チェックリストとして管理
- リセット判定は日本時間基準（デイリー: 毎日0:00、ウィークリー: 毎週月曜0:00）

### メインクエスト更新管理・通知
- 前回更新日時を記録すると、次回更新可能日時（前回から7日と1分後）を自動計算して表示
- 日時は手動でも修正可能
- Vercel Cronから1日1回、更新可能になったキャラクターがあればメール（Resend経由）で通知

### レベル・ステータス画面管理
- キャラクターごとにレベルと、ステータス画面のスクリーンショットを複数枚保存

### 装備・オプション項目
- 「装備アイテム」を所有者単位（全アカウント・全キャラ共通）のマスタとして登録。部位（武器/補助武器/首/頭/背・耳/腰/手/鎧/足/指）ごとにアイテム名・メモ・スクリーンショット・オプション値を管理
- オプション項目（旧称: ステータス項目）もマスタ管理。項目ごとに単位（%または数値）と上限値を設定可能。同じアイテムに同じ項目を複数行設定でき、それぞれ別の値として保持される（自動合算しない）
- キャラクターの装備タブでは、アイテム一覧からドラッグ&ドロップでスロットへ装備可能（タッチ端末向けにドロップダウン選択でも同じ操作ができる）。装備中のアイテムを外すと未装備に戻り、既に装備済みのアイテムを別スロットへドラッグすると付け替えになる
- オプション項目ごとの合計値と上限（設定していれば）を装備タブ上部に表示
- アイテムは「複製」ボタンで同じ内容を別アイテムとして複製できる（スクリーンショットは複製されない）

### ブランディング
- REDSTONEオンライン公式サイトの配色（マルーン系ヘッダー、朱色〜赤のアクセントカラー）と公式ロゴを反映

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router, Turbopack) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| DB / 認証 / ストレージ | Supabase (Postgres, Auth, Storage) |
| メール送信 | Resend |
| デプロイ / Cron | Vercel |
| テスト | Vitest |

## ディレクトリ構成（抜粋）

```
src/
  app/
    login/                    ログインページ
    accounts/                 アカウント一覧・詳細（ログイン情報含む）
    characters/[id]/          キャラクター詳細（タスク/装備/ステータスタブ）
    equipment-items/          装備アイテムマスタ（所有者単位）
    option-types/             オプション項目マスタ（所有者単位）
    api/cron/main-quest-notify/  メインクエスト通知cronのRoute Handler
  components/                 共通クライアントコンポーネント
    ZoomableImage.tsx           スクリーンショット拡大表示
    StatRowsEditor.tsx          オプション項目の行を自由に追加・削除するフォーム部品
    RevealableInput.tsx         パスワード表示/非表示切り替え
  lib/
    supabase/                   Supabaseクライアント（server/proxy/admin）
    reset.ts                    JST基準の日次・週次リセット計算
    mainQuest.ts                 メインクエストのクールダウン計算
    crypto.ts                    ログイン情報の暗号化/復号
    email.ts                     メインクエスト通知メール送信
    types.ts                     共通の型定義
supabase/migrations/          DBマイグレーション（連番、Supabase SQL Editorで実行）
```

## データベース（Supabase）

`supabase/migrations/` に連番のSQLファイルがあり、**上から順番に**Supabase SQL Editorで実行することでスキーマを構築する。

| ファイル | 内容 |
|---|---|
| 0001_init.sql | 初期スキーマ（accounts, characters, character_equipment, equipment_screenshots, daily/weekly_tasks等）とRLSポリシー、Storageバケット |
| 0002_screenshot_slots.sql | 装備スクリーンショットにslot/ring_indexを追加 |
| 0003_status.sql | characters.level、ステータス画面スクリーンショット用テーブル追加 |
| 0004_main_quest.sql | メインクエスト更新日時・通知済みフラグを追加 |
| 0005_element_boost.sql | （旧）属性強化%の単一列。0006で廃止・置き換え済みのため実質不要 |
| 0006_stat_types.sql | ステータス項目マスタ方式へ一般化（0005の列を削除） |
| 0007_account_credentials.sql | アカウントのログイン情報（暗号化）テーブル追加 |
| 0008_equipment_items.sql | 装備アイテムマスタ化。既存の装備データを自動移行 |
| 0009_option_units.sql | オプション項目に単位（%/数値）を追加、同一項目の複数行を許容 |

すべて `RLS` で `auth.uid()` に基づき本人のデータのみアクセス可能。スクリーンショット類は共通のStorageバケット `equipment-screenshots`（非公開、署名付きURLで表示）を利用する。

## 環境変数

`.env.local.example` を `.env.local` にコピーして設定する。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase接続情報 |
| `SUPABASE_SERVICE_ROLE_KEY` | Cronからの通知処理用（RLSを回避するサーバー専用キー） |
| `RESEND_API_KEY` / `NOTIFICATION_EMAIL` / `NOTIFICATION_FROM_EMAIL` | メインクエスト通知メール送信 |
| `CRON_SECRET` | Cronエンドポイント保護用シークレット |
| `CREDENTIALS_ENCRYPTION_KEY` | アカウントのログイン情報を暗号化するAES-256鍵（base64・32バイト） |

## ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 を開く。テスト・型チェック・Lintは以下。

```bash
npm test
npx tsc --noEmit
npm run lint
```

## デプロイ

Vercelにデプロイし、上記の環境変数をすべて設定する。メインクエスト通知のCronは `vercel.json` で1日1回（UTC 15:05 = 日本時間0:05）実行される設定。より高頻度にしたい場合はVercel Proプランへのアップグレードが必要（Hobbyプランはcronが1日1回まで）。

## 今後の拡張候補

- 公式サイトのログインボーナス自動受領: 規約違反・BANリスクを避けるため未実装（意図的にスコープ外）
