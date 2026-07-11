import { View, Text, ScrollView, TouchableOpacity, StatusBar, Linking, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import NotificationBell from '../../src/components/NotificationBell';
import BottomNavigation from '../../src/components/BottomNavigation';
import { useUser } from '../../src/context/UserContext';

const defaultPhoto = require('../../assets/def_icon.png');

const HOTLINES = [
    {
        category: 'National',
        items: [
            { label: 'National Emergency Hotline', number: '911', icon: 'warning' },
        ],
    },
    {
        category: 'Rescue & Police',
        items: [
            { label: 'Manila Rescue', number: '8927-1335', icon: 'local-hospital' },
            { label: 'Manila Rescue (Alt)', number: '8978-5312', icon: 'local-hospital' },
            { label: 'PNP', number: '117', icon: 'security' },
            { label: 'PNP (Landline)', number: '8722-0650', icon: 'security' },
        ],
    },
    {
        category: 'Fire & Disaster',
        items: [
            { label: 'Bureau of Fire Protection', number: '8426-0219', icon: 'local-fire-department' },
            { label: 'Bureau of Fire Protection (Alt)', number: '8426-0246', icon: 'local-fire-department' },
            { label: 'NDRRMC', number: '8911-5061', icon: 'crisis-alert' },
        ],
    },
    {
        category: 'Medical',
        items: [
            { label: 'Philippine Red Cross', number: '143', icon: 'favorite' },
            { label: 'Philippine Red Cross (Landline)', number: '8527-8385', icon: 'favorite' },
        ],
    },
    {
        category: 'Other Agencies',
        items: [
            { label: 'MMDA', number: '136', icon: 'traffic' },
            { label: 'PAGASA', number: '8027-1541', icon: 'cloud' },
            { label: 'PAGASA (Alt)', number: '8926-4251', icon: 'cloud' },
        ],
    },
];


export default function HotlinesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { avatarUri } = useUser();

    const photoSource = avatarUri ? { uri: avatarUri } : defaultPhoto;

    const call = (number) => {
        const cleaned = number.replace(/[^0-9]/g, '');
        Linking.openURL(`tel:${cleaned}`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <View style={styles.topRow}>
                <TouchableOpacity
                    style={[styles.backBtn, {
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: COLORS.white,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 3,
                        elevation: 2,
                    }]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="chevron-left" size={26} color={COLORS.dark} />
                </TouchableOpacity>
                <View style={styles.topRowRight}>
                    <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
                    <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                        <Image source={photoSource} style={styles.avatar} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.dark }}>
                    Emergency Hotlines 📞
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 }}>
                    Tap any number to call directly
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                    * Add 8 before landline numbers when calling within NCR
                </Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 120 + Math.max(insets.bottom, 24),
                }}
            >
                {HOTLINES.map((section) => (
                    <View key={section.category} style={{ marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: COLORS.muted,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            marginBottom: 8,
                            paddingLeft: 4,
                        }}>
                            {section.category}
                        </Text>
                        <View style={{
                            backgroundColor: COLORS.white,
                            borderRadius: 14,
                            overflow: 'hidden',
                        }}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={item.number}
                                    onPress={() => call(item.number)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 14,
                                        borderBottomWidth: index < section.items.length - 1 ? 0.5 : 0,
                                        borderBottomColor: '#F0F0F0',
                                    }}
                                >
                                    <View style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 10,
                                        backgroundColor: COLORS.lightPink,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 12,
                                    }}>
                                        <MaterialIcons name={item.icon} size={20} color={COLORS.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 13, color: COLORS.grayText }}>{item.label}</Text>
                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.dark, marginTop: 1 }}>
                                            {item.number}
                                        </Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: COLORS.primary,
                                        borderRadius: 8,
                                        padding: 8,
                                    }}>
                                        <MaterialIcons name="call" size={18} color={COLORS.white} />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <BottomNavigation activeTab="none" />
        </SafeAreaView>
    );
}