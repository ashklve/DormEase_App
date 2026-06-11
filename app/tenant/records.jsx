import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    ActivityIndicator,
    RefreshControl,
    Linking,
    Alert,
    Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../../src/context/UserContext';
import NotificationBell from '../../src/components/NotificationBell';
import DrawerMenu from '../../src/components/DrawerMenu';
import styles, { COLORS } from '../../src/constants/recordsstyles';
import client from '../../api/client';

const defaultPhoto = require('../../assets/def_icon.png');

const STATUS_CONFIG = {
    pending: { label: 'Pending', color: COLORS.warning, bg: COLORS.warningLight, icon: 'schedule' },
    processing: { label: 'Processing', color: COLORS.info, bg: COLORS.infoLight, icon: 'autorenew' },
    approved: { label: 'Approved', color: COLORS.success, bg: COLORS.successLight, icon: 'check-circle' },
    ready: { label: 'Ready', color: COLORS.ready, bg: COLORS.readyLight, icon: 'inventory' },
    denied: { label: 'Denied', color: COLORS.denied, bg: COLORS.deniedLight, icon: 'cancel' },
};

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'approved', label: 'Approved' },
    { key: 'ready', label: 'Ready' },
    { key: 'denied', label: 'Denied' },
];

const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// nav item
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
                <MaterialIcons name={iconName} size={24} color={isActive ? COLORS.primary : COLORS.muted} />
                <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>{label}</Text>
            </>
        )}
    </TouchableOpacity>
);

// status badge
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
            <MaterialIcons name={cfg.icon} size={12} color={cfg.color} />
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
    );
};

// record card
const RecordCard = ({ item, index }) => {
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 300, delay: index * 60, useNativeDriver: true }),
        ]).start();
    }, []);

    const openFile = async (path) => {
        try {
            await Linking.openURL(`${client.defaults.baseURL.replace('/api', '')}/storage/${path}`);
        } catch {
            Alert.alert('Error', 'Could not open file. Please try again.');
        }
    };

    const hasFulfilled = !!item.fulfilled_file;
    const hasAttachment = !!item.attachment;
    const isDownloadableForm = item.category === 'form';

    return (
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={styles.recordCard}>

                {/* accent bar — green if fulfilled, pink if not */}
                <View style={[styles.accentBar, { backgroundColor: hasFulfilled ? COLORS.success : COLORS.primary }]} />

                <View style={styles.cardBody}>

                    {/* header */}
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderLeft}>
                            <View style={styles.reqIdRow}>
                                <Text style={styles.reqId}>
                                    #DRQ-{String(item.doc_request_id).padStart(3, '0')}
                                </Text>
                                {isDownloadableForm && (
                                    <View style={styles.categoryTag}>
                                        <MaterialIcons name="download" size={10} color={COLORS.info} />
                                        <Text style={styles.categoryTagText}>Form</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.docType} numberOfLines={2}>
                                {item.document_type}
                            </Text>
                        </View>
                        <StatusBadge status={item.status} />
                    </View>

                    {/* meta */}
                    {!!item.purpose && (
                        <View style={styles.metaRow}>
                            <MaterialIcons name="notes" size={13} color={COLORS.muted} />
                            <Text style={[styles.metaText, { flex: 1 }]} numberOfLines={2}>
                                {item.purpose}
                            </Text>
                        </View>
                    )}
                    <View style={styles.metaGroup}>
                        <View style={styles.metaRow}>
                            <MaterialIcons name="event" size={12} color={COLORS.muted} />
                            <Text style={styles.metaText}>Submitted {fmtDate(item.submitted_at)}</Text>
                        </View>
                        {!!item.delivery_type && (
                            <View style={styles.metaRow}>
                                <MaterialIcons
                                    name={item.delivery_type === 'digital' ? 'phone-android' : 'print'}
                                    size={12}
                                    color={COLORS.muted}
                                />
                                <Text style={[styles.metaText, { textTransform: 'capitalize' }]}>
                                    {item.delivery_type}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* admin remarks */}
                    {!!item.admin_remarks && (
                        <View style={styles.remarksBox}>
                            <View style={styles.remarksHeader}>
                                <MaterialIcons name="admin-panel-settings" size={11} color={COLORS.warning} />
                                <Text style={styles.remarksLabel}>Admin Remarks</Text>
                            </View>
                            <Text style={styles.remarksText}>{item.admin_remarks}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* fulfilled document from admin */}
                    {hasFulfilled ? (
                        <TouchableOpacity
                            style={[styles.fileBtn, { backgroundColor: COLORS.successLight }]}
                            activeOpacity={0.75}
                            onPress={() => openFile(item.fulfilled_file)}
                        >
                            <View style={[styles.fileBtnIcon, { backgroundColor: COLORS.success }]}>
                                <MaterialIcons name="description" size={18} color={COLORS.white} />
                            </View>
                            <View style={styles.fileBtnTextWrap}>
                                <Text style={[styles.fileBtnTitle, { color: '#065F46' }]}>Document Ready</Text>
                                <Text style={[styles.fileBtnSub, { color: '#059669' }]}>Tap to view fulfilled document</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={COLORS.success} />
                        </TouchableOpacity>
                    ) : !isDownloadableForm && (
                        /* only show "awaiting" placeholder for certificate requests, not downloadable forms */
                        <View style={[styles.fileBtn, { backgroundColor: '#F3F4F6', marginBottom: 0 }]}>
                            <View style={[styles.fileBtnIcon, { backgroundColor: '#E5E7EB' }]}>
                                <MaterialIcons name="hourglass-empty" size={18} color={COLORS.muted} />
                            </View>
                            <View style={styles.fileBtnTextWrap}>
                                <Text style={[styles.fileBtnTitle, { color: COLORS.muted }]}>Awaiting Document</Text>
                                <Text style={[styles.fileBtnSub, { color: COLORS.muted }]}>Admin hasn't sent a file yet</Text>
                            </View>
                        </View>
                    )}

                    {/* tenant's own uploaded attachment */}
                    {hasAttachment && (
                        <TouchableOpacity
                            style={[styles.fileBtn, { backgroundColor: COLORS.primaryLight, marginBottom: 0, marginTop: 8 }]}
                            activeOpacity={0.75}
                            onPress={() => openFile(item.attachment)}
                        >
                            <View style={[styles.fileBtnIcon, { backgroundColor: COLORS.primary }]}>
                                <MaterialIcons name="attach-file" size={18} color={COLORS.white} />
                            </View>
                            <View style={styles.fileBtnTextWrap}>
                                <Text style={[styles.fileBtnTitle, { color: COLORS.primary }]}>Your Submitted Form</Text>
                                <Text style={[styles.fileBtnSub, { color: '#BE185D' }]}>Tap to view your uploaded file</Text>
                            </View>
                            <MaterialIcons name="open-in-new" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    )}

                </View>
            </View>
        </Animated.View>
    );
};

// empty state
const EmptyState = () => (
    <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
            <MaterialIcons name="folder-open" size={34} color={COLORS.primaryLight} />
        </View>
        <Text style={styles.emptyTitle}>No Records Yet</Text>
        <Text style={styles.emptyText}>
            Your document requests and received files will appear here once you submit a request.
        </Text>
    </View>
);

// main screen
export default function TenantRecordsScreen() {
    const router = useRouter();
    const { avatarUri } = useUser();
    const insets = useSafeAreaInsets();
    const drawerRef = useRef(null);

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchRecords = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const res = await client.get('/document-requests');
            const data = res.data;
            setRecords(data.data ?? data);
        } catch {
            Alert.alert('Error', 'Could not load your records. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const filtered = activeFilter === 'all'
        ? records
        : records.filter(r => r.status === activeFilter);

    const fulfilledCount = records.filter(r => r.fulfilled_file).length;
    const pendingCount = records.filter(r => r.status === 'pending').length;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            {/* top row */}
            <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => drawerRef.current?.open()}>
                    <MaterialIcons name="menu" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
                    <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : defaultPhoto}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* page header */}
            <View style={styles.headerSection}>
                <View style={styles.headerTitleRow}>
                    <View style={styles.headerIconBadge}>
                        <Ionicons name="folder-open-outline" size={20} color={COLORS.white} />
                    </View>
                    <Text style={styles.headerTitle}>My Records</Text>
                </View>
                <Text style={styles.headerSub}>Your document request history & received files</Text>
            </View>

            {/* stats */}
            {!loading && records.length > 0 && (
                <View style={styles.statsRow}>
                    {[
                        { label: 'Total Requests', value: records.length, color: COLORS.primary },
                        { label: 'Docs Received', value: fulfilledCount, color: COLORS.success },
                        { label: 'Pending', value: pendingCount, color: COLORS.warning },
                    ].map(s => (
                        <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* filter chips with counts */}
            {!loading && records.length > 0 && (
                <View style={{ height: 44, marginBottom: 8 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            alignItems: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        {FILTERS.map(f => {
                            const count = f.key === 'all'
                                ? records.length
                                : records.filter(r => r.status === f.key).length;
                            const isActive = activeFilter === f.key;
                            return (
                                <TouchableOpacity
                                    key={f.key}
                                    onPress={() => setActiveFilter(f.key)}
                                    activeOpacity={0.75}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: isActive ? COLORS.primary : COLORS.card,
                                            borderColor: isActive ? COLORS.primary : COLORS.border,
                                        },
                                    ]}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        { color: isActive ? COLORS.white : COLORS.dark },
                                    ]}>
                                        {f.label}
                                    </Text>
                                    {count > 0 && (
                                        <View style={[
                                            styles.filterChipCount,
                                            {
                                                backgroundColor: isActive
                                                    ? 'rgba(255,255,255,0.25)'
                                                    : COLORS.primaryLight,
                                            },
                                        ]}>
                                            <Text style={[
                                                styles.filterChipCountText,
                                                { color: isActive ? COLORS.white : COLORS.primary },
                                            ]}>
                                                {count}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* body */}
            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 12 }}>
                        Loading your records...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 120 + Math.max(insets.bottom, 24) },
                        filtered.length === 0 && { flex: 1 },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchRecords(true)}
                            colors={[COLORS.primary]}
                            tintColor={COLORS.primary}
                        />
                    }
                >
                    {filtered.length === 0 ? (
                        <EmptyState />
                    ) : (
                        filtered.map((item, index) => (
                            <RecordCard key={item.doc_request_id} item={item} index={index} />
                        ))
                    )}
                </ScrollView>
            )}

            {/* bottom nav */}
            <View style={[
                styles.bottomNav,
                { paddingBottom: Math.max(insets.bottom, 24) },
            ]}>
                <NavItem
                    iconName="home"
                    label="Home"
                    isActive={false}
                    onPress={() => router.push('/tenant/dashboard')}
                />
                <NavItem
                    iconName="person-outline"
                    label="Visitor"
                    isActive={false}
                    onPress={() => router.push('/tenant/visitors')}
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
                    isActive={false}
                    onPress={() => router.push('/tenant/water-bill')}
                />
                <NavItem
                    iconName="account-circle"
                    label="Profile"
                    isActive={false}
                    onPress={() => router.push('/tenant/profile')}
                />
            </View>

            <DrawerMenu ref={drawerRef} />
        </SafeAreaView>
    );
}