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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import client from '../../api/client';
import NotificationBell from '../../src/components/NotificationBell';
import * as WebBrowser from 'expo-web-browser';
import { scale, verticalScale, moderateScale } from '../../src/utils/scale';
import { useUser } from '../../src/context/UserContext';
import DrawerMenu from '../../src/components/DrawerMenu';
import PremiumPullToRefresh from '../../src/components/PremiumPullToRefresh';
import LoadingOverlay from '../../src/components/LoadingOverlay';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];
const ANNOUNCEMENT_TABS = ['All', 'Unread', 'Pinned', 'Archive'];
const READ_STORAGE_KEY = 'tenant_read_announcements';
const ARCHIVED_STORAGE_KEY = 'tenant_archived_announcements';
const PINNED_STORAGE_KEY = 'tenant_pinned_announcements';

const priorityColors = {
  High:     { bg: '#FFD7C7', text: '#EB9C7D' },
  Moderate: { bg: '#FFF3CD', text: '#D4A017' },
  Low:      { bg: '#E5ECF6', text: '#B5B7C0' },
};

// Lower rank = shown first. Unknown/missing priority falls back to "Low".
const PRIORITY_SORT_ORDER = { High: 0, Moderate: 1, Low: 2 };
const getPriorityRank = (announcement) =>
  PRIORITY_SORT_ORDER[announcement?.priority] ?? PRIORITY_SORT_ORDER.Low;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MONTH_INDEX_BY_NAME = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const parseAnnouncementDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const timestampDate = new Date(value);
    return Number.isNaN(timestampDate.getTime()) ? null : timestampDate;
  }

  const dateText = String(value).trim();
  const normalizedDateText = dateText
    .replace(/\s+at\s+/i, ' ')
    .replace(/[•·]/g, ' ')
    .replace(/\s+/g, ' ');

  const isoDateMatch = normalizedDateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const isoDate = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }

  const monthNameMatch = normalizedDateText.match(
    /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2})(?:,\s*(\d{4}))?/i
  );
  if (monthNameMatch) {
    const [, monthName, day, year] = monthNameMatch;
    const fallbackYear = year || String(new Date().getFullYear());
    const monthDate = new Date(
      Number(fallbackYear),
      MONTH_INDEX_BY_NAME[monthName.toLowerCase().replace('.', '')],
      Number(day)
    );
    return Number.isNaN(monthDate.getTime()) ? null : monthDate;
  }

  const dayMonthNameMatch = normalizedDateText.match(
    /^(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?(?:,?\s*(\d{4}))?/i
  );
  if (dayMonthNameMatch) {
    const [, day, monthName, year] = dayMonthNameMatch;
    const fallbackYear = year || String(new Date().getFullYear());
    const dayMonthDate = new Date(
      Number(fallbackYear),
      MONTH_INDEX_BY_NAME[monthName.toLowerCase().replace('.', '')],
      Number(day)
    );
    return Number.isNaN(dayMonthDate.getTime()) ? null : dayMonthDate;
  }

  const numericDateMatch = normalizedDateText.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (numericDateMatch) {
    const [, first, second, year] = numericDateMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    const firstNumber = Number(first);
    const secondNumber = Number(second);
    const month = firstNumber > 12 ? secondNumber : firstNumber;
    const day = firstNumber > 12 ? firstNumber : secondNumber;
    const numericDate = new Date(Number(fullYear), month - 1, day);
    return Number.isNaN(numericDate.getTime()) ? null : numericDate;
  }

  const parsedDate = new Date(normalizedDateText);
  if (!Number.isNaN(parsedDate.getTime())) return parsedDate;

  return null;
};

const getAnnouncementDate = (announcement) => {
  const dateFields = [
    announcement?.created_at,
    announcement?.createdAt,
    announcement?.date,
    announcement?.updated_at,
  ];
  for (const dateField of dateFields) {
    const parsedDate = parseAnnouncementDateValue(dateField);
    if (parsedDate) return parsedDate;
  }
  return null;
};

const getFilterReferenceDate = (announcements) => {
  const newestAnnouncementDate = announcements.reduce((newestDate, announcement) => {
    const announcementDate = getAnnouncementDate(announcement);
    if (!announcementDate) return newestDate;
    if (!newestDate || announcementDate > newestDate) return announcementDate;
    return newestDate;
  }, null);
  return newestAnnouncementDate || new Date();
};

const isSameDay = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isInSelectedPeriod = (announcement, selectedFilter, referenceDate) => {
  if (selectedFilter === 'All Time') return true;

  const announcementDate = getAnnouncementDate(announcement);
  if (!announcementDate) return false;

  if (selectedFilter === 'Today') {
    return isSameDay(announcementDate, referenceDate);
  }

  if (selectedFilter === 'This Week') {
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    return announcementDate >= startOfWeek && announcementDate < endOfWeek;
  }

  if (selectedFilter === 'This Month') {
    return (
      announcementDate.getFullYear() === referenceDate.getFullYear() &&
      announcementDate.getMonth() === referenceDate.getMonth()
    );
  }

  return true;
};

const getAnnouncementKey = (announcement) =>
  String(
    announcement?.id ??
    announcement?.announcement_id ??
    announcement?.title ??
    announcement?.created_at ??
    announcement?.date
  );

const parseStoredAnnouncementIds = (storedIds) => {
  if (!storedIds) return [];
  try {
    const parsedIds = JSON.parse(storedIds);
    return Array.isArray(parsedIds) ? parsedIds.map(String) : [];
  } catch {
    return [];
  }
};

const priorityStyles = {
  High: { bg: '#FFF5F5', text: '#E53E3E', border: '#FEB2B2', icon: 'error-outline' },
  Moderate: { bg: '#FFFDF5', text: '#D69E2E', border: '#FEEBC8', icon: 'warning-amber' },
  Low: { bg: '#F0FDF4', text: '#15803D', border: '#DCFCE7', icon: 'info-outline' },
};

const ImageLightbox = ({ visible, imageUri, onClose }) => {
  if (!imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.lightboxContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        {/* Close Button */}
        <TouchableOpacity style={styles.lightboxCloseBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Scrollable Zoom Container */}
        <ScrollView
          contentContainerStyle={styles.lightboxScrollContainer}
          maximumZoomScale={3}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const AnnouncementDetail = ({ item, visible, onClose }) => {
  const [imageRatio, setImageRatio] = useState(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const insets = useSafeAreaInsets();

  if (!item) return null;

  const p = priorityStyles[item.priority] || priorityStyles.Low;

  const attachments = item.attachments
    ? item.attachments
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean)
        .filter((path) => {
          const ext = path.split('.').pop().toLowerCase();
          return !IMAGE_EXTENSIONS.includes(ext);
        })
    : [];

  const getFileName = (path) => path.split('/').pop();

  const openFile = async (path) => {
    const url = `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;
    const ext = path.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      await WebBrowser.openBrowserAsync(
        `https://docs.google.com/viewer?url=${encodeURIComponent(url)}`
      );
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

  const wordCount = item.preview ? item.preview.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalRoot} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          {/* ── Header ── */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
              <MaterialIcons name="chevron-left" size={22} color={COLORS.dark} />
            </TouchableOpacity>
            <View style={styles.modalHeaderTitleGroup}>
              <View style={styles.modalHeaderIconBadge}>
                <Ionicons name="megaphone" size={16} color={COLORS.white} />
              </View>
              <Text style={styles.modalHeaderTitle}>Announcement Details</Text>
            </View>
            <View style={styles.modalHeaderSpacer} />
          </View>
          <View style={styles.modalDetailBody}>
            {/* ── Admin Badge Section ── */}
            <View style={styles.modalPostHeader}>
              <View style={styles.modalAdminAvatar}>
                <Ionicons name="shield-checkmark" size={22} color={COLORS.white} />
              </View>
              <View style={styles.modalAdminInfo}>
                <View style={styles.modalAdminNameRow}>
                  <Text style={styles.modalAdminName}>DormEase Admin</Text>
                  <MaterialIcons name="verified" size={15} color={COLORS.primary} style={styles.modalVerifiedIcon} />
                </View>
                <View style={styles.modalMetaRow}>
                  <Ionicons name="calendar-outline" size={11} color={COLORS.muted} />
                  <Text style={styles.modalMetaText}>{item.date}</Text>
                  <View style={styles.modalMetaDivider} />
                  <View style={[styles.modalPriorityBadge, { backgroundColor: p.bg, borderColor: p.border }]}>
                    <MaterialIcons name={p.icon} size={11} color={p.text} />
                    <Text style={[styles.modalPriorityText, { color: p.text }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Title & Read Time Section ── */}
            <View style={styles.modalTitleSection}>
              <Text style={styles.modalTitle}>{item.title}</Text>
              <View style={styles.modalReadTimeRow}>
                <Ionicons name="book-outline" size={13} color={COLORS.muted} />
                <Text style={styles.modalReadTimeText}>{readTime} min read</Text>
              </View>
            </View>

            {/* ── Main content text ── */}
            <View style={styles.modalContentSection}>
              <Text style={styles.modalContent}>{item.preview}</Text>
            </View>

            {/* ── Cover Image ── */}
            {item.image ? (
              <TouchableOpacity
                style={styles.modalImageWrapper}
                onPress={() => setLightboxVisible(true)}
                activeOpacity={0.95}
              >
                <Image
                  source={{ uri: item.image }}
                  style={[
                    styles.modalImage,
                    imageRatio ? { aspectRatio: imageRatio } : { height: 220 },
                  ]}
                  resizeMode="cover"
                  onLoad={(e) => {
                    const { width, height } = e.nativeEvent.source;
                    if (width && height) setImageRatio(width / height);
                  }}
                  onError={() => console.log('image failed:', item.image)}
                />
              </TouchableOpacity>
            ) : null}

            {attachments.length > 0 && <View style={styles.modalDivider} />}

            {/* ── Attachments cards ── */}
            {attachments.length > 0 && (
              <View style={styles.modalAttachSection}>
                <View style={styles.modalAttachTitleRow}>
                  <Ionicons name="folder-open-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.modalAttachTitle}>
                    Attachments ({attachments.length})
                  </Text>
                </View>
                {attachments.map((path, i) => {
                  const icon = getFileIcon(path);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.modalAttachItem}
                      onPress={() => openFile(path)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.modalAttachIcon, { backgroundColor: icon.color + '15' }]}>
                        <Ionicons name={icon.name} size={22} color={icon.color} />
                      </View>
                      <View style={styles.modalAttachTextWrap}>
                        <Text style={styles.modalAttachName} numberOfLines={1}>
                          {getFileName(path)}
                        </Text>
                        <Text style={styles.modalAttachType}>
                          {path.split('.').pop().toUpperCase()} • tap to open
                        </Text>
                      </View>
                      <View style={styles.modalAttachActionBtn}>
                        <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      <ImageLightbox
        visible={lightboxVisible}
        imageUri={item.image}
        onClose={() => setLightboxVisible(false)}
      />
    </Modal>
  );
};

const AnnouncementCard = ({
  item,
  onPress,
  isRead,
  isPinned,
  isArchived,
  isMenuOpen,
  onMenuPress,
  onMarkAsRead,
  onTogglePin,
  onArchive,
  onUnarchive,
}) => {
  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);

  return (
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

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>

        {item.image && !imageError ? (
          <View style={styles.cardImageWrapper}>
            <Image
              source={{ uri: item.image }}
              style={[
                styles.cardImage,
                aspectRatio ? { aspectRatio } : { height: 180 },
              ]}
              resizeMode="cover"
              onError={() => setImageError(true)}
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                if (width && height) setAspectRatio(width / height);
              }}
            />
            <Text style={styles.cardImageCaption}>{item.title}</Text>
          </View>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>

        <TouchableOpacity
          style={styles.readMoreRow}
          onPress={onPress}
          activeOpacity={0.75}
        >
          <Text style={styles.readMoreText}>Tap to read full announcement</Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <View
          style={cardMenuStyles.menu}
          onTouchStart={(event) => event?.stopPropagation?.()}
        >
          <TouchableOpacity
            style={cardMenuStyles.menuItem}
            onPressIn={(event) => {
              event?.stopPropagation?.();
              onMarkAsRead(item);
            }}
            onPress={(event) => event?.stopPropagation?.()}
          >
            <Text style={cardMenuStyles.menuText}>Mark as read</Text>
            <MaterialIcons name="done" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={cardMenuStyles.menuItem}
            onPressIn={(event) => {
              event?.stopPropagation?.();
              onTogglePin(item);
            }}
            onPress={(event) => event?.stopPropagation?.()}
          >
            <Text style={cardMenuStyles.menuText}>{isPinned ? 'Unpin' : 'Pin'}</Text>
            <MaterialIcons name="push-pin" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          {isArchived ? (
            <TouchableOpacity
              style={cardMenuStyles.menuItem}
              onPressIn={(event) => {
                event?.stopPropagation?.();
                onUnarchive(item);
              }}
              onPress={(event) => event?.stopPropagation?.()}
            >
              <Text style={cardMenuStyles.menuText}>Unarchive</Text>
              <MaterialIcons name="unarchive" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={cardMenuStyles.menuItem}
              onPressIn={(event) => {
                event?.stopPropagation?.();
                onArchive(item);
              }}
              onPress={(event) => event?.stopPropagation?.()}
            >
              <Text style={cardMenuStyles.menuText}>Archive</Text>
              <MaterialIcons name="archive" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

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

export default function AnnouncementsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const openId = params?.openId;
  const insets = useSafeAreaInsets();
  const { avatarUri } = useUser();
  const drawerRef = useRef(null);
  const pullToRefreshRef = useRef(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [activeTab, setActiveTab] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Time');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionMenuItem, setActionMenuItem] = useState(null);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState([]);
  const [archivedAnnouncementIds, setArchivedAnnouncementIds] = useState([]);
  const [pinnedAnnouncementIds, setPinnedAnnouncementIds] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

  const openDetail = (item) => {
    markAnnouncementAsRead(item);
    setSelectedItem(item);
    setShowDetail(true);
    setActionMenuItem(null);
  };

  useEffect(() => {
    if (openId && announcements.length > 0) {
      const match = announcements.find((a) => String(a.id ?? a.announcement_id) === String(openId));
      if (match) {
        openDetail(match);
        // Clear route params so it doesn't reopen on navigation cycles
        router.setParams({ openId: undefined });
      }
    }
  }, [openId, announcements]);

  const toggleActionMenu = (item) => {
    const itemKey = getAnnouncementKey(item);
    const openItemKey = actionMenuItem ? getAnnouncementKey(actionMenuItem) : null;
    setActionMenuItem(openItemKey === itemKey ? null : item);
  };

  const markAnnouncementAsRead = useCallback(async (item) => {
    const itemKey = getAnnouncementKey(item);
    const nextReadIds = Array.from(new Set([...readAnnouncementIds, itemKey]));
    setReadAnnouncementIds(nextReadIds);
    setAnnouncements((current) =>
      current.map((a) =>
        getAnnouncementKey(a) === itemKey ? { ...a, read: true } : a
      )
    );
    setActionMenuItem(null);
    try {
      await AsyncStorage.setItem(READ_STORAGE_KEY, JSON.stringify(nextReadIds));
    } catch (error) {
      console.error('save read announcement failed:', error);
    }
  }, [readAnnouncementIds]);

  const archiveAnnouncement = useCallback(async (item) => {
    const itemKey = getAnnouncementKey(item);
    const nextArchivedIds = Array.from(new Set([...archivedAnnouncementIds, itemKey]));
    setArchivedAnnouncementIds(nextArchivedIds);
    setActionMenuItem(null);
    setActiveTab('Archive');
    try {
      await AsyncStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(nextArchivedIds));
    } catch (error) {
      console.error('save archived announcement failed:', error);
    }
  }, [archivedAnnouncementIds]);

  const unarchiveAnnouncement = useCallback(async (item) => {
    const itemKey = getAnnouncementKey(item);
    const nextArchivedIds = archivedAnnouncementIds.filter((id) => id !== itemKey);
    setArchivedAnnouncementIds(nextArchivedIds);
    setActionMenuItem(null);
    try {
      await AsyncStorage.setItem(ARCHIVED_STORAGE_KEY, JSON.stringify(nextArchivedIds));
    } catch (error) {
      console.error('save unarchive announcement failed:', error);
    }
  }, [archivedAnnouncementIds]);

  const togglePinAnnouncement = useCallback(async (item) => {
    const itemKey = getAnnouncementKey(item);
    const alreadyPinned = item.pinned || pinnedAnnouncementIds.includes(itemKey);
    const nextPinnedIds = alreadyPinned
      ? pinnedAnnouncementIds.filter((id) => id !== itemKey)
      : Array.from(new Set([...pinnedAnnouncementIds, itemKey]));

    setPinnedAnnouncementIds(nextPinnedIds);
    setAnnouncements((current) =>
      current.map((a) =>
        getAnnouncementKey(a) === itemKey ? { ...a, pinned: !alreadyPinned } : a
      )
    );
    setActionMenuItem(null);
    if (!alreadyPinned) setActiveTab('Pinned');

    try {
      await AsyncStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(nextPinnedIds));
    } catch (error) {
      console.error('save pinned announcement failed:', error);
    }
  }, [pinnedAnnouncementIds]);

  const isAnnouncementRead = useCallback(
    (announcement) =>
      announcement.read || readAnnouncementIds.includes(getAnnouncementKey(announcement)),
    [readAnnouncementIds]
  );

  const isAnnouncementArchived = useCallback(
    (announcement) =>
      announcement.archived || archivedAnnouncementIds.includes(getAnnouncementKey(announcement)),
    [archivedAnnouncementIds]
  );

  const isAnnouncementPinned = useCallback(
    (announcement) =>
      announcement.pinned || pinnedAnnouncementIds.includes(getAnnouncementKey(announcement)),
    [pinnedAnnouncementIds]
  );

  const periodFilteredAnnouncements = useMemo(() => {
    const referenceDate = getFilterReferenceDate(announcements);
    return announcements.filter((a) => isInSelectedPeriod(a, selectedFilter, referenceDate));
  }, [announcements, selectedFilter]);

  const activeAnnouncements = useMemo(
    () =>
      periodFilteredAnnouncements
        .filter((a) => !isAnnouncementArchived(a))
        .sort((left, right) => {
          // Pinned items stay on top first (tenant's own explicit action).
          const pinnedDiff = Number(isAnnouncementPinned(right)) - Number(isAnnouncementPinned(left));
          if (pinnedDiff !== 0) return pinnedDiff;
          // Within the same pinned/unpinned group, High priority surfaces first.
          return getPriorityRank(left) - getPriorityRank(right);
        }),
    [isAnnouncementArchived, isAnnouncementPinned, periodFilteredAnnouncements]
  );

  const archivedAnnouncements = useMemo(
    () => periodFilteredAnnouncements.filter((a) => isAnnouncementArchived(a)),
    [isAnnouncementArchived, periodFilteredAnnouncements]
  );

  const tabCounts = useMemo(() => ({
    All:     activeAnnouncements.length,
    Unread:  activeAnnouncements.filter((a) => !isAnnouncementRead(a)).length,
    Pinned:  activeAnnouncements.filter((a) => isAnnouncementPinned(a)).length,
    Archive: archivedAnnouncements.length,
  }), [activeAnnouncements, archivedAnnouncements, isAnnouncementPinned, isAnnouncementRead]);

  const visibleAnnouncements = useMemo(() => {
    if (activeTab === 'Unread')  return activeAnnouncements.filter((a) => !isAnnouncementRead(a));
    if (activeTab === 'Pinned')  return activeAnnouncements.filter((a) => isAnnouncementPinned(a));
    if (activeTab === 'Archive') return archivedAnnouncements;
    return activeAnnouncements;
  }, [activeAnnouncements, activeTab, archivedAnnouncements, isAnnouncementPinned, isAnnouncementRead]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['bottom']}
      onTouchStart={() => {
        if (actionMenuItem) setActionMenuItem(null);
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <PremiumPullToRefresh
        ref={pullToRefreshRef}
        refreshing={refreshing}
        onRefresh={onRefresh}
        iconName="campaign"
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
                <Image
                  source={avatarUri ? { uri: avatarUri } : require('../../assets/def_icon.png')}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>
        }
      >
          <ScrollView
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 24), gap: 12 }}
            onScroll={(e) => pullToRefreshRef.current?.handleScroll(e)}
            scrollEventThrottle={16}
            overScrollMode="never"
          >

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
            {ANNOUNCEMENT_TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
              >
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
                <AnnouncementCard
                  key={getAnnouncementKey(item)}
                  item={item}
                  isRead={isAnnouncementRead(item)}
                  isPinned={isAnnouncementPinned(item)}
                  isArchived={isAnnouncementArchived(item)}
                  isMenuOpen={
                    Boolean(actionMenuItem) &&
                    getAnnouncementKey(actionMenuItem) === getAnnouncementKey(item)
                  }
                  onPress={() => openDetail(item)}
                  onMenuPress={toggleActionMenu}
                  onMarkAsRead={markAnnouncementAsRead}
                  onTogglePin={togglePinAnnouncement}
                  onArchive={archiveAnnouncement}
                  onUnarchive={unarchiveAnnouncement}
                />
              ))
            )}
          </View>
          </ScrollView>
      </PremiumPullToRefresh>

      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <NavItem iconName="home" label="Home" isActive={false} onPress={() => router.push('/tenant/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor" isActive={false} onPress={() => router.push('/tenant/visitors')} />
        <NavItem iconName="warning" label="Emergency" isCenter onPress={() => router.push('/tenant/emergency')} />
        <NavItem iconName="water-drop" label="Water Bill" isActive={false} onPress={() => router.push('/tenant/water-bill')} />
        <NavItem iconName="account-circle" label="Profile" isActive={false} onPress={() => router.push('/tenant/profile')} />
      </View>

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
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
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedFilter === option && styles.dropdownItemTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {selectedFilter === option && (
                      <MaterialIcons name="check" size={18} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AnnouncementDetail
        item={selectedItem}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
      />

      <DrawerMenu ref={drawerRef} />
      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}

const cardMenuStyles = {
  menu: {
    position: 'absolute',
    top: 36,
    right: 8,
    width: 180,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 99,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 13,
    color: COLORS.dark,
    fontWeight: '600',
  },
};