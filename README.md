# REDSTONE Manager

REDSTONEオンラインのアカウント・キャラクター・装備・タスクを一元管理する、非公式ファンツール。誰でもメールアドレスでサインアップして利用できる。

- 誰でも自由にサインアップ可能（Supabase Authのメール確認付き）。データはユーザーごとにRLSで完全に分離される
- Next.js（App Router）+ Supabase（Postgres / Auth / Storage）+ Vercel
- 常時アクセス可能なクラウドホスティング
- REDSTONE Online運営とは無関係の非公式ファンツールである旨をヘッダーに常時表示

## 主な機能

### アカウント・キャラクター管理
- ゲーム内アカウントを複数登録し、それぞれに複数キャラクターを紐づけて管理
- ゲームのログインID・パスワード等の保存機能はサードパーティ利用時のリスク（他人の実パスワードを預かることになる、規約抵触の懸念）を避けるため非搭載

### デイリー/ウィークリータスク
- キャラクターごとにデイリー・ウィークリータスクを登録し、チェックリストとして管理
- リセット判定は日本時間基準（デイリー: 毎日0:00、ウィークリー: 毎週月曜0:00）

### メインクエスト更新管理・通知
- 前回更新日時を記録すると、次回更新可能日時（前回から7日と1分後）を自動計算して表示
- 日時は手動でも修正可能
- Vercel Cronから1日1回、更新可能になったキャラクターがあれば、そのキャラクターの所有者（サインアップ時のメールアドレス）宛にメール（Resend経由）とブラウザ通知（Web Push）で通知

### レベル・ステータス画面管理
- キャラクターごとにレベルと、ステータス画面のスクリーンショットを複数枚保存

### 装備・オプション項目
- 「装備アイテム」を所有者単位（全アカウント・全キャラ共通）のマスタとして登録。部位（武器/補助武器/首/頭/背・耳/腰/手/鎧/足/指）ごとにアイテム名・メモ・スクリーンショット・オプション値を管理
- オプション項目（旧称: ステータス項目）もマスタ管理。項目ごとに単位（%または数値）と上限値を設定可能。同じアイテムに同じ項目を複数行設定でき、それぞれ別の値として保持される（自動合算しない）
- キャラクターの装備タブでは、アイテム一覧からドラッグ&ドロップでスロットへ装備可能（タッチ端末向けにドロップダウン選択でも同じ操作ができる）。装備中のアイテムを外すと未装備に戻り、既に装備済みのアイテムを別スロットへドラッグすると付け替えになる
- オプション項目ごとの合計値と上限（設定していれば）を装備タブ上部に表示
- アイテムは「複製」ボタンで同じ内容を別アイテムとして複製できる（スクリーンショットは複製されない）

### ブランディング
- REDSTONEオンライン公式サイトの配色（マルーン系ヘッダー、朱色〜赤のアクセントカラー）と公式ロゴを反映。ヘッダー上部に非公式ファンツールである旨の注記を常時表示

## 技術スタック

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router, Turbopack) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| DB / 認証 / ストレージ | Supabase (Postgres, Auth, Storage) |
| メール送信 | Resend |
| ブラウザ通知 | Web Push (VAPID) |
| デプロイ / Cron | Vercel |
| テスト | Vitest |

## ディレクトリ構成（抜粋）

```
src/
  app/
    login/                    ログインページ
    signup/                   新規登録ページ（メール確認あり）
    auth/callback/             メール確認リンクからのセッション確立
    accounts/                 アカウント一覧・詳細
    characters/[id]/          キャラクター詳細（タスク/装備/ステータスタブ）
    equipment-items/          装備アイテムマスタ（所有者単位）
    option-types/             オプション項目マスタ（所有者単位）
    api/cron/main-quest-notify/  メインクエスト通知cronのRoute Handler
  components/                 共通クライアントコンポーネント
    ZoomableImage.tsx           スクリーンショット拡大表示
    StatRowsEditor.tsx          オプション項目の行を自由に追加・削除するフォーム部品
    PushNotificationButton.tsx  ブラウザ通知の購読・テスト送信
  lib/
    supabase/                   Supabaseクライアント（server/proxy/admin）
    reset.ts                    JST基準の日次・週次リセット計算
    mainQuest.ts                 メインクエストのクールダウン計算
    email.ts                     メインクエスト通知メール送信（送信先はユーザーごと）
    push.ts                      Web Push送信
    types.ts                     共通の型定義
supabase/migrations/          DBマイグレーション（連番、Supabase SQL Editorで実行）
scripts/
  migrate-storage-paths.ts    既存スクリーンショットを所有者スコープのパスへ移行するワンショットスクリプト
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
| 0007_account_credentials.sql | （旧）アカウントのログイン情報（暗号化）テーブル追加。0014で廃止 |
| 0008_equipment_items.sql | 装備アイテムマスタ化。既存の装備データを自動移行 |
| 0009_option_units.sql | オプション項目に単位（%/数値）を追加、同一項目の複数行を許容 |
| 0010_character_content_screenshots.sql | 古龍の祝福・ネフォンクリーチャー等5タブのスクリーンショット |
| 0011_character_content_options.sql | 上記5タブのオプション値（装備と合算表示） |
| 0012_push_subscriptions.sql | ブラウザ通知（Web Push）の購読情報 |
| 0013_storage_owner_scoped.sql | **要注意**: storage.objectsのRLSを所有者スコープに強化。適用前に必ず `scripts/migrate-storage-paths.ts` を実行すること（下記参照） |
| 0014_drop_account_credentials.sql | **破壊的**: account_credentialsテーブルを削除（既存の暗号化済みログイン情報も削除される） |

すべて `RLS` で `auth.uid()` に基づき本人のデータのみアクセス可能。スクリーンショット類は共通のStorageバケット `equipment-screenshots`（非公開、署名付きURLで表示）を、`${ownerId}/...` で始まるパスに保存する（0013以降）。

### 第三者利用への切り替え時の注意（0013 / 0014 適用手順）

このリポジトリはもともと個人利用（ログイン1アカウントのみ）を想定していたため、Storageのアクセス制御が「認証済みなら誰でも全ファイルにアクセス可能」という緩い状態だった。誰でもサインアップできるようにする前に、以下の順で対応する必要がある。

1. `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` が設定されていることを確認
2. `npm run migrate:storage` を実行し、既存のスクリーンショットを `${ownerId}/...` 形式のパスへ移行する（各テーブルの `storage_path` 列も自動更新される。実行は冪等なので再実行しても安全）
3. スクリプトの出力で `missing` が想定外に多くないか確認する
4. `0013_storage_owner_scoped.sql` をSupabase SQL Editorで実行し、Storageのアクセス制御を所有者スコープに強化する
5. `account_credentials` に保存していたログイン情報が不要であることを確認した上で、`0014_drop_account_credentials.sql` を実行する（**削除したデータは復元できない**）

## 環境変数

`.env.local.example` を `.env.local` にコピーして設定する。

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase接続情報 |
| `SUPABASE_SERVICE_ROLE_KEY` | Cronからの通知処理・Storage移行スクリプト用（RLSを回避するサーバー専用キー） |
| `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL` | メインクエスト通知メール送信（送信先は各ユーザーの登録メールアドレス） |
| `CRON_SECRET` | Cronエンドポイント保護用シークレット |
| `NEXT_PUBLIC_SITE_URL` | サインアップ確認メールのリンク戻り先を組み立てるためのサイトURL |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | ブラウザ通知（Web Push）用のVAPID鍵 |

### メール送信に関する重要な注意

Resendは送信元ドメインを検証していない場合、サンドボックス制限により**Resendアカウント所有者自身のメールアドレスにしか送信できない**。第三者ユーザーにも実際に通知メールを届けるには、Resendで独自ドメインを検証し、`NOTIFICATION_FROM_EMAIL` をそのドメインのアドレスに変更する必要がある。未対応のままだと、cronはエラーにはならないが本人以外への送信が失敗する。

### Supabase Auth のメール確認について

サインアップ後の確認メールはSupabaseの共有SMTP経由で送られるため、無料枠では送信数・頻度に制限がある。利用者が増える場合はSupabase側でカスタムSMTPの設定を検討すること（Authentication > Email Templates / SMTP Settings）。また、Supabase側の Authentication > URL Configuration に本番のSite URL / Redirect URLsを登録しておく必要がある。

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

## 今後の検討事項

- 公式サイトのログインボーナス自動受領: 規約違反・BANリスクを避けるため未実装（意図的にスコープ外）
- サインアップの悪用対策（CAPTCHA等）: 現状はSupabase Authの標準レート制限とメール確認のみ。利用者が増える場合は追加のCAPTCHA導入を検討
- 利用規約・プライバシーポリシーページ: 第三者利用が本格化する場合は用意を検討
