import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearDashboardCache } from '../src/cache/dashboardCache';

export const loginTenant = async (identifier, password) => {
    const response = await client.post('/login', { identifier, password });
    return response.data; // ← don't auto-save here anymore; let LoginScreen decide
};

// ── Save session (called only when "Keep me logged in" is checked) ────────────
export const saveSession = async (token, user) => {
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(user));
};

// ── Load session on app open ──────────────────────────────────────────────────
export const loadSession = async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const user  = await AsyncStorage.getItem('auth_user');
    if (!token || !user) return null;
    return { token, user: JSON.parse(user) };
};

// ── Clear session on logout ───────────────────────────────────────────────────
export const clearSession = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    await AsyncStorage.removeItem('keep_logged_in');
    await AsyncStorage.removeItem('background_timestamp');
    await clearDashboardCache();
};

// keep this if anything else in your app still calls logoutTenant
export const logoutTenant = clearSession;