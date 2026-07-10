import { Stack } from 'expo-router';
import { UserProvider } from '../src/context/UserContext';
import PushNotificationBootstrap from '../src/components/PushNotificationBootstrap';
import LoadingOverlay from '../src/components/LoadingOverlay';
import OfflineBanner from '../src/components/OfflineBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateDashboardCache } from '../src/cache/dashboardCache';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
        <SafeAreaProvider>
            <UserProvider>
                <PushNotificationBootstrap />
                <View style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="welcome" />
                        <Stack.Screen name="auth/login" />
                        <Stack.Screen name="auth/change-password" />
                        <Stack.Screen name="tenant" />
                    </Stack>
                    <OfflineBanner />
                </View>
                <LoadingOverlay visible={showOverlay} />
            </UserProvider>
        </SafeAreaProvider>
    );
}