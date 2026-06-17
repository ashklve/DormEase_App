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
        const role = user?.role;
        const accountId = user?.account_id;
        const isTenant = role === 'tenant' || (accountId && String(accountId).startsWith('TNT'));

        if (isTenant) {
            registerForPushNotificationsAsync();
        }
    }, [user]);

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
