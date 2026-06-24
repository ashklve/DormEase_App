import { Platform } from 'react-native';
import Constants from 'expo-constants';
import client from '../../api/client';

let notificationsModule;

const getNotifications = () => {
    if (notificationsModule) return notificationsModule;

    try {
        notificationsModule = require('expo-notifications');
        return notificationsModule;
    } catch (error) {
        console.warn('Expo notifications native module is not available yet:', error.message);
        return null;
    }
};

const configureNotificationHandler = () => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
};

configureNotificationHandler();

const NOTIFICATION_ROUTES = {
    announcement: '/tenant/announcements',
    document: '/tenant/records',
    bill: '/tenant/water-bill',
    payment: '/tenant/water-bill',
    maintenance: '/tenant/maintenancehistory',
    emergency: '/tenant/emergencyhistory',
    visitor: '/tenant/visitors',
};

const getProjectId = () =>
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

export const getNotificationRoute = (data = {}) => {
    if (typeof data.route === 'string' && data.route.startsWith('/')) {
        return data.route;
    }

    return NOTIFICATION_ROUTES[data.type] ?? '/tenant/notifications';
};

export const registerForPushNotificationsAsync = async () => {
    try {
        const Notifications = getNotifications();
        if (!Notifications) return null;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#CA5D86',
                showBadge: true,
            });
        }

        const existingPermission = await Notifications.getPermissionsAsync();
        let finalStatus = existingPermission.status;
        console.log('Push notification permission status:', finalStatus);

        if (existingPermission.status !== 'granted') {
            const requestedPermission = await Notifications.requestPermissionsAsync({
                ios: {
                    allowAlert: true,
                    allowBadge: true,
                    allowSound: true,
                },
            });
            finalStatus = requestedPermission.status;
            console.log('Push notification requested permission status:', finalStatus);
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permission was not granted.');
            return null;
        }

        const projectId = getProjectId();
        if (!projectId) {
            console.warn('Missing EAS projectId for Expo push token registration.');
            return null;
        }

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo push token registered:', token);

        await client.post('/device-tokens', {
            expo_push_token: token,
            platform: Platform.OS,
            device_name: Constants.deviceName ?? null,
        });
        console.log('Expo push token saved to API.');

        return token;
    } catch (error) {
        console.warn(
            'Push notification registration skipped:',
            error.response?.data ?? error.message
        );
        return null;
    }
};

export const addNotificationResponseListener = (onNavigate) => {
    const Notifications = getNotifications();

    if (!Notifications) {
        return { remove: () => {} };
    }

    return Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        onNavigate(getNotificationRoute(data));
    });
};

export const addNotificationReceivedListener = (onReceive) => {
    const Notifications = getNotifications();

    if (!Notifications) {
        return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener((notification) => {
        onReceive(notification);
    });
};

export const getLastNotificationRoute = () => {
    const Notifications = getNotifications();
    const response = Notifications?.getLastNotificationResponse?.();
    const data = response?.notification?.request?.content?.data;

    return data ? getNotificationRoute(data) : null;
};

export const setBadgeCount = async (count) => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
        if (typeof Notifications.setBadgeCountAsync === 'function') {
            await Notifications.setBadgeCountAsync(count);
        }
    } catch (error) {
        console.warn('Failed to set badge count:', error.message);
    }
};
