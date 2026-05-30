import { Stack } from 'expo-router';
import { UserProvider } from '../src/context/UserContext';
import PushNotificationBootstrap from '../src/components/PushNotificationBootstrap';


export default function RootLayout() {
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
        </UserProvider>
    );
}
