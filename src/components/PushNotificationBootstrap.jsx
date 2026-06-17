import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
    addNotificationResponseListener,
    getLastNotificationRoute,
    registerForPushNotificationsAsync,
} from '../services/pushNotifications';
import { useUser } from '../context/UserContext';

export default function PushNotificationBootstrap() {
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        if (user?.role === 'tenant') {
            registerForPushNotificationsAsync();
        }
    }, [user?.role]);

    useEffect(() => {
        const subscription = addNotificationResponseListener((route) => {
            router.push(route);
        });

        return () => subscription.remove();
    }, [router]);

    useEffect(() => {
        const route = getLastNotificationRoute();
        if (route) router.push(route);
    }, [router]);

    return null;
}
