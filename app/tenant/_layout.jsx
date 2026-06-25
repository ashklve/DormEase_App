import { Stack } from 'expo-router';

export default function TenantLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="emergencyhistory" options={{ gestureEnabled: false }} />
            <Stack.Screen name="maintenancehistory" options={{ gestureEnabled: false }} />
            <Stack.Screen name="records" options={{ gestureEnabled: false }} />
        </Stack>
    );
}