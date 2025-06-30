# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを操作する際のガイダンスを提供します。

## プロジェクト概要

気象庁データを使用して、日本全国947箇所の観測所から今日の気温・湿度・気圧変化をリアルタイムで表示するWebアプリケーションです。

## アーキテクチャ

**モジュール化されたフロントエンドアプリケーション** で、ES6 modulesを使用した責任分離設計：

- `index.html` - Chart.js統合を含むシングルページUI
- `js/app.js` - メインアプリケーション統合
- `js/cache.js` - TTLベースキャッシュシステム
- `js/charts.js` - Chart.js可視化管理
- `js/stations.js` - 観測所データ管理
- `js/api.js` - 気象庁API連携

**コアコンポーネント：**

- `WeatherApp`クラス：アプリケーション全体のライフサイクル管理
- `WeatherCharts`クラス：3種類のチャート（気温・湿度・気圧）管理
- `StationManager`クラス：観測所選択と2段階UI管理
- `WeatherAPI`クラス：API効率化とバッチ取得
- `WeatherDataCache`クラス：10分TTLキャッシュシステム

## データソース統合

**JMA（気象庁）API：**

- ベースURL: `https://www.jma.go.jp/bosai/amedas/data/map/{YYYYMMDDHHMISS}.json`
- 対象観測所: 全国947箇所（四要素観測所・官署）
- デフォルト観測所: 長野県松本（観測所ID: 48361）
- データ形式: 3要素取得（気温・湿度・気圧）

**APIレスポンス構造：**

```json
{
  "48361": {
    "temp": [26.7, 0],
    "humidity": [65, 0],
    "pressure": [938.1, 0]
  }
}
```

## 主要な実装詳細

**データ取得パターン：**

- 当日の24時間分のAPIコール（00:00から23:00まで）を実行
- 失敗したリクエストにはnull値でグレースフルなエラーハンドリング
- 個別時間のエラー分離による順次処理

**チャート設定：**

- 3要素の線グラフ（気温・湿度・気圧）
- エリア塗りつぶし、滑らかな曲線（tension: 0.3）
- 400px高さ、レスポンシブ3列グリッド（1024px以上）
- 湿度のみ0-100%スケール、他はbeginAtZero: false

## 開発ワークフロー

**アプリケーションのテスト：**

```bash
# ローカルウェブサーバーでファイルを配信
python -m http.server 8000
# または
npx serve .
```

**ビルドプロセス不要** - 静的ファイルのブラウザ直接実行

**デバッグ：** ブラウザの開発者ツールコンソールでログ確認

**検証環境：** http://localhost:8000 でテスト

## API考慮事項

- JMA APIコールのCORS有効化
- レート制限は未実装 - 必要に応じてリクエスト間に遅延を追加することを検討
- ネットワーク障害と観測所データ欠損の両方を含むエラーハンドリング
- 観測所ID 48361は特定の地理的位置にハードコーディング

## 主要ファイル構造

**モジュール化されたアーキテクチャ：**

- `js/app.js:17` - `WeatherApp`クラス: メインアプリケーション統合
- `js/cache.js:5` - `WeatherDataCache`クラス: TTLベースキャッシュシステム
- `js/charts.js:7` - `WeatherCharts`クラス: 3種類のチャート管理
- `js/stations.js:11` - `StationManager`クラス: 観測所データ・UI管理
- `js/api.js:9` - `WeatherAPI`クラス: 気象庁API連携・バッチ取得
- `index.html:574` - ES6 moduleローダーとUI要素

## キャッシュシステム

10分TTLの`WeatherDataCache`クラスでAPIレスポンス効率化。観測所切り替え時の高速表示が可能。

## CSVパース注意点

観測所マスターファイル(`ame_master_20250313.csv`)は気温データのない「雨」「雪」観測所を除外(`js/stations.js:33-35`)。

## モジュール設計原則

- **単一責任原則**: 各クラスが明確な役割を持つ
- **依存性注入**: コンストラクタでの依存関係管理
- **ES6 modules**: import/exportによる明示的依存関係
- **保守性**: 機能追加時の影響範囲を最小化