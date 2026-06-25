import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'dashboard_cache_v1';

export const dashboardCache = {
    announcements: [],
    currentBill: '0.00',
    pendingRequests: 0,
    user: null,
    loaded: false,
    firstLoadDone: false,

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
        dashboardCache.firstLoadDone = false;
    }
}

export async function persistDashboardCache() {
    try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dashboardCache));
    } catch (err) {
        console.error('persistDashboardCache error:', err);
    }
}

export async function clearDashboardCache() {
    try {
        await AsyncStorage.removeItem(CACHE_KEY);
    } catch (err) {
        console.error('clearDashboardCache error:', err);
    } finally {
        dashboardCache.announcements = [];
        dashboardCache.currentBill = '0.00';
        dashboardCache.pastDueAmount = 0;
        dashboardCache.pendingRequests = 0;
        dashboardCache.user = null;
        dashboardCache.loaded = false;
        dashboardCache.firstLoadDone = false;
        dashboardCache.waterBilling = null;
        dashboardCache.waterBreakdown = null;
        dashboardCache.waterPaymentHistory = [];
    }
}