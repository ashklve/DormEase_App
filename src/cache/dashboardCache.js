import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'dashboard_cache_v1';

export const dashboardCache = {
    announcements: [],
    currentBill: '0.00',
    pendingRequests: 0,
    user: null,
    loaded: false,

    waterBilling: null,
    waterBreakdown: null,
    waterPaymentHistory: [],
};

export async function hydrateDashboardCache() {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            Object.assign(dashboardCache, parsed);
        }
    } catch (err) {
        console.error('hydrateDashboardCache error:', err);
    } finally {
        dashboardCache.loaded = true;
    }
}

export async function persistDashboardCache() {
    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dashboardCache));
    } catch (err) {
        console.error('persistDashboardCache error:', err);
    }
}