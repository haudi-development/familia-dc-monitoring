# Familia for DC - データセンター監視システム

株式会社アイネット向けIoTデータセンター監視システム

## 概要

Familia for DCは、データセンター内の340個のセンサー（170ラック×2センサー）をリアルタイムで監視し、温度、湿度、風量のデータを視覚化するWebアプリケーションです。

## 主な機能

- **リアルタイム監視**: 17列×10行のラック配置をヒートマップで表示
- **マルチDC/ルーム対応**: 複数のデータセンターとルームを管理
- **吸気/排気側分割表示**: 各ラックの吸気側と排気側を別々に監視
- **アラート管理**: IFTTT風のルール設定と履歴管理
- **データ分析**: センサー比較グラフとCSVエクスポート
- **ユーザー管理**: ロールベースのアクセス制御

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **グラフ**: Recharts
- **アイコン**: Lucide React

## セットアップ

### 必要条件

- Node.js 18.17以上
- npmまたはpnpm

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/haudi-development/familia-dc-monitoring.git
cd familia-dc-monitoring

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### ログイン情報（デモ用）

- ユーザー名: admin
- パスワード: password123

## プロジェクト構造

```
familia-dc-monitoring/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # ダッシュボードレイアウト
│   ├── api/               # APIルート
│   └── login/             # ログインページ
├── components/            # Reactコンポーネント
│   ├── dashboard/         # ダッシュボードコンポーネント
│   └── layout/            # レイアウトコンポーネント
└── lib/                   # ユーティリティ関数、型定義等
```

## ビルドとデプロイ

```bash
# プロダクションビルド
npm run build

# ビルドの確認
npm run start
```

## 環境変数

本番環境では以下の環境変数を設定してください：

```bash
# .env.localファイルを作成
cp .env.example .env.local
```

### 必須の環境変数

- `AUTH_SECRET`: 認証用のシークレットキー（本番環境では必ず変更してください）
- `NODE_ENV`: 実行環境（development/production）
- `NEXT_PUBLIC_API_URL`: APIのベースURL
- `SESSION_MAX_AGE`: セッションの有効期限（秒）

## Vercelへのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhaudi-development%2Ffamilia-dc-monitoring)

### Vercelでの環境変数設定

1. Vercelのプロジェクト設定から「Environment Variables」を選択
2. 以下の環境変数を追加：
   - `AUTH_SECRET`: ランダムな文字列を生成して設定
   - `NODE_ENV`: production
   - `NEXT_PUBLIC_API_URL`: デプロイ後のURL
   - `SESSION_MAX_AGE`: 604800

## セキュリティに関する注意

- デモ用の認証情報（admin/password123）は本番環境では使用しないでください
- `AUTH_SECRET`は必ず安全なランダム文字列に変更してください
- HTTPSを有効にして運用してください

## ライセンス

MIT