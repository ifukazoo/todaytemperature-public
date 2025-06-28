# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

このファイルは、Claude Code (claude.ai/code) がこのリポジトリでコードを操作する際のガイダンスを提供します。

## プロジェクト概要

気象庁データを使用して、日本の特定地点の今日の気温変化を表示するシンプルな天気可視化ウェブアプリケーションです。

## アーキテクチャ

**フロントエンドのみのアプリケーション** で、2つのメインファイルから構成されています：

- `index.html` - Chart.js統合を含むシングルページUI
- `script.js` - ES6クラスベースのJavaScriptアプリケーション

**コアコンポーネント：**

- `TemperatureApp`クラスがアプリケーション全体のライフサイクルを管理
- Chart.js（CDN）による線グラフの可視化
- バニラJavaScriptのfetch APIによるデータ取得

## データソース統合

**JMA（気象庁）API：**

- ベースURL: `https://www.jma.go.jp/bosai/amedas/data/map/{YYYYMMDDHHMISS}.json`
- 対象観測所: `48361`
- 位置: 長野県（観測所ID: 48361）
- データ形式: 気温値は`data["48361"].temp[0]`

**APIレスポンス構造：**

```json
{
  "48361": {
    "temp": [26.7, 0],
    "pressure": [938.1, 0],
    // その他の気象データ...
  }
}
```

## 主要な実装詳細

**データ取得パターン：**

- 当日の24時間分のAPIコール（00:00から23:00まで）を実行
- 失敗したリクエストにはnull値でグレースフルなエラーハンドリング
- 個別時間のエラー分離による順次処理

**チャート設定：**

- エリア塗りつぶしありの線グラフ
- 600px高さのレスポンシブデザイン
- Y軸はゼロから開始しない（beginAtZero: false）
- 滑らかな曲線レンダリング（tension: 0.3）

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

- `script.js:55` - `WeatherApp`クラス: メインアプリケーションロジック
- `script.js:1` - `WeatherDataCache`クラス: TTLベースキャッシュシステム
- `script.js:181` - `loadStations()`: CSV観測所データ読み込み
- `script.js:363` - `fetchWeatherData()`: 気象データAPI取得
- `index.html:80` - UI要素とChart.js統合

## キャッシュシステム

10分TTLの`WeatherDataCache`クラスでAPIレスポンス効率化。観測所切り替え時の高速表示が可能。

## CSVパース注意点

観測所マスターファイル(`ame_master_20250313.csv`)は気温データのない「雨」「雪」観測所を除外(`script.js:207-209`)。