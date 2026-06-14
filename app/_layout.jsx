import { Stack } from 'expo-router';
import { UserProvider } from '../src/context/UserContext';
import PushNotificationBootstrap from '../src/components/PushNotificationBootstrap';
import LoadingOverlay from '../components/LoadingOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';

export default function RootLayout() {
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        const initApp = async () => {
            try {
                await AsyncStorage.getItem('auth_token');
            } catch (e) {
                console.warn('Init error:', e);
            } finally {
                setShowOverlay(false);
            }
        };

        initApp();
    }, []);

    return (
        <UserProvider>
            <PushNotificationBootstrap />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="auth/change-password" />
                <Stack.Screen name="tenant" />
            </Stack>
            <LoadingOverlay visible={showOverlay} />
        </UserProvider>
    );
}