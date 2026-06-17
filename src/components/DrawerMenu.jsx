import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearSession, loadSession } from '../../api/auth';
import { COLORS } from '../constants/announcementsstyles';
import { useUser } from '../../src/context/UserContext';

const defaultPhoto = require('../../assets/def_icon.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── single drawer row ─────────────────────────────────────────────────────────
const DrawerItem = ({ iconName, iconLib = 'Ionicons', label, onPress, hasChevron = true }) => (
    <TouchableOpacity style={drawerStyles.drawerItem} onPress={onPress}>
        <View style={drawerStyles.drawerItemLeft}>
            {iconLib === 'MaterialIcons'
                ? <MaterialIcons name={iconName} size={20} color={COLORS.white} />
                : <Ionicons name={iconName} size={20} color={COLORS.white} />
            }
            <Text style={drawerStyles.drawerItemText}>{label}</Text>
        </View>
        {hasChevron && (
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        )}
    </TouchableOpacity>
);

// ── DrawerMenu ────────────────────────────────────────────────────────────────
const DrawerMenu = React.forwardRef((_props, ref) => {
    const router = useRouter();
    const { user, avatarUri } = useUser();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [documentsExpanded, setDocumentsExpanded] = useState(false);
    const drawerAnim = useRef(new Animated.Value(-400)).current;

    const [userData, setUserData] = useState({
        username: '',
        roomCode: '',
        profilePhoto: null,
    });

    useEffect(() => {
        const loadUser = async () => {
            const session = await loadSession();
            if (!session) return;
            const u = session.user;
            setUserData({
                username: '@' + (u.name?.replace(/\s+/g, '').toLowerCase() ?? ''),
                roomCode: u.room ? `R${u.room}-01` : '',
                profilePhoto: u.profile_photo ?? null,
            });
        };
        loadUser();
    }, []);

    const photoSource = avatarUri ? { uri: avatarUri } : defaultPhoto;

    const open = () => {
        setDrawerOpen(true);
        Animated.timing(drawerAnim, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
        }).start();
    };

    const close = () => {
        Animated.timing(drawerAnim, {
            toValue: -400,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setDrawerOpen(false));
    };

    const navigate = (route) => {
        close();
        setTimeout(() => router.push(route), 260);
    };

    React.useImperativeHandle(ref, () => ({ open, close }));

    return (
        <>
            {/* dark overlay — tap to close */}
            {drawerOpen && (
                <TouchableOpacity
                    style={drawerStyles.overlay}
                    activeOpacity={1}
                    onPress={close}
                />
            )}

            {/* sliding drawer panel */}
            <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: drawerAnim }] }]}>

                {/* user info */}
                <View style={drawerStyles.drawerTop}>
                    <Image source={photoSource} style={drawerStyles.avatar} />
                    <Text style={drawerStyles.drawerUsername}>{userData.username}</Text>
                    <Text style={drawerStyles.drawerRoom}>{userData.roomCode}</Text>
                </View>

                {/* close button */}
                <TouchableOpacity style={drawerStyles.drawerCloseBtn} onPress={close}>
                    <Ionicons name="close" size={18} color={COLORS.white} />
                </TouchableOpacity>

                <View style={drawerStyles.drawerDivider} />

                <DrawerItem
                    iconName="home-outline"
                    label="Dashboard"
                    onPress={() => navigate('/tenant/dashboard')}
                />

                <DrawerItem
                    iconName="megaphone-outline"
                    label="Announcements"
                    onPress={() => navigate('/tenant/announcements')}
                />

                {/* documents — expandable */}
                <TouchableOpacity
                    style={drawerStyles.drawerItem}
                    onPress={() => setDocumentsExpanded(!documentsExpanded)}
                >
                    <View style={drawerStyles.drawerItemLeft}>
                        <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
                        <Text style={drawerStyles.drawerItemText}>Documents</Text>
                    </View>
                    <Ionicons
                        name={documentsExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={18}
                        color={COLORS.white}
                    />
                </TouchableOpacity>

                {documentsExpanded && (
                    <>
                        <TouchableOpacity
                            style={drawerStyles.drawerSubItem}
                            onPress={() => navigate('/tenant/documents')}
                        >
                            <Text style={drawerStyles.drawerSubItemText}>Document Request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={drawerStyles.drawerSubItem}
                            onPress={() => navigate('/tenant/records')}
                        >
                            <Text style={drawerStyles.drawerSubItemText}>Tenant Records</Text>
                        </TouchableOpacity>
                    </>
                )}

                <DrawerItem
                    iconName="build"
                    iconLib="MaterialIcons"
                    label="Maintenance"
                    onPress={() => navigate('/tenant/maintenance')}
                />

                <DrawerItem
                    iconName="warning-outline"
                    label="Emergency"
                    onPress={() => navigate('/tenant/emergency')}
                />

                <DrawerItem
                    iconName="people-outline"
                    label="Visitor"
                    onPress={() => navigate('/tenant/visitors')}
                />

                <DrawerItem
                    iconName="receipt-outline"
                    label="Billing"
                    onPress={() => navigate('/tenant/water-bill')}
                />

                <DrawerItem
                    iconName="settings-outline"
                    label="Settings"
                    onPress={() => navigate('/tenant/settings')}
                />

                <View style={drawerStyles.drawerDivider} />

                {/* logout */}
                <TouchableOpacity
                    style={drawerStyles.drawerLogout}
                    onPress={async () => {
                        close();
                        await clearSession();
                        setTimeout(() => router.replace('/auth/login'), 260);
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                    <Text style={drawerStyles.drawerLogoutText}>Logout</Text>
                </TouchableOpacity>

            </Animated.View>
        </>
    );
});

// ── Drawer Styles (all inline — no dependency on announcementsstyles) ─────────
const drawerStyles = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 10,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SCREEN_WIDTH * 0.72,
        backgroundColor: COLORS.primary,
        zIndex: 20,
        paddingBottom: 30,
    },
    drawerTop: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    // avatar (was `drawerAvatar` in announcementsstyles)
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    drawerUsername: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
    },
    drawerRoom: {
        color: 'rgba(255,255,255,0.75)',
        fontSize: 12,
        marginTop: 2,
    },
    drawerCloseBtn: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    drawerDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    drawerItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        gap: 14,
    },
    drawerItemText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '500',
        flexShrink: 1,
    },
    drawerSubItem: {
        paddingLeft: 54,
        paddingVertical: 8,
    },
    drawerSubItemText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
    drawerLogout: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    drawerLogoutText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '500',
    },
};

export default DrawerMenu;