/**
 * 気象データ可視化アプリケーション
 * メインアプリケーションクラス
 */
import { WeatherDataCache } from './cache.js';
import { WeatherCharts } from './charts.js';
import { StationManager } from './stations.js';
import { WeatherAPI } from './api.js';

export class WeatherApp {
    constructor() {
        this.dataCache = new WeatherDataCache();
        this.charts = new WeatherCharts();
        this.stationManager = new StationManager();
        this.api = new WeatherAPI(this.dataCache);
        this.currentMode = 'today'; // 'today' or 'weekly'
        
        this.init();
    }

    async init() {
        // モード切り替えボタンのイベントリスナー
        document.getElementById('todayMode').addEventListener('click', () => {
            this.switchToTodayMode();
        });
        
        document.getElementById('weeklyMode').addEventListener('click', () => {
            this.switchToWeeklyMode();
        });
        
        // リフレッシュボタンのイベントリスナー
        document.getElementById('refreshCharts').addEventListener('click', () => {
            this.fetchDataForCurrentMode();
        });
        
        document.getElementById('refreshWeeklyCharts').addEventListener('click', () => {
            this.fetchWeeklyData();
        });
        
        // 都道府県選択時の処理
        document.getElementById('prefectureSelect').addEventListener('change', () => {
            this.onPrefectureChange();
        });
        
        // 観測所選択時の自動データ取得
        document.getElementById('stationSelect').addEventListener('change', () => {
            this.onStationChangeWithAutoFetch();
        });
        
        this.charts.initCharts();
        await this.stationManager.loadStations();
        
        // デフォルト観測所を設定して初回データ取得
        if (this.stationManager.setupDefaultStation()) {
            this.fetchWeatherDataOnLoad();
        }
    }

    onPrefectureChange() {
        const selectedPrefecture = document.getElementById('prefectureSelect').value;
        this.stationManager.populateStationSelectForPrefecture(selectedPrefecture);
        
        // 観測所選択をリセット
        document.getElementById('stationSelect').value = '';
    }

    async onStationChangeWithAutoFetch() {
        const selectedStationId = this.stationManager.getSelectedStationId();
        
        if (!selectedStationId) {
            return;
        }
        
        if (this.currentMode === 'today') {
            // 当日モード: まずキャッシュがあるかチェックして即座に表示
            if (this.api.hasCachedData()) {
                console.log('Using cached data for station change');
                try {
                    const weatherData = await this.api.getTodayWeatherDataFromCache(selectedStationId);
                    this.updateCharts(weatherData, selectedStationId);
                } catch (error) {
                    console.warn('Failed to use cached data:', error);
                }
            }
            
            // キャッシュがない場合は自動でデータを取得
            if (!this.api.hasCachedData()) {
                console.log('No cached data, auto-fetching weather data');
                await this.fetchWeatherData();
            }
        } else if (this.currentMode === 'weekly') {
            // 10日間モード: 10日間データを取得
            console.log('Auto-fetching weekly data for station change');
            await this.fetchWeeklyData();
        }
    }

    async fetchWeatherData() {
        const refreshButton = document.getElementById('refreshCharts');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const selectedStationId = this.stationManager.getSelectedStationId();
        
        if (!selectedStationId) {
            error.textContent = '観測所を選択してください。';
            error.style.display = 'block';
            return;
        }
        
        // リフレッシュボタンを無効化
        if (refreshButton) refreshButton.disabled = true;
        loading.style.display = 'block';
        error.style.display = 'none';
        
        try {
            // バッチでデータを取得
            await this.api.preloadTodayData();
            
            // キャッシュから指定観測所のデータを抽出
            const weatherData = await this.api.getTodayWeatherDataFromCache(selectedStationId);
            this.updateCharts(weatherData, selectedStationId);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            error.textContent = 'データの取得に失敗しました。しばらく待ってから再試行してください。';
            error.style.display = 'block';
        } finally {
            // リフレッシュボタンを再有効化
            if (refreshButton) refreshButton.disabled = false;
            loading.style.display = 'none';
        }
    }

    updateCharts(weatherData, stationId) {
        const selectedStation = this.stationManager.getStationById(stationId);
        const stationName = selectedStation ? selectedStation.name : `観測所${stationId}`;
        
        this.charts.updateCharts(weatherData, stationName);
    }

    async fetchWeatherDataOnLoad() {
        console.log('Auto-fetching weather data on initial load');
        try {
            await this.fetchWeatherData();
        } catch (error) {
            console.warn('Failed to auto-fetch weather data on load:', error);
        }
    }

    switchToTodayMode() {
        this.currentMode = 'today';
        
        // ボタンのアクティブ状態を更新
        document.getElementById('todayMode').classList.add('active');
        document.getElementById('weeklyMode').classList.remove('active');
        
        // チャートセクションの表示を切り替え
        document.getElementById('todayCharts').style.display = 'block';
        document.getElementById('weeklyCharts').style.display = 'none';
        
        // 選択されている観測所があれば当日データを表示
        const selectedStationId = this.stationManager.getSelectedStationId();
        if (selectedStationId && this.api.hasCachedData()) {
            this.fetchDataForCurrentMode();
        }
    }

    switchToWeeklyMode() {
        this.currentMode = 'weekly';
        
        // ボタンのアクティブ状態を更新
        document.getElementById('todayMode').classList.remove('active');
        document.getElementById('weeklyMode').classList.add('active');
        
        // チャートセクションの表示を切り替え
        document.getElementById('todayCharts').style.display = 'none';
        document.getElementById('weeklyCharts').style.display = 'block';
        
        // 選択されている観測所があれだ10日間データを取得・表示
        const selectedStationId = this.stationManager.getSelectedStationId();
        if (selectedStationId) {
            this.fetchWeeklyData();
        }
    }

    async fetchDataForCurrentMode() {
        if (this.currentMode === 'today') {
            await this.fetchWeatherData();
        } else if (this.currentMode === 'weekly') {
            await this.fetchWeeklyData();
        }
    }

    async fetchWeeklyData() {
        const refreshButton = document.getElementById('refreshWeeklyCharts');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const selectedStationId = this.stationManager.getSelectedStationId();
        
        if (!selectedStationId) {
            error.textContent = '観測所を選択してください。';
            error.style.display = 'block';
            return;
        }
        
        // リフレッシュボタンを無効化
        if (refreshButton) refreshButton.disabled = true;
        loading.style.display = 'block';
        error.style.display = 'none';
        
        try {
            // 10日間データをバッチで取得
            await this.api.preloadWeeklyData();
            
            // 10日間気温データを取得・表示
            const weeklyData = await this.api.getWeeklyTemperatureData(selectedStationId);
            this.updateWeeklyCharts(weeklyData, selectedStationId);
        } catch (err) {
            console.error('Error fetching weekly data:', err);
            error.textContent = '10日間データの取得に失敗しました。しばらく待ってから再試行してください。';
            error.style.display = 'block';
        } finally {
            // リフレッシュボタンを再有効化
            if (refreshButton) refreshButton.disabled = false;
            loading.style.display = 'none';
        }
    }

    updateWeeklyCharts(weeklyData, stationId) {
        const selectedStation = this.stationManager.getStationById(stationId);
        const stationName = selectedStation ? selectedStation.name : `観測所${stationId}`;
        
        this.charts.updateWeeklyTemperatureChart(weeklyData, stationName);
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});