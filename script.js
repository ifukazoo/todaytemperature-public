class WeatherDataCache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
        this.ttl = 10 * 60 * 1000; // 10分
    }
    
    set(key, data) {
        this.cache.set(key, data);
        this.timestamps.set(key, Date.now());
        
        // 10分後に自動削除
        setTimeout(() => {
            this.cache.delete(key);
            this.timestamps.delete(key);
            console.log(`Cache expired for ${key}`);
        }, this.ttl);
        
        console.log(`Cache set for ${key}`);
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }
        
        // TTLチェック
        const timestamp = this.timestamps.get(key);
        if (!timestamp || (Date.now() - timestamp > this.ttl)) {
            this.cache.delete(key);
            this.timestamps.delete(key);
            console.log(`Cache expired (TTL) for ${key}`);
            return null;
        }
        
        console.log(`Cache hit for ${key}`);
        return this.cache.get(key);
    }
    
    has(key) {
        return this.get(key) !== null;
    }
    
    clear() {
        this.cache.clear();
        this.timestamps.clear();
        console.log('Cache cleared');
    }
    
    size() {
        return this.cache.size;
    }
}

class WeatherApp {
    constructor() {
        this.temperatureChart = null;
        this.pressureChart = null;
        this.stations = [];
        this.dataCache = new WeatherDataCache();

        this.init();
    }

    async init() {
        document.getElementById('fetchButton').addEventListener('click', () => {
            this.fetchWeatherData();
        });
        
        // 観測所選択時の自動更新
        document.getElementById('stationSelect').addEventListener('change', () => {
            this.onStationChange();
            this.updateStationInfo();
        });
        
        this.initCharts();
        await this.loadStations();
    }

    initCharts() {
        this.initTemperatureChart();
        this.initPressureChart();
    }

    initTemperatureChart() {
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        this.temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '気温 (°C)',
                    data: [],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '気温 (°C)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '今日の気温変化'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    initPressureChart() {
        const ctx = document.getElementById('pressureChart').getContext('2d');
        this.pressureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '気圧 (hPa)',
                    data: [],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: '気圧 (hPa)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '時刻'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '今日の気圧変化'
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    async loadStations() {
        try {
            console.log('Loading stations from CSV...');
            const response = await fetch('ame_master_20250313.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('CSV loaded, length:', csvText.length);
            
            const lines = csvText.split('\n').slice(1);
            this.stations = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const columns = this.parseCSVLine(line);
                    if (columns.length >= 4) {
                        const stationId = columns[1];
                        const stationType = columns[2];
                        const stationName = columns[3];
                        const prefecture = columns[0];
                        
                        // 雨または雪のみの観測所は除外（気温データなし）
                        if (stationType === '雨' || stationType === '雪') {
                            continue;
                        }
                        
                        if (stationId && stationName && prefecture) {
                            this.stations.push({
                                id: stationId,
                                name: `${prefecture} ${stationName}`,
                                prefecture: prefecture,
                                originalName: stationName,
                                type: stationType
                            });
                        }
                    }
                }
            }
            
            console.log('Parsed stations:', this.stations.length);
            this.populateStationSelect();
            
        } catch (error) {
            console.error('Failed to load stations:', error);
        }
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    populateStationSelect() {
        const select = document.getElementById('stationSelect');
        console.log('Populating select with', this.stations.length, 'stations');
        
        select.innerHTML = '<option value="">観測所を選択してください</option>';
        
        // 県別にグループ化
        const prefectureGroups = {};
        this.stations.forEach(station => {
            const prefecture = station.prefecture;
            if (!prefectureGroups[prefecture]) {
                prefectureGroups[prefecture] = [];
            }
            prefectureGroups[prefecture].push(station);
        });
        
        // 県別にoptgroupを作成
        Object.keys(prefectureGroups).sort().forEach(prefecture => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = prefecture;
            
            prefectureGroups[prefecture]
                .sort((a, b) => a.originalName.localeCompare(b.originalName, 'ja'))
                .forEach(station => {
                    const option = document.createElement('option');
                    option.value = station.id;
                    option.textContent = `${station.originalName} (${station.type})`;
                    option.dataset.prefecture = station.prefecture;
                    option.dataset.type = station.type;
                    optgroup.appendChild(option);
                });
            
            select.appendChild(optgroup);
        });
        
        select.value = '48361';
        this.updateStationInfo();
        console.log('Select populated, selected value:', select.value);
    }

    getSelectedStationId() {
        const select = document.getElementById('stationSelect');
        return select.value;
    }
    
    updateStationInfo() {
        const selectedStationId = this.getSelectedStationId();
        const stationInfo = document.getElementById('stationInfo');
        
        if (!selectedStationId) {
            stationInfo.innerHTML = '';
            return;
        }
        
        const selectedStation = this.stations.find(station => station.id === selectedStationId);
        if (selectedStation) {
            stationInfo.innerHTML = `
                <div class="selected-station-info">
                    ${selectedStation.prefecture} ${selectedStation.originalName}
                    <span style="margin-left: 8px; padding: 2px 8px; background: rgba(42, 176, 240, 0.1); border-radius: 4px; font-size: 0.8rem;">
                        ${selectedStation.type === '四' ? '四要素' : selectedStation.type === '官' ? '官署' : selectedStation.type}
                    </span>
                </div>
            `;
        }
    }

    async onStationChange() {
        const selectedStationId = this.getSelectedStationId();
        
        if (!selectedStationId) {
            return;
        }
        
        // キャッシュがあるかチェック
        if (this.hasCachedData()) {
            console.log('Using cached data for station change');
            try {
                const weatherData = await this.getTodayWeatherDataFromCache(selectedStationId);
                this.updateCharts(weatherData, selectedStationId);
            } catch (error) {
                console.warn('Failed to use cached data:', error);
            }
        }
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
            if (this.dataCache.has(timestamp)) {
                cacheCount++;
            }
        }
        
        const requiredCacheCount = Math.min(3, currentHour + 1); // 3時間分または利用可能時間分
        return cacheCount >= requiredCacheCount;
    }

    async fetchWeatherData() {
        const button = document.getElementById('fetchButton');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const selectedStationId = this.getSelectedStationId();
        
        if (!selectedStationId) {
            error.textContent = '観測所を選択してください。';
            error.style.display = 'block';
            return;
        }
        
        button.disabled = true;
        loading.style.display = 'block';
        error.style.display = 'none';
        
        try {
            // バッチでデータを取得
            await this.preloadTodayData();
            
            // キャッシュから指定観測所のデータを抽出
            const weatherData = await this.getTodayWeatherDataFromCache(selectedStationId);
            this.updateCharts(weatherData, selectedStationId);
        } catch (err) {
            console.error('Error fetching weather data:', err);
            error.textContent = 'データの取得に失敗しました。しばらく待ってから再試行してください。';
            error.style.display = 'block';
        } finally {
            button.disabled = false;
            loading.style.display = 'none';
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
                        pressure: data.pressure
                    });
                } catch (error) {
                    console.warn(`Failed to get cached data for hour ${hour}:`, error);
                    weatherData.push({
                        time: `${hour.toString().padStart(2, '0')}:00`,
                        temperature: null,
                        pressure: null
                    });
                }
            } else {
                // 未来の時刻はnullで表示エリアのみ確保
                weatherData.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    temperature: null,
                    pressure: null
                });
            }
        }
        
        return weatherData;
    }


    async fetchAllStationsForHour(date, hour) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hourStr = hour.toString().padStart(2, '0');
        
        const timestamp = `${year}${month}${day}${hourStr}0000`;
        
        // キャッシュチェック
        const cachedData = this.dataCache.get(timestamp);
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
            this.dataCache.set(timestamp, data);
            
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
                pressure: stationData.pressure ? stationData.pressure[0] : null
            };
        } else {
            throw new Error(`No weather data found for station ${stationId}`);
        }
    }

    updateCharts(weatherData, stationId) {
        const labels = weatherData.map(data => data.time);
        const temperatures = weatherData.map(data => data.temperature);
        const pressures = weatherData.map(data => data.pressure);

        const selectedStation = this.stations.find(station => station.id === stationId);
        const stationName = selectedStation ? selectedStation.name : `観測所${stationId}`;

        this.temperatureChart.data.labels = labels;
        this.temperatureChart.data.datasets[0].data = temperatures;
        this.temperatureChart.options.plugins.title.text = `${stationName} - 今日の気温変化`;
        this.temperatureChart.update();

        this.pressureChart.data.labels = labels;
        this.pressureChart.data.datasets[0].data = pressures;
        this.pressureChart.options.plugins.title.text = `${stationName} - 今日の気圧変化`;
        this.pressureChart.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});