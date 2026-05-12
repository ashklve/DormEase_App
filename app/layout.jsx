import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="tenant/dashboard" />
            <Stack.Screen name="tenant/announcements" />
            <Stack.Screen name="tenant/maintenance" />
            <Stack.Screen name="tenant/emergency" />
            <Stack.Screen name="tenant/water-bill" />
            <Stack.Screen name="tenant/visitor" />
            <Stack.Screen name="tenant/documents" />
            <Stack.Screen name="tenant/notifications" />
            <Stack.Screen name="tenant/profile" />
            <Stack.Screen name="auth/change-password" />
        </Stack>
    );
}