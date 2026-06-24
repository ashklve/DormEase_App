// src/cache/dashboardCache.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'dashboard_water_bill_cache_v1';

export const dashboardCache = {
    async save(payload) {
        try {
            await AsyncStorage.setItem(
                CACHE_KEY,
                JSON.stringify({ ...payload, cachedAt: Date.now() })
            );
        } catch (err) {
            console.error('dashboardCache.save error:', err);
        }
    },

    async load() {
        try {
            const raw = await AsyncStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('dashboardCache.load error:', err);
            return null;
        }
    },
};