# Familia for DC - Data Center Monitoring System

株式会社アイネット様向けのデータセンター監視システムです。IoTプラットフォーム「Familia」のデータセンター特化バージョンとして開発されました。

## 🌟 機能

- **リアルタイムモニタリング**: 340個のセンサーから温度・湿度・風量データを収集・表示
- **2Dヒートマップ**: 17列×10行のラック配置図上でデータを可視化
- **マルチDC/マルチルーム対応**: 複数のデータセンターとルームを管理
- **センサー比較グラフ**: 最大10個のセンサーを選択して時系列データを比較
- **アラート管理**: IFTTT風のIF-THENルールでアラートを設定
- **データエクスポート**: CSVフォーマットでデータをエクスポート

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **グラフ**: Recharts
- **アイコン**: Lucide React
- **デプロイ**: Vercel

## 🚀 セットアップ

### 必要な環境

- Node.js 18.17以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/haudi-development/familia-dc-monitoring.git
cd familia-dc-monitoring

# 依存関係をインストール
npm install

# 開発サーバーを起動（ポート3000）
npm run dev
```

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクション実行
npm start
```

## 📊 システム構成

### センサー配置

- **ラック数**: 170ラック（17列×10行）
- **センサー数**: 340個（各ラックに吸気側・排気側センサー）
- **吸気側通路**: A-B, C-D, E-F, G-H, I-J, K-L, M-N, O-P
- **排気側通路**: Aの左, B-C, D-E, F-G, H-I, J-K, L-M, N-O, P-Q, Qの右

### データ構造

- 各センサーは温度（°C）、湿度（%）、風量（CFM）を測定
- 1分ごとにデータを更新（現在はダミーデータ）
- 将来的にMQTT経由でリアルタイムデータを取得予定

## 🎨 デザイン

- **プライマリカラー**: #50A69F（ティール）
- **ヒートマップ**: 青（低温）→ 緑（標準）→ 黄（注意）→ オレンジ（警告）→ 赤（危険）
- **レスポンシブデザイン**: デスクトップ/タブレット対応

## 📝 開発ルール

詳細は [/docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md) を参照してください。

## 🔒 ライセンス

このプロジェクトは株式会社アイネット様向けのプライベートプロジェクトです。

## 👥 開発チーム

- haudi-development

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
