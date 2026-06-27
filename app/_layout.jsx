import { Stack } from 'expo-router';
import { UserProvider } from '../src/context/UserContext';
import PushNotificationBootstrap from '../src/components/PushNotificationBootstrap';
import LoadingOverlay from '../src/components/LoadingOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateDashboardCache } from '../src/cache/dashboardCache';
import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
    const [showOverlay, setShowOverlay] = useState(true);

    useEffect(() => {
        const initApp = async () => {
            const startTime = Date.now();
            try {
                await AsyncStorage.getItem('auth_token');
                await hydrateDashboardCache();
            } catch (e) {
                console.warn('Init error:', e);
            } finally {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 2000 - elapsed);
                if (remaining > 0) {
                    await new Promise(resolve => setTimeout(resolve, remaining));
                }
                setShowOverlay(false);
                await SplashScreen.hideAsync().catch(() => { });
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