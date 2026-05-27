import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import { clearSession } from '../../api/auth';
import client from '../../api/client';
import { useUser } from '../../src/context/UserContext';

const defaultPhoto = require('../../assets/def_icon.png');


// shows good morning / afternoon / evening based on current time
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

// hotlines banner component
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

// quick action card component
const QuickActionCard = ({ iconName, title, description, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
        <View style={styles.actionIconBox}>
            <MaterialIcons name={iconName} size={26} color={COLORS.primary} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDesc}>{description}</Text>
    </TouchableOpacity>
);

// bottom nav item component
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

// single announcement row component on dashboard
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

// drawer nav item component
const DrawerItem = ({ iconName, iconLib = 'Ionicons', label, onPress, hasChevron = true }) => (
    <TouchableOpacity style={styles.drawerItem} onPress={onPress}>
        <View style={styles.drawerItemLeft}>
            {iconLib === 'MaterialIcons'
                ? <MaterialIcons name={iconName} size={20} color={COLORS.white} />
                : <Ionicons name={iconName} size={20} color={COLORS.white} />
            }
            <Text style={styles.drawerItemText}>{label}</Text>
        </View>
        {hasChevron && (
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        )}
    </TouchableOpacity>
);

// ── main screen ───────────────────────────────────────────────────────────────
const Dashboard = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const greeting = getGreeting();

    const { user, avatarUri, fetchUser } = useUser();
    const [currentBill, setCurrentBill] = useState('0.00');
    const [pendingRequests, setPendingRequests] = useState(0);

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

    // ── load latest announcements from API ────────────────────────────────────
    const [announcements, setAnnouncements] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchUser();

            const fetchAnnouncements = async () => {
                try {
                    const res = await client.get('/announcements', { timeout: 30000 });
                    setAnnouncements(Array.isArray(res.data) ? res.data : []);
                } catch (err) {
                    console.error('failed to load announcements:', err);
                }
            };

            const fetchCurrentBill = async () => {
                try {
                    const res = await client.get('/water-bill', { timeout: 30000 });
                    setCurrentBill(formatBillAmount(res.data.current_billing?.amount_due));
                } catch (err) {
                    if (err.response?.status !== 404) {
                        console.error('failed to load current bill:', err);
                    }
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

                    setPendingRequests(pendingCount);
                } catch (err) {
                    console.error('failed to load pending maintenance requests:', err);
                    setPendingRequests(0);
                }
            };

            fetchAnnouncements();
            fetchCurrentBill();
            fetchPendingRequests();
        }, [])
    );

    // controls which bottom tab is active
    const [activeTab, setActiveTab] = useState('home');
    useFocusEffect(
        useCallback(() => {
            setActiveTab('home');
        }, [])
    );

    // controls if the drawer is open or closed
    const [drawerOpen, setDrawerOpen] = useState(false);

    // controls if the documents submenu is expanded
    const [documentsExpanded, setDocumentsExpanded] = useState(false);

    // animation value for sliding the drawer in and out
    const drawerAnim = useRef(new Animated.Value(-400)).current;

    // if user has a photo from the database use it, otherwise use the default
    const photoSource = avatarUri ? { uri: avatarUri } : defaultPhoto;

    // slides the drawer in from the left
    const openDrawer = () => {
        setDrawerOpen(true);
        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
        }).start();
    };

    // slides the drawer back out to the left
    const closeDrawer = () => {
        Animated.timing(drawerAnim, {
            toValue: -400,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setDrawerOpen(false));
    };

    // navigate and close drawer at the same time
    const drawerNavigate = (route) => {
        closeDrawer();
        setTimeout(() => router.push(route), 260);
    };

    // navigate bottom tab and set active state
    const tabNavigate = (tab, route) => {
        setActiveTab(tab);
        if (route) router.push(route);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* header */}
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={openDrawer}>
                    <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => router.push('/tenant/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                        <Image source={photoSource} style={styles.avatar} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 24) }}
            >
                {/* greeting */}
                <View style={styles.greeting}>
                    <Text style={styles.greetTitle}>
                        {greeting}, {userData.firstName}! 👋
                    </Text>
                    <Text style={styles.greetSub}>Your dorm services are just a tap away.</Text>
                </View>

                {/* user card — tappable to go to profile */}
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

                {/* hotlines banner */}
                <HotlinesBanner onPress={() => router.push('/tenant/hotlines')} />

                {/* quick actions */}
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

                {/* announcements — live from API */}
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

                {announcements.length === 0 ? (
                    <Text style={{ paddingHorizontal: 20, color: COLORS.muted, fontSize: 13 }}>
                        No announcements yet.
                    </Text>
                ) : (
                    announcements.map((item) => (
                        <AnnouncementItem
                            key={item.id}
                            title={item.title}
                            date={item.date}
                            preview={item.preview}
                            onPress={() => router.push('/tenant/announcements')}
                        />
                    ))
                )}

            </ScrollView>

            {/* bottom nav */}
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

            {/* dark overlay behind drawer */}
            {drawerOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={closeDrawer}
                />
            )}

            {/* drawer / hamburger nav */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>

                {/* drawer top: user photo, username, room code */}
                <View style={styles.drawerTop}>
                    <Image source={photoSource} style={styles.drawerAvatar} />
                    <Text style={styles.drawerUsername}>{userData.username}</Text>
                    <Text style={styles.drawerRoom}>{userData.roomCode}</Text>
                </View>

                {/* close button */}
                <TouchableOpacity style={styles.drawerCloseBtn} onPress={closeDrawer}>
                    <Ionicons name="close" size={18} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.drawerDivider} />

                {/* dashboard */}
                <DrawerItem
                    iconName="home-outline"
                    label="Dashboard"
                    onPress={() => closeDrawer()}
                />

                {/* announcements */}
                <DrawerItem
                    iconName="megaphone-outline"
                    label="Announcements"
                    onPress={() => drawerNavigate('/tenant/announcements')}
                />

                {/* documents — expandable submenu */}
                <TouchableOpacity
                    style={styles.drawerItem}
                    onPress={() => setDocumentsExpanded(!documentsExpanded)}
                >
                    <View style={styles.drawerItemLeft}>
                        <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                        <Text style={styles.drawerItemText}>Documents</Text>
                    </View>
                    <Ionicons
                        name={documentsExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={18}
                        color={COLORS.white}
                    />
                </TouchableOpacity>

                {/* documents submenu */}
                {documentsExpanded && (
                    <>
                        <TouchableOpacity
                            style={styles.drawerSubItem}
                            onPress={() => drawerNavigate('/tenant/documents')}
                        >
                            <Text style={styles.drawerSubItemText}>Document Request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.drawerSubItem}
                            onPress={() => drawerNavigate('/tenant/records')}
                        >
                            <Text style={styles.drawerSubItemText}>Tenant Records</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* maintenance */}
                <DrawerItem
                    iconName="build"
                    iconLib="MaterialIcons"
                    label="Maintenance"
                    onPress={() => drawerNavigate('/tenant/maintenance')}
                />

                {/* emergency */}
                <DrawerItem
                    iconName="warning-outline"
                    label="Emergency"
                    onPress={() => drawerNavigate('/tenant/emergency')}
                />

                {/* visitor */}
                <DrawerItem
                    iconName="people-outline"
                    label="Visitor"
                    onPress={() => drawerNavigate('/tenant/visitors')}
                />

                {/* billing */}
                <DrawerItem
                    iconName="receipt-outline"
                    label="Billing"
                    onPress={() => drawerNavigate('/tenant/water-bill')}
                />

                {/* settings */}
                <DrawerItem
                    iconName="settings-outline"
                    label="Settings"
                    onPress={() => drawerNavigate('/tenant/settings')}
                />

                <View style={styles.drawerDivider} />

                {/* logout */}
                <TouchableOpacity
                    style={styles.drawerLogout}
                    onPress={async () => {
                        closeDrawer();
                        await clearSession();
                        setTimeout(() => router.replace('/auth/login'), 260);
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                    <Text style={styles.drawerLogoutText}>Logout</Text>
                </TouchableOpacity>

            </Animated.View>

        </SafeAreaView>
    );
};

export default Dashboard;
