# 気象データ可視化アプリケーション

気象庁のアメダスデータを使用して、日本全国の観測所の今日の気温・気圧変化をリアルタイムで表示するWebアプリケーションです。

## 🌐 ライブデモ

**[https://todaytemperature-public.pages.dev](https://todaytemperature-public.pages.dev)**

ブラウザで今すぐお試しいただけます。観測所を選択すると自動でデータが取得・表示されます。

## ✨ 主な機能

- **🏞️ 2段階選択**: 都道府県→観測所の階層選択で947箇所から簡単検索
- **🌡️ 自動データ取得**: 観測所選択時に自動でデータ取得・表示
- **📊 3要素表示**: 今日の0時から現在時刻までの気温・湿度・気圧変化をリアルタイム表示
- **⚡ 高速切り替え**: 10分TTLキャッシュによる即座表示
- **📱 レスポンシブ対応**: FHD画面最適化済み

## 💻 ローカル開発

```bash
# リポジトリをクローン
git clone https://github.com/ifukazoo/todaytemperature-public.git
cd todaytemperature-public

# ローカルサーバーを起動
python -m http.server 8000
# または
npx serve .

# ブラウザでアクセス
open http://localhost:8000
```

## 技術仕様

### アーキテクチャ

- **フロントエンドのみ**: HTML + JavaScript（ES6）
- **チャートライブラリ**: Chart.js（CDN）
- **データソース**: 気象庁アメダスAPI

### データソース

- **API**: `https://www.jma.go.jp/bosai/amedas/data/map/{YYYYMMDDHHMISS}.json`
- **更新間隔**: 10分
- **対象観測所**: 四要素観測所・官署（気温・湿度・気圧データあり）

### パフォーマンス最適化

- **キャッシュシステム**: TTL（10分）+ setTimeout方式
- **バッチ取得**: 24時間分のデータを並列取得
- **API効率化**: 現在時刻までのデータのみ取得（未来の時刻は除外）

## ファイル構成

```text
├── index.html              # メインHTMLファイル
├── script.js               # JavaScriptアプリケーション
├── ame_master_20250313.csv # 観測所マスターデータ
├── CLAUDE.md               # 開発ガイド
└── README.md               # このファイル
```

## 開発環境

### 必要条件

- モダンWebブラウザ（ES6対応）
- ローカルWebサーバー（CORS対応）

### セットアップ

上記「💻 ローカル開発」セクションを参照してください。

### ビルドプロセス

ビルドプロセスは不要です。静的ファイルをブラウザで直接実行できます。

## API仕様

### 気象庁アメダスAPI

```text
GET https://www.jma.go.jp/bosai/amedas/data/map/{timestamp}.json
```

**パラメータ:**

- `timestamp`: `YYYYMMDDHHMISS`形式（例: `20250627140000`）

**レスポンス例:**

```json
{
  "48361": {
    "temp": [26.7, 0],
    "humidity": [65, 0],
    "pressure": [938.1, 0]
  }
}
```

## 主要クラス

### WeatherDataCache

- TTL（Time To Live）ベースのキャッシュシステム
- 10分間の自動無効化
- メモリ効率的な管理

### WeatherApp

- アプリケーション全体のライフサイクル管理
- 観測所データの読み込み・管理
- チャート表示・更新処理

## ブラウザサポート

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## データ提供

気象データは気象庁より提供されています。

- [気象庁ホームページ](https://www.jma.go.jp/)
- [アメダス](https://www.jma.go.jp/jma/kishou/know/amedas/ame_master.pdf)

## 貢献

バグ報告や機能要求は、GitHubのIssueでお知らせください。

## 更新履歴

- v1.0.0: 基本的な気温表示機能
- v1.1.0: 気圧表示機能追加
- v1.2.0: 観測所選択機能追加
- v1.3.0: キャッシュシステムと最適化
- v1.4.0: 現在時刻までのデータ取得最適化
- v1.5.0: 気温データのない観測所除外
- v1.6.0: 湿度表示機能追加（気温→湿度→気圧の3要素表示）
