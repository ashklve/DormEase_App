import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginTenant = async (account_id, password) => {
    const response = await client.post('/login', { account_id, password });
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
};

export const logoutTenant = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
};