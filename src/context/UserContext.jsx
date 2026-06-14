import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../../api/client';

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

    // Fetch once on app start
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await client.get('/user');
            setUser(res.data);
        } catch (err) {
            console.error('UserContext fetch error:', err.message);
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