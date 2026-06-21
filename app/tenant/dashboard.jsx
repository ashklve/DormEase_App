import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Animated, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import { clearSession } from '../../api/auth';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import { dashboardCache } from '../../src/cache/dashboardCache.js';
import DrawerMenu from '../../src/components/DrawerMenu';
import LoadingOverlay from '../../src/components/LoadingOverlay';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';

const defaultPhoto = require('../../assets/def_icon.png');

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
};

const formatBillAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '0.00';
    const numericAmount = Number(String(amount).replace(/,/g, ''));
    return Number.isFinite(numericAmount)
        ? numericAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        : '0.00';
};

const HotlinesBanner = ({ onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
            backgroundColor: COLORS.primary,
            marginHorizontal: 20,
            borderRadius: 14,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        }}
    >
        <View style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        }}>
            <MaterialIcons name="phone-in-talk" size={22} color={COLORS.white} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 14 }}>
                Emergency Hotlines
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 }}>
                911 · PNP · BFP · Red Cross · Manila Rescue
            </Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={COLORS.white} />
    </TouchableOpacity>
);

const QuickActionCard = ({ iconName, title, description, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={styles.actionIconBox}>
            <MaterialIcons name={iconName} size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
    </TouchableOpacity>
);

const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
    <TouchableOpacity
        style={[styles.navItem, isCenter && styles.navCenter]}
        onPress={onPress}
    >
        {isCenter ? (
            <View style={styles.navCenterCircle}>
                <MaterialIcons name={iconName} size={26} color={COLORS.white} />
            </View>
        ) : (
            <>
                <MaterialIcons
                    name={iconName}
                    size={24}
                    color={isActive ? COLORS.primary : COLORS.grayText}
                />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>
                    {label}
                </Text>
            </>
        )}
    </TouchableOpacity>
);

const AnnouncementItem = ({ title, date, preview, onPress }) => (
    <View style={styles.announcementCard}>
        <View style={styles.announceMegaphone}>
            <Ionicons name="megaphone" size={18} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.announceTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.announceDate}>{date}</Text>
            <Text style={styles.announceText} numberOfLines={1}>{preview}</Text>
        </View>
        <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
            <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
    </View>
);

const Dashboard = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const greeting = getGreeting();
    const pullToRefreshRef = useRef(null);
    const [scrollEnabled, setScrollEnabled] = useState(true);

    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const waveAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: -1, duration: 150, useNativeDriver: true }),
                Animated.timing(waveAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
                Animated.delay(1200),
            ])
        );
        waveAnimation.start();
        return () => waveAnimation.stop();
    }, [waveAnim]);

    const waveRotation = waveAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-18deg', '18deg'],
    });

    const { user, avatarUri, fetchUser } = useUser();

    const [announcements, setAnnouncements] = useState(dashboardCache.announcements);
    const [currentBill, setCurrentBill] = useState(dashboardCache.currentBill);
    const [pendingRequests, setPendingRequests] = useState(dashboardCache.pendingRequests);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(!dashboardCache.loaded);

    const userData = {
        firstName: user?.first_name ?? '',
        fullName: user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '',
        username: user ? '@' + `${user.first_name ?? ''}${user.last_name ?? ''}`.replace(/\s+/g, '').toLowerCase() : '',
        floor: user?.floor ?? '',
        roomNumber: user?.room_number ?? '',
        roomCode: user?.room_number ? `R${user.room_number}-01` : '',
        currentBill,
        pendingRequests,
    };

    const fetchDashboardData = useCallback(async () => {
        const fetchAnnouncements = async () => {
            try {
                const res = await client.get('/announcements', { timeout: 30000 });
                const data = Array.isArray(res.data) ? res.data : [];
                dashboardCache.announcements = data;
                setAnnouncements(data);
            } catch (err) {
                console.error('failed to load announcements:', err);
            }
        };

        const fetchCurrentBill = async () => {
            try {
                const res = await client.get('/water-bill', { timeout: 30000 });
                const currentBilling = res.data.current_billing;
                const amountDue = parseFloat(String(currentBilling?.amount_due ?? '0').replace(/,/g, '')) || 0;
                const pastDueAmount = parseFloat(String(currentBilling?.past_due_amount ?? '0').replace(/,/g, '')) || 0;
                const total = amountDue + pastDueAmount;
                const amount = formatBillAmount(total);
                dashboardCache.currentBill = amount;
                setCurrentBill(amount);
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error('failed to load current bill:', err);
                }
                dashboardCache.currentBill = '0.00';
                setCurrentBill('0.00');
            }
        };

        const fetchPendingRequests = async () => {
            try {
                const res = await client.get('/maintenance', { timeout: 30000 });
                const requests = Array.isArray(res.data?.requests) ? res.data.requests : [];
                const pendingCount = requests.filter((request) =>
                    ['pending', 'in-progress'].includes(request.status)
                ).length;
                dashboardCache.pendingRequests = pendingCount;
                setPendingRequests(pendingCount);
            } catch (err) {
                console.error('failed to load pending maintenance requests:', err);
                dashboardCache.pendingRequests = 0;
                setPendingRequests(0);
            }
        };

        await Promise.all([fetchAnnouncements(), fetchCurrentBill(), fetchPendingRequests()]);
        dashboardCache.loaded = true;
    }, []);

    useEffect(() => {
        if (dashboardCache.loaded) return;
        const init = async () => {
            await fetchUser();
            await fetchDashboardData();
            setLoading(false);
        };
        init();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        fetchUser();
        await fetchDashboardData();
        setRefreshing(false);
    }, [fetchDashboardData]);

    const [activeTab, setActiveTab] = useState('home');
    useFocusEffect(
        useCallback(() => {
            setActiveTab('home');
        }, [])
    );

    // refetch fresh data whenever the dashboard regains focus (e.g. coming back from another tab),
    // but only after the initial load has already happened, since that's handled separately above.
    // this reuses onRefresh so the same pull-to-refresh spinner shows briefly while it updates.
    useFocusEffect(
        useCallback(() => {
            if (dashboardCache.loaded) {
                onRefresh();
            }
        }, [onRefresh])
    );

    const drawerRef = useRef(null);
    const photoSource = avatarUri ? { uri: avatarUri } : defaultPhoto;

    const tabNavigate = (tab, route) => {
        setActiveTab(tab);
        if (route) router.push(route);
    };

    // sort by priority first (high > moderate > low); API already returns newest-first within that
    const priorityRank = { high: 0, moderate: 1, low: 2 };
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        const rankA = priorityRank[(a.priority ?? 'low').toLowerCase()] ?? 2;
        const rankB = priorityRank[(b.priority ?? 'low').toLowerCase()] ?? 2;
        return rankA - rankB;
    });

    // only show the 3 highest-priority/most recent announcements on the dashboard
    const latestAnnouncements = sortedAnnouncements.slice(0, 3);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
            <PremiumPullToRefresh
                ref={pullToRefreshRef}
                refreshing={refreshing}
                onRefresh={onRefresh}
                iconName="dashboard"
                headerHeight={56}
                onScrollEnabledChange={setScrollEnabled}
                header={
                    <View style={styles.topRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                            <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                        </TouchableOpacity>
                        <View style={styles.topRowRight}>
                            <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
                            <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                                <Image source={photoSource} style={styles.avatar} />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            >
                <ScrollView
                    scrollEnabled={scrollEnabled}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 24) }}
                    onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
                    scrollEventThrottle={16}
                    overScrollMode="never"
                >
                <View style={styles.greeting}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text style={styles.greetTitle}>
                            {greeting}, {userData.firstName}!
                        </Text>
                        <Animated.View style={{ transform: [{ rotate: waveRotation }], marginLeft: 6 }}>
                            <Text style={styles.greetTitle}>👋</Text>
                        </Animated.View>
                    </View>
                    <Text style={styles.greetSub}>Your dorm services are just a tap away.</Text>
                </View>

                <TouchableOpacity
                    style={styles.userCard}
                    onPress={() => router.push('/tenant/profile')}
                    activeOpacity={0.85}
                >
                    <View style={styles.userCardTop}>
                        <Image source={photoSource} style={styles.avatar} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.userName}>{userData.fullName}</Text>
                            <Text style={styles.userRoom}>
                                Floor {userData.floor}, Room {userData.roomNumber}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Current Bill</Text>
                            <Text style={styles.statValue}>₱{userData.currentBill}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Pending Requests</Text>
                            <Text style={styles.statValue}>{userData.pendingRequests}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <HotlinesBanner onPress={() => router.push('/tenant/hotlines')} />

                <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
                    Quick Actions
                </Text>
                <View style={styles.actionsGrid}>
                    <QuickActionCard
                        iconName="build"
                        title="Maintenance Request"
                        description="Report room issues for quick repair"
                        onPress={() => router.push('/tenant/maintenance')}
                    />
                    <QuickActionCard
                        iconName="warning"
                        title="Emergency Report"
                        description="Alert staff immediately for urgent help"
                        onPress={() => router.push('/tenant/emergency')}
                    />
                    <QuickActionCard
                        iconName="water-drop"
                        title="Water Bill"
                        description="View and track your current charges"
                        onPress={() => router.push('/tenant/water-bill')}
                    />
                    <QuickActionCard
                        iconName="person-add"
                        title="Register Visitor"
                        description="Log your guest for smooth entry"
                        onPress={() => router.push('/tenant/visitors')}
                    />
                </View>

                <View style={styles.announcementHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.sectionTitle}>Announcements</Text>
                        {announcements.length > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{announcements.length}</Text>
                            </View>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => router.push('/tenant/announcements')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {latestAnnouncements.length === 0 ? (
                    <Text style={{ paddingHorizontal: 20, color: COLORS.muted, fontSize: 13 }}>
                        No announcements yet.
                    </Text>
                ) : (
                    latestAnnouncements.map((item) => (
                        <AnnouncementItem
                            key={item.id}
                            title={item.title}
                            date={item.date}
                            preview={item.preview}
                            onPress={() =>
                                router.push({
                                    pathname: '/tenant/announcements',
                                    params: { openId: String(item.id) },
                                })
                            }
                        />
                    ))
                )}

                {/* see all link below the 3 cards if there are more */}
                {announcements.length > 3 && (
                    <TouchableOpacity
                        onPress={() => router.push('/tenant/announcements')}
                        activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 4 }}
                    >
                        <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '600' }}>
                            View more announcements
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                </ScrollView>
            </PremiumPullToRefresh>

            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
                <NavItem
                    iconName="home"
                    label="Home"
                    isActive={activeTab === 'home'}
                    onPress={() => tabNavigate('home')}
                />
                <NavItem
                    iconName="person-outline"
                    label="Visitor"
                    isActive={activeTab === 'visitor'}
                    onPress={() => tabNavigate('visitor', '/tenant/visitors')}
                />
                <NavItem
                    iconName="warning"
                    label="Emergency"
                    isCenter
                    onPress={() => router.push('/tenant/emergency')}
                />
                <NavItem
                    iconName="water-drop"
                    label="Water Bill"
                    isActive={activeTab === 'billing'}
                    onPress={() => tabNavigate('billing', '/tenant/water-bill')}
                />
                <NavItem
                    iconName="account-circle"
                    label="Profile"
                    isActive={activeTab === 'profile'}
                    onPress={() => tabNavigate('profile', '/tenant/profile')}
                />
            </View>

            <DrawerMenu ref={drawerRef} />
            <LoadingOverlay visible={loading} />

        </SafeAreaView>
    );
};

export default Dashboard;