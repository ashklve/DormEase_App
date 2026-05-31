// Simple in-memory cache that lives for the entire app session.
// Survives screen unmounts — resets only when the app is fully closed.
export const dashboardCache = {
    announcements: [],
    currentBill: '0.00',
    pendingRequests: 0,
    user: null,
    loaded: false,
};