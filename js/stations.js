/**
 * 気象観測所データの管理
 * CSVマスターファイルの読み込み、パース、UI更新を担当
 */
export class StationManager {
    constructor() {
        this.stations = [];
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
            
            return this.stations;
        } catch (error) {
            console.error('Failed to load stations:', error);
            throw error;
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
        this.populatePrefectureSelect();
        console.log('Station data loaded:', this.stations.length, 'stations');
    }

    populatePrefectureSelect() {
        const prefectureSelect = document.getElementById('prefectureSelect');
        
        // 都道府県リストをCSV登場順で作成（重複除去しつつ順序維持）
        const prefectures = [];
        const seen = new Set();
        this.stations.forEach(station => {
            if (!seen.has(station.prefecture)) {
                prefectures.push(station.prefecture);
                seen.add(station.prefecture);
            }
        });
        
        prefectureSelect.innerHTML = '<option value="">都道府県を選択してください</option>';
        prefectures.forEach(prefecture => {
            const option = document.createElement('option');
            option.value = prefecture;
            option.textContent = prefecture;
            prefectureSelect.appendChild(option);
        });
        
        console.log('Prefecture select populated with', prefectures.length, 'prefectures');
    }

    populateStationSelectForPrefecture(selectedPrefecture) {
        const stationSelect = document.getElementById('stationSelect');
        
        if (!selectedPrefecture) {
            stationSelect.innerHTML = '<option value="">観測所を選択してください</option>';
            stationSelect.disabled = true;
            return;
        }
        
        const stationsInPrefecture = this.stations.filter(station => 
            station.prefecture === selectedPrefecture
        );
        
        stationSelect.innerHTML = '<option value="">観測所を選択してください</option>';
        
        stationsInPrefecture
            .sort((a, b) => a.originalName.localeCompare(b.originalName, 'ja'))
            .forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = `${station.originalName} (${station.type})`;
                option.dataset.prefecture = station.prefecture;
                option.dataset.type = station.type;
                stationSelect.appendChild(option);
            });
        
        stationSelect.disabled = false;
        console.log(`Station select populated with ${stationsInPrefecture.length} stations for ${selectedPrefecture}`);
    }

    getSelectedStationId() {
        const select = document.getElementById('stationSelect');
        return select.value;
    }

    getStationById(stationId) {
        return this.stations.find(station => station.id === stationId);
    }

    getDefaultStation() {
        return this.stations.find(station => station.id === '48361');
    }

    setupDefaultStation() {
        const prefectureSelect = document.getElementById('prefectureSelect');
        const stationSelect = document.getElementById('stationSelect');
        
        // デフォルトで長野県を選択（観測所ID 48361がある県）
        const naganoStation = this.getDefaultStation();
        if (naganoStation) {
            prefectureSelect.value = naganoStation.prefecture;
            this.populateStationSelectForPrefecture(naganoStation.prefecture);
            stationSelect.value = '48361';
            return true;
        }
        return false;
    }
}