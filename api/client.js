import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
    baseURL: 'http://32.236.73.172/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        }
});

// ── Auto-attach saved token to every request ──────────────────────────────────
client.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default client;