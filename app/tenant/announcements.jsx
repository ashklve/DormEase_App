import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import client from '../../api/client';
import NotificationBell from '../../src/components/NotificationBell';
import * as WebBrowser from 'expo-web-browser';
import { scale, verticalScale, moderateScale } from '../../src/utils/scale';
import { useUser } from '../../src/context/UserContext';
import { clearSession } from '../../api/auth';
import { dashboardCache } from '../../src/cache/dashboardCache.js';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];
const ANNOUNCEMENT_TABS = ['All', 'Unread', 'Pinned', 'Archive'];
const READ_STORAGE_KEY = 'tenant_read_announcements';
const ARCHIVED_STORAGE_KEY = 'tenant_archived_announcements';
const PINNED_STORAGE_KEY = 'tenant_pinned_announcements';

const priorityColors = {
  High: { bg: '#FFD7C7', text: '#EB9C7D' },
  Moderate: { bg: '#FFF3CD', text: '#D4A017' },
  Low: { bg: '#E5ECF6', text: '#B5B7C0' },
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MONTH_INDEX_BY_NAME = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6,
  aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9,
  october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

const parseAnnouncementDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dateText = String(value).trim();
  const normalized = dateText.replace(/\s+at\s+/i, ' ').replace(/[•·]/g, ' ').replace(/\s+/g, ' ');

  const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const monthNameMatch = normalized.match(
    /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?/i
  );
  if (monthNameMatch) {
    const [, monthName, day, year] = monthNameMatch;
    const d = new Date(Number(year || new Date().getFullYear()), MONTH_INDEX_BY_NAME[monthName.toLowerCase().replace('.', '')], Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dayMonthMatch = normalized.match(
    /^(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?(?:,?\s*(\d{4}))?/i
  );
  if (dayMonthMatch) {
    const [, day, monthName, year] = dayMonthMatch;
    const d = new Date(Number(year || new Date().getFullYear()), MONTH_INDEX_BY_NAME[monthName.toLowerCase().replace('.', '')], Number(day));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const numericMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (numericMatch) {
    const [, first, second, year] = numericMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const f = Number(first), s = Number(second);
    const month = f > 12 ? s : f;
    const day = f > 12 ? f : s;
    const d = new Date(Number(fullYear), month - 1, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getAnnouncementDate = (announcement) => {
  for (const field of [announcement?.created_at, announcement?.createdAt, announcement?.date, announcement?.updated_at]) {
    const d = parseAnnouncementDateValue(field);
    if (d) return d;
  }
  return null;
};

const getFilterReferenceDate = (announcements) => {
  const newest = announcements.reduce((acc, a) => {
    const d = getAnnouncementDate(a);
    if (!d) return acc;
    if (!acc || d > acc) return d;
    return acc;
  }, null);
  return newest || new Date();
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isInSelectedPeriod = (announcement, selectedFilter, referenceDate) => {
  if (selectedFilter === 'All Time') return true;
  const d = getAnnouncementDate(announcement);
  if (!d) return false;
  if (selectedFilter === 'Today') return isSameDay(d, referenceDate);
  if (selectedFilter === 'This Week') {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);
    start.setDate(referenceDate.getDate() - referenceDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return d >= start && d < end;
  }
  if (selectedFilter === 'This Month') {
    return d.getFullYear() === referenceDate.getFullYear() && d.getMonth() === referenceDate.getMonth();
  }
  return true;
};

const AnnouncementDetail = ({ item, visible, onClose }) => {
  const [imageRatio, setImageRatio] = useState(4 / 3);
  const insets = useSafeAreaInsets();
  if (!item) return null;

  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const attachments = item.attachments
    ? item.attachments.split(',').map((a) => a.trim()).filter(Boolean)
        .filter((path) => !IMAGE_EXTENSIONS.includes(path.split('.').pop().toLowerCase()))
    : [];

  const getFileName = (path) => path.split('/').pop();
  const openFile = async (path) => {
    const url = `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;
    const ext = path.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      await WebBrowser.openBrowserAsync(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`);
    } else {
      await WebBrowser.openBrowserAsync(url);
    }
  };
  const getFileIcon = (path) => {
    const ext = path.split('.').pop().toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) return { name: 'image-outline', color: '#4CAF50' };
    if (ext === 'pdf') return { name: 'document-text-outline', color: '#F44336' };
    if (['doc', 'docx'].includes(ext)) return { name: 'document-outline', color: '#2196F3' };
    if (['xls', 'xlsx'].includes(ext)) return { name: 'grid-outline', color: '#4CAF50' };
    return { name: 'attach-outline', color: '#CA5D86' };
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[detailStyles.modalRoot, { paddingTop: Math.max(insets.top + verticalScale(14), verticalScale(58)) }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={detailStyles.scrollContent}>
          <View style={detailStyles.header}>
            <TouchableOpacity onPress={onClose} style={detailStyles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#2D1B2E" />
            </TouchableOpacity>
            <View style={detailStyles.headerTitleGroup}>
              <View style={detailStyles.headerIconBadge}>
                <Ionicons name="megaphone-outline" size={18} color={COLORS.white} />
              </View>
              <Text style={detailStyles.headerTitle}>Announcement</Text>
            </View>
            <View style={detailStyles.headerSpacer} />
          </View>

          <View style={detailStyles.detailBody}>
            <View style={detailStyles.postHeader}>
              <View style={detailStyles.adminAvatar}>
                <MaterialIcons name="campaign" size={22} color="#fff" />
              </View>
              <View style={detailStyles.adminInfo}>
                <Text style={detailStyles.adminName}>DormEase Admin</Text>
                <View style={detailStyles.metaRow}>
                  <Ionicons name="time-outline" size={12} color="#B5B7C0" />
                  <Text style={detailStyles.metaText}>{item.date}</Text>
                  <View style={[detailStyles.priorityBadge, { backgroundColor: p.bg }]}>
                    <Text style={[detailStyles.priorityText, { color: p.text }]}>{item.priority}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View>
              <View style={detailStyles.titleSection}>
                <Text style={detailStyles.title}>{item.title}</Text>
              </View>
              <View style={detailStyles.contentSection}>
                <Text style={detailStyles.content}>{item.preview}</Text>
              </View>
            </View>

            {item.image ? (
              <View style={detailStyles.imageWrapper}>
                <Image
                  source={{ uri: item.image }}
                  style={{ width: '100%', aspectRatio: imageRatio }}
                  resizeMode="cover"
                  onLoad={(e) => {
                    const { width, height } = e.nativeEvent.source;
                    const ratio = width / height;
                    if (ratio >= 0.9 && ratio <= 1.1) setImageRatio(1);
                    else if (ratio >= 1.2) setImageRatio(4 / 3);
                    else setImageRatio(ratio);
                  }}
                />
              </View>
            ) : null}

            {attachments.length > 0 && <View style={detailStyles.divider} />}
            {attachments.length > 0 && (
              <View style={detailStyles.attachSection}>
                <View style={detailStyles.attachTitleRow}>
                  <Ionicons name="attach-outline" size={16} color={COLORS.primary} />
                  <Text style={detailStyles.attachTitle}>Attachments ({attachments.length})</Text>
                </View>
                {attachments.map((path, i) => {
                  const icon = getFileIcon(path);
                  return (
                    <TouchableOpacity key={i} style={detailStyles.attachItem} onPress={() => openFile(path)} activeOpacity={0.75}>
                      <View style={[detailStyles.attachIcon, { backgroundColor: icon.color + '20' }]}>
                        <Ionicons name={icon.name} size={20} color={icon.color} />
                      </View>
                      <View style={detailStyles.attachTextWrap}>
                        <Text style={detailStyles.attachName} numberOfLines={1}>{getFileName(path)}</Text>
                        <Text style={detailStyles.attachType}>{path.split('.').pop().toUpperCase()} - tap to open</Text>
                      </View>
                      <Ionicons name="open-outline" size={18} color="#B5B7C0" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const AnnouncementCard = ({ item, onPress }) => {
  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  return (
    // ── Wrapper View provides the positioning context for the floating menu ──
    <View style={{ position: 'relative' }}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
            <Text style={[styles.priorityText, { color: p.text }]}>{item.priority}</Text>
          </View>
          {isPinned && (
            <View style={styles.cardPinnedBadge}>
              <MaterialIcons name="push-pin" size={15} color={COLORS.primary} />
            </View>
          )}
          <View style={styles.dotsWrap}>
            <TouchableOpacity
              style={styles.dotsBtn}
              onPress={(event) => {
                event?.stopPropagation?.();
                onMenuPress(item);
              }}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <MaterialIcons name="more-horiz" size={26} color={COLORS.muted} />
            </TouchableOpacity>
            {!isRead && (
              <View style={styles.cardUnreadDot}>
                <Text style={styles.cardUnreadDotText}>!</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.dotsBtn}>
          <MaterialIcons name="more-horiz" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>
      {item.image && !imageError ? (
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={[styles.cardImage, { aspectRatio }]}
            resizeMode="cover"
            onError={() => setImageError(true)}
            onLoad={(e) => {
              const { width, height } = e.nativeEvent.source;
              const ratio = width / height;
              if (ratio >= 0.9 && ratio <= 1.1) setAspectRatio(1);
              else if (ratio >= 1.2) setAspectRatio(4 / 3);
              else setAspectRatio(ratio);
            }}
          />
          <Text style={styles.cardImageCaption}>{item.title}</Text>
        </View>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <View style={detailStyles.readMoreRow}>
        <Text style={detailStyles.readMoreText}>Tap to read full announcement</Text>
        <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
};

const NavItem = ({ iconName, label, isActive, isCenter, onPress }) => (
  <TouchableOpacity style={[styles.navItem, isCenter && styles.navCenter]} onPress={onPress}>
    {isCenter ? (
      <View style={styles.navCenterCircle}>
        <MaterialIcons name={iconName} size={26} color={COLORS.white} />
      </View>
    ) : (
      <>
        <MaterialIcons name={iconName} size={24} color={isActive ? COLORS.primary : COLORS.grayText} />
        <Text style={[styles.navLabel, isActive && { color: COLORS.primary }]}>{label}</Text>
      </>
    )}
  </TouchableOpacity>
);

const DrawerItem = ({ iconName, iconLib = 'Ionicons', label, onPress, hasChevron = true }) => (
  <TouchableOpacity style={styles.drawerItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.drawerItemLeft}>
      {iconLib === 'MaterialIcons'
        ? <MaterialIcons name={iconName} size={20} color={COLORS.white} />
        : <Ionicons name={iconName} size={20} color={COLORS.white} />
      }
      <Text style={styles.drawerItemText}>{label}</Text>
    </View>
    {hasChevron && <Ionicons name="chevron-forward" size={18} color={COLORS.white} />}
  </TouchableOpacity>
);

export default function AnnouncementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, avatarUri } = useUser();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-400)).current;

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnim, { toValue: -400, duration: 250, useNativeDriver: true })
      .start(() => setDrawerOpen(false));
  };
  const drawerNavigate = (route) => { closeDrawer(); router.push(route); };

  const username = user
    ? '@' + `${user.first_name ?? ''}${user.last_name ?? ''}`.replace(/\s+/g, '').toLowerCase()
    : '';
  const roomCode = user?.room_number ? `R${user.room_number}-01` : '';
  const photoSource = avatarUri ? { uri: avatarUri } : require('../../assets/def_icon.png');

  const [activeTab, setActiveTab] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => { fetchAnnouncements(); }, []);

  useEffect(() => {
    const loadAnnouncementPreferences = async () => {
      try {
        const [storedReadIds, storedArchivedIds, storedPinnedIds] = await Promise.all([
          AsyncStorage.getItem(READ_STORAGE_KEY),
          AsyncStorage.getItem(ARCHIVED_STORAGE_KEY),
          AsyncStorage.getItem(PINNED_STORAGE_KEY),
        ]);
        setReadAnnouncementIds(parseStoredAnnouncementIds(storedReadIds));
        setArchivedAnnouncementIds(parseStoredAnnouncementIds(storedArchivedIds));
        setPinnedAnnouncementIds(parseStoredAnnouncementIds(storedPinnedIds));
      } catch (error) {
        console.error('announcement preferences error:', error);
      }
    };
    loadAnnouncementPreferences();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await client.get('/announcements', { timeout: 15000 });
      setAnnouncements(res.data);
    } catch (error) {
      console.error('announcements error:', error.message);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await client.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openDetail = (item) => { setSelectedItem(item); setShowDetail(true); };

  const periodFilteredAnnouncements = useMemo(() => {
    const referenceDate = getFilterReferenceDate(announcements);
    return announcements.filter((a) => isInSelectedPeriod(a, selectedFilter, referenceDate));
  }, [announcements, selectedFilter]);

  const visibleAnnouncements = useMemo(() => {
    if (activeTab === 'Unread') return periodFilteredAnnouncements.filter((a) => !a.read);
    if (activeTab === 'Pinned') return periodFilteredAnnouncements.filter((a) => a.pinned);
    return periodFilteredAnnouncements;
  }, [activeTab, periodFilteredAnnouncements]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
      onTouchStart={() => {
        if (actionMenuItem) setActionMenuItem(null);
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 24), gap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
          }
        >
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={openDrawer}>
              <MaterialIcons name="menu" size={24} color={COLORS.dark} />
            </TouchableOpacity>
            <View style={styles.topRowRight}>
              <NotificationBell style={styles.iconBtn} iconColor={COLORS.dark} />
              <TouchableOpacity onPress={() => router.push('/tenant/profile')}>
                <Image source={photoSource} style={styles.avatar} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.headerSection}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBadge}>
                <Ionicons name="megaphone-outline" size={20} color={COLORS.white} />
              </View>
              <Text style={styles.headerTitle}>Announcements</Text>
            </View>
            <Text style={styles.headerSub}>View notices and announcements</Text>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="options-outline" size={16} color="#fff" />
              <Text style={styles.filterBtnText}>Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.weekBtn} onPress={() => setShowDropdown(true)}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.dark} />
              <Text style={styles.weekBtnText}>{selectedFilter}</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            {['All', 'Unread', 'Pinned'].map((tab) => (
              <TouchableOpacity key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab} {tabCounts[tab]}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {visibleAnnouncements.length === 0 ? (
              <Text style={styles.emptyText}>No announcements here.</Text>
            ) : (
              visibleAnnouncements.map((item) => (
                <AnnouncementCard key={item.id} item={item} onPress={() => openDetail(item)} />
              ))
            )}
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
        <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
        <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
        <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
      </View>

      <Modal visible={showDropdown} transparent animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownBox}>
                <Text style={styles.dropdownTitle}>Filter by period</Text>
                {FILTER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.dropdownItem,
                      selectedFilter === option && styles.dropdownItemActive,
                    ]}
                    onPress={() => { setSelectedFilter(option); setShowDropdown(false); }}
                  >
                    <Text style={[styles.dropdownItemText, selectedFilter === option && styles.dropdownItemTextActive]}>{option}</Text>
                    {selectedFilter === option && <MaterialIcons name="check" size={18} color={COLORS.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AnnouncementDetail item={selectedItem} visible={showDetail} onClose={() => setShowDetail(false)} />

      {drawerOpen && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDrawer} />
      )}

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={styles.drawerTop}>
          <Image source={photoSource} style={styles.drawerAvatar} />
          <Text style={styles.drawerUsername}>{username}</Text>
          <Text style={styles.drawerRoom}>{roomCode}</Text>
        </View>

        <TouchableOpacity style={styles.drawerCloseBtn} onPress={closeDrawer}>
          <Ionicons name="close" size={18} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.drawerDivider} />

        <DrawerItem iconName="home-outline" label="Dashboard" onPress={() => drawerNavigate('/tenant/dashboard')} />
        <DrawerItem iconName="megaphone-outline" label="Announcements" onPress={() => drawerNavigate('/tenant/announcements')} />

        <TouchableOpacity style={styles.drawerItem} onPress={() => setDocumentsExpanded(!documentsExpanded)} activeOpacity={0.7}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Documents</Text>
          </View>
          <Ionicons name={documentsExpanded ? 'chevron-down' : 'chevron-forward'} size={18} color={COLORS.white} />
        </TouchableOpacity>
        {documentsExpanded && (
          <>
            <TouchableOpacity style={styles.drawerSubItem} onPress={() => drawerNavigate('/tenant/documents')}>
              <Text style={styles.drawerSubItemText}>Document Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerSubItem} onPress={() => drawerNavigate('/tenant/records')}>
              <Text style={styles.drawerSubItemText}>Tenant Records</Text>
            </TouchableOpacity>
          </>
        )}

        <DrawerItem iconName="build" iconLib="MaterialIcons" label="Maintenance" onPress={() => drawerNavigate('/tenant/maintenance')} />
        <DrawerItem iconName="warning-outline" label="Emergency" onPress={() => drawerNavigate('/tenant/emergency')} />
        <DrawerItem iconName="people-outline" label="Visitor" onPress={() => drawerNavigate('/tenant/visitors')} />
        <DrawerItem iconName="receipt-outline" label="Billing" onPress={() => drawerNavigate('/tenant/water-bill')} />
        <DrawerItem iconName="settings-outline" label="Settings" onPress={() => drawerNavigate('/tenant/settings')} />

        <View style={styles.drawerDivider} />

        <TouchableOpacity
          style={styles.drawerLogout}
          onPress={async () => {
            closeDrawer();
            dashboardCache.loaded = false;
            dashboardCache.announcements = [];
            dashboardCache.currentBill = '0.00';
            dashboardCache.pendingRequests = 0;
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
}

};
