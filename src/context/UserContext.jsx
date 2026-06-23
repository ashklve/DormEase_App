import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';
import { AppState, Alert } from 'react-native';
import { router } from 'expo-router';

// ── Build full avatar URL from a storage path ─────────────────────────────────
export const buildAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;
};

// ── Context ───────────────────────────────────────────────────────────────────
const UserContext = createContext(null);

// ── Provider — wrap your root layout with this ────────────────────────────────
export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch once on app start — but only after token is confirmed present
    useEffect(() => {
        const init = async () => {
            const token = await AsyncStorage.getItem('auth_token');
            const keepLoggedIn = await AsyncStorage.getItem('keep_logged_in');

            if (token && keepLoggedIn !== 'true') {
                // Not kept logged in — clear session on fresh startup
                await AsyncStorage.removeItem('auth_token');
                await AsyncStorage.removeItem('auth_user');
                await AsyncStorage.removeItem('keep_logged_in');
                await AsyncStorage.removeItem('background_timestamp');
                setUser(null);
                setLoading(false);
                return;
            }

            if (!token) {
                setLoading(false);
                return; // no token, don't attempt fetch — let login handle it
            }
            await fetchUser();
        };
        init();
    }, []);

    // Listen for background state transitions to handle session expiration
    useEffect(() => {
        const handleAppStateChange = async (nextAppState) => {
            if (nextAppState === 'background') {
                await AsyncStorage.setItem('background_timestamp', Date.now().toString());
            } else if (nextAppState === 'active') {
                const bgTimeStr = await AsyncStorage.getItem('background_timestamp');
                if (bgTimeStr) {
                    const bgTime = parseInt(bgTimeStr, 10);
                    const elapsed = Date.now() - bgTime;
                    
                    const token = await AsyncStorage.getItem('auth_token');
                    const keepLoggedIn = await AsyncStorage.getItem('keep_logged_in');

                    // If token exists, "Keep me logged in" is false, and elapsed time > 15 minutes (900,000 ms)
                    if (token && keepLoggedIn !== 'true' && elapsed > 15 * 60 * 1000) {
                        await AsyncStorage.removeItem('auth_token');
                        await AsyncStorage.removeItem('auth_user');
                        await AsyncStorage.removeItem('keep_logged_in');
                        await AsyncStorage.removeItem('background_timestamp');
                        setUser(null);
                        Alert.alert(
                            'Session Expired',
                            'Your session has expired due to inactivity. Please log in again.'
                        );
                        router.replace('/auth/login');
                    } else {
                        await AsyncStorage.removeItem('background_timestamp');
                    }
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await client.get('/user');
            setUser(res.data);
        } catch (err) {
            console.error('UserContext fetch error:', err.message);
            if (err.response?.status === 401) {
                // Token expired or invalid — clear it
                await AsyncStorage.removeItem('auth_token');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    // Call this after a successful profile photo upload to update globally
    const updateProfilePhoto = (newPhotoPath) => {
        setUser((prev) => ({ ...prev, profile_photo: newPhotoPath }));
    };

    // Call this after a successful contact info update
    const updateContactInfo = (email, contactNumber) => {
        setUser((prev) => ({ ...prev, email, contact_number: contactNumber }));
    };

    // Call this after a successful vacation status toggle
    const updateVacationStatus = (isOnVacation, vacationNote) => {
        setUser((prev) => ({ ...prev, is_on_vacation: isOnVacation, vacation_note: vacationNote }));
    };

    // Convenience: the resolved avatar URI ready for <Image source={}>
    const avatarUri = user?.profile_photo ? buildAvatarUrl(user.profile_photo) : null;

    return (
        <UserContext.Provider
            value={{
                user,
                loading,
                avatarUri,
                fetchUser,
                updateProfilePhoto,
                updateContactInfo,
                updateVacationStatus,
                setUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

// ── Hook — use this in any screen ─────────────────────────────────────────────
export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
    return ctx;
}