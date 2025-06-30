/**
 * 気象データのTTLベースキャッシュシステム
 * 10分間のデータキャッシュでAPI効率化を実現
 */
export class WeatherDataCache {
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