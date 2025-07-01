/**
 * 気象庁アメダスAPI関連処理
 * データ取得、キャッシュ連携、プログレス表示を担当
 */
export class WeatherAPI {
    constructor(cache) {
        this.cache = cache;
    }

    async fetchAllStationsForHour(date, hour) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hourStr = hour.toString().padStart(2, '0');
        
        const timestamp = `${year}${month}${day}${hourStr}0000`;
        
        // キャッシュチェック
        const cachedData = this.cache.get(timestamp);
        if (cachedData) {
            return cachedData;
        }
        
        const url = `https://www.jma.go.jp/bosai/amedas/data/map/${timestamp}.json`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // キャッシュに保存
            this.cache.set(timestamp, data);
            
            return data;
            
        } catch (error) {
            console.warn(`Failed to fetch weather data for ${timestamp}:`, error.message);
            throw error;
        }
    }

    async fetchWeatherForHour(date, hour, stationId) {
        const allStationsData = await this.fetchAllStationsForHour(date, hour);
        
        if (allStationsData && allStationsData[stationId]) {
            const stationData = allStationsData[stationId];
            return {
                temperature: stationData.temp ? stationData.temp[0] : null,
                pressure: stationData.pressure ? stationData.pressure[0] : null,
                humidity: stationData.humidity ? stationData.humidity[0] : null
            };
        } else {
            throw new Error(`No weather data found for station ${stationId}`);
        }
    }

    async preloadTodayData() {
        const today = new Date();
        const promises = [];
        const loading = document.getElementById('loading');
        
        // 現在時刻まで（未来の時刻は除外）
        const currentHour = today.getHours();
        const total = currentHour + 1; // 0時から現在時刻まで
        
        console.log(`Starting batch data preload for hours 0-${currentHour}...`);
        
        // プログレス表示用の状態
        let completed = 0;
        
        // 現在時刻までのデータを並列取得
        for (let hour = 0; hour <= currentHour; hour++) {
            const promise = this.fetchAllStationsForHour(today, hour).then(() => {
                completed++;
                const progress = Math.round((completed / total) * 100);
                loading.textContent = `データを取得中... (${progress}%)`;
            });
            promises.push(promise);
        }
        
        try {
            await Promise.allSettled(promises);
            loading.textContent = 'データ処理中...';
            console.log(`Batch preload completed for ${total} hours`);
        } catch (error) {
            console.warn('Some data failed to preload:', error);
        }
    }

    async getTodayWeatherDataFromCache(stationId) {
        const weatherData = [];
        const today = new Date();
        const currentHour = today.getHours();
        
        // 24時間分の表示エリアを確保（0-23時）
        for (let hour = 0; hour < 24; hour++) {
            if (hour <= currentHour) {
                // 現在時刻まではデータを取得
                try {
                    const data = await this.fetchWeatherForHour(today, hour, stationId);
                    weatherData.push({
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        temperature: data.temperature,
                        pressure: data.pressure,
                        humidity: data.humidity
                    });
                } catch (error) {
                    console.warn(`Failed to get cached data for hour ${hour}:`, error);
                    weatherData.push({
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        temperature: null,
                        pressure: null,
                        humidity: null
                    });
                }
            } else {
                // 未来の時刻はnullで表示エリアのみ確保
                weatherData.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    temperature: null,
                    pressure: null,
                    humidity: null
                });
            }
        }
        
        return weatherData;
    }

    hasCachedData() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const currentHour = today.getHours();
        
        // 現在時刻までの範囲で少なくとも数時間分のキャッシュがあるかチェック
        let cacheCount = 0;
        for (let hour = 0; hour <= currentHour; hour++) {
            const hourStr = hour.toString().padStart(2, '0');
            const timestamp = `${year}${month}${day}${hourStr}0000`;
            if (this.cache.has(timestamp)) {
                cacheCount++;
            }
        }
        
        const requiredCacheCount = Math.min(3, currentHour + 1); // 3時間分または利用可能時間分
        return cacheCount >= requiredCacheCount;
    }

    async getWeeklyTemperatureData(stationId) {
        const allTemperatures = [];
        const allLabels = [];
        const today = new Date();
        
        // 過去7日間のデータを時間単位で取得（今日から7日前まで）
        for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);
            
            const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
            
            // 1日24時間分のデータを取得
            for (let hour = 0; hour < 24; hour++) {
                try {
                    const data = await this.fetchWeatherForHour(date, hour, stationId);
                    const label = `${dateString} ${hour.toString().padStart(2, '0')}:00`;
                    
                    allTemperatures.push(data.temperature);
                    allLabels.push(label);
                } catch (error) {
                    // エラーの場合はnullを追加
                    const label = `${dateString} ${hour.toString().padStart(2, '0')}:00`;
                    allTemperatures.push(null);
                    allLabels.push(label);
                    console.warn(`Failed to get data for ${date.toDateString()} ${hour}:00:`, error);
                }
            }
        }
        
        return {
            temperatures: allTemperatures,
            labels: allLabels
        };
    }

    async preloadWeeklyData() {
        const loading = document.getElementById('loading');
        const today = new Date();
        const promises = [];
        let completed = 0;
        const total = 7 * 24; // 7日 × 24時間
        
        console.log('Starting weekly data preload...');
        
        // 過去7日間のデータを並列取得
        for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);
            
            for (let hour = 0; hour < 24; hour++) {
                const promise = this.fetchAllStationsForHour(date, hour).then(() => {
                    completed++;
                    const progress = Math.round((completed / total) * 100);
                    loading.textContent = `週間データを取得中... (${progress}%)`;
                }).catch(() => {
                    // エラーは無視してプログレスだけ更新
                    completed++;
                    const progress = Math.round((completed / total) * 100);
                    loading.textContent = `週間データを取得中... (${progress}%)`;
                });
                promises.push(promise);
            }
        }
        
        try {
            await Promise.allSettled(promises);
            loading.textContent = 'データ処理中...';
            console.log('Weekly data preload completed');
        } catch (error) {
            console.warn('Some weekly data failed to preload:', error);
        }
    }
}