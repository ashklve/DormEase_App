import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { clearSession, loadSession } from '../../api/auth';
import styles, { COLORS } from '../constants/announcementsstyles';

const defaultPhoto = require('../../assets/def_icon.png');

// ── single drawer row ─────────────────────────────────────────────────────────
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

// ── DrawerMenu ────────────────────────────────────────────────────────────────
// Usage in any screen:
//
//   const drawerRef = useRef(null);
//
//   <DrawerMenu ref={drawerRef} />
//
//   // open from hamburger button:
//   <TouchableOpacity onPress={() => drawerRef.current?.open()}>
//     <MaterialIcons name="menu" size={24} color={COLORS.dark} />
//   </TouchableOpacity>
//
// The overlay and animated drawer are rendered as a fragment — place
// <DrawerMenu> at the BOTTOM of your SafeAreaView, after all other children,
// so it sits on top of everything.
// ─────────────────────────────────────────────────────────────────────────────
const DrawerMenu = React.forwardRef((_props, ref) => {
    const router = useRouter();

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

    const photoSource = userData.profilePhoto
        ? { uri: userData.profilePhoto }
        : defaultPhoto;

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

    // expose open() so parent screens can call drawerRef.current.open()
    React.useImperativeHandle(ref, () => ({ open, close }));

    return (
        <>
            {/* dark overlay — tap to close */}
            {drawerOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={close}
                />
            )}

            {/* sliding drawer panel */}
            <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>

                {/* user info */}
                <View style={styles.drawerTop}>
                    <Image source={photoSource} style={styles.drawerAvatar} />
                    <Text style={styles.drawerUsername}>{userData.username}</Text>
                    <Text style={styles.drawerRoom}>{userData.roomCode}</Text>
                </View>

                {/* close button */}
                <TouchableOpacity style={styles.drawerCloseBtn} onPress={close}>
                    <Ionicons name="close" size={18} color={COLORS.white} />
                </TouchableOpacity>

                <View style={styles.drawerDivider} />

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

                {documentsExpanded && (
                    <>
                        <TouchableOpacity
                            style={styles.drawerSubItem}
                            onPress={() => navigate('/tenant/documents')}
                        >
                            <Text style={styles.drawerSubItemText}>Document Request</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.drawerSubItem}
                            onPress={() => navigate('/tenant/records')}
                        >
                            <Text style={styles.drawerSubItemText}>Tenant Records</Text>
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

                <View style={styles.drawerDivider} />

                {/* logout */}
                <TouchableOpacity
                    style={styles.drawerLogout}
                    onPress={async () => {
                        close();
                        await clearSession();
                        setTimeout(() => router.replace('/auth/login'), 260);
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
                    <Text style={styles.drawerLogoutText}>Logout</Text>
                </TouchableOpacity>

            </Animated.View>
        </>
    );
});

export default DrawerMenu;