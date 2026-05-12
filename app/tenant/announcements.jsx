import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import client from '../../api/client';
import * as WebBrowser from 'expo-web-browser';
import { scale, verticalScale, moderateScale } from '../../src/utils/scale';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];

const priorityColors = {
  High:     { bg: '#FFD7C7', text: '#EB9C7D' },
  Moderate: { bg: '#FFF3CD', text: '#D4A017' },
  Low:      { bg: '#E5ECF6', text: '#B5B7C0' },
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// ── Detail Modal ──────────────────────────────────────────────────────────────
const AnnouncementDetail = ({ item, visible, onClose }) => {
  if (!item) return null;

  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageRatio, setImageRatio] = useState(4 / 3);

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
    if (IMAGE_EXTENSIONS.includes(ext))
      return { name: 'image-outline',         color: '#4CAF50' };
    if (ext === 'pdf')
      return { name: 'document-text-outline', color: '#F44336' };
    if (['doc', 'docx'].includes(ext))
      return { name: 'document-outline',      color: '#2196F3' };
    if (['xls', 'xlsx'].includes(ext))
      return { name: 'grid-outline',          color: '#4CAF50' };
    return   { name: 'attach-outline',        color: '#CA5D86' };
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'ios' ? 54 : StatusBar.currentHeight,
      }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Header INSIDE ScrollView ── */}
          <View style={detailStyles.header}>
            <TouchableOpacity onPress={onClose} style={detailStyles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#2D1B2E" />
            </TouchableOpacity>
            <Text style={detailStyles.headerTitle}>Announcement</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Post Header ── */}
          <View style={detailStyles.postHeader}>
            <View style={detailStyles.adminAvatar}>
              <MaterialIcons name="campaign" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={detailStyles.adminName}>DormEase Admin</Text>
              <View style={detailStyles.metaRow}>
                <Ionicons name="time-outline" size={12} color="#B5B7C0" />
                <Text style={detailStyles.metaText}>{item.date}</Text>
                <View style={[detailStyles.priorityBadge, { backgroundColor: p.bg }]}>
                  <Text style={[detailStyles.priorityText, { color: p.text }]}>
                    {item.priority}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Title ── */}
          <View style={detailStyles.titleSection}>
            <Text style={detailStyles.title}>{item.title}</Text>
          </View>

          {/* ── Content ── */}
          <View style={detailStyles.contentSection}>
            <Text style={detailStyles.content}>{item.preview}</Text>
          </View>

          {/* ── Image ── */}
          {item.image ? (
            <View style={detailStyles.imageWrapper}>
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', aspectRatio: imageRatio }}
                resizeMode="cover"
                onLoad={(e) => {
                  const { width, height } = e.nativeEvent.source;
                  const ratio = width / height;
                  if (ratio >= 0.9 && ratio <= 1.1)  setImageRatio(1);
                  else if (ratio >= 1.2)              setImageRatio(4 / 3);
                  else                                setImageRatio(ratio);
                }}
                onError={() => console.log('Image failed:', item.image)}
              />
            </View>
          ) : null}

          {/* ── Divider ── */}
          {attachments.length > 0 && <View style={detailStyles.divider} />}

          {/* ── Attachments ── */}
          {attachments.length > 0 && (
            <View style={detailStyles.attachSection}>
              <Text style={detailStyles.attachTitle}>
                📎 Attachments ({attachments.length})
              </Text>
              {attachments.map((path, i) => {
                const icon = getFileIcon(path);
                return (
                  <TouchableOpacity
                    key={i}
                    style={detailStyles.attachItem}
                    onPress={() => openFile(path)}
                    activeOpacity={0.75}
                  >
                    <View style={[detailStyles.attachIcon, { backgroundColor: icon.color + '20' }]}>
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={detailStyles.attachName} numberOfLines={1}>
                        {getFileName(path)}
                      </Text>
                      <Text style={detailStyles.attachType}>
                        {path.split('.').pop().toUpperCase()} · tap to open
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color="#B5B7C0" />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ── Announcement Card ─────────────────────────────────────────────────────────
const AnnouncementCard = ({ item, onPress }) => {
  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageError, setImageError]   = useState(false);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
          <Text style={[styles.priorityText, { color: p.text }]}>{item.priority}</Text>
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
              if (ratio >= 0.9 && ratio <= 1.1)  setAspectRatio(1);
              else if (ratio >= 1.2)              setAspectRatio(4 / 3);
              else                                setAspectRatio(ratio);
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

// ── Bottom Nav ────────────────────────────────────────────────────────────────
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

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AnnouncementsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab]           = useState('All');
  const [announcements, setAnnouncements]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [showDropdown, setShowDropdown]     = useState(false);
  const [selectedItem, setSelectedItem]     = useState(null);
  const [showDetail, setShowDetail]         = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await client.get('/announcements', { timeout: 15000 });
      console.log('FIRST ITEM:', JSON.stringify(res.data[0], null, 2));
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
    setSelectedItem(item);
    setShowDetail(true);
  };

  const filteredAnnouncements = () => {
    if (activeTab === 'Unread') return announcements.filter((a) => !a.read);
    if (activeTab === 'Pinned') return announcements.filter((a) => a.pinned);
    return announcements;
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* ── Top Row ── */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
            </TouchableOpacity>
            <View style={styles.topRowRight}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/tenant/notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={require('../../assets/def_icon.png')} style={styles.avatar} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Header Section ── */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Announcements 📢</Text>
            <Text style={styles.headerSub}>View notices and announcements</Text>
          </View>

          {/* ── Filter Row ── */}
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

          {/* ── Tabs ── */}
          <View style={styles.tabRow}>
            {['All', 'Unread', 'Pinned'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}{tab === 'All' ? ` ${announcements.length}` : ''}
                </Text>
                {activeTab === tab && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Cards ── */}
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {filteredAnnouncements().length === 0 ? (
              <Text style={styles.emptyText}>No announcements here.</Text>
            ) : (
              filteredAnnouncements().map((item) => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  onPress={() => openDetail(item)}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        <NavItem iconName="home"           label="Home"       isActive={false} onPress={() => router.push('/tenant/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor"    isActive={false} />
        <NavItem iconName="warning"        label="Emergency"  isCenter />
        <NavItem iconName="water-drop"     label="Water Bill" isActive={false} />
        <NavItem iconName="account-circle" label="Profile"    isActive={false} />
      </View>

      {/* ── Dropdown Modal ── */}
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
                    style={[styles.dropdownItem, selectedFilter === option && styles.dropdownItemActive]}
                    onPress={() => { setSelectedFilter(option); setShowDropdown(false); }}
                  >
                    <Text style={[styles.dropdownItemText, selectedFilter === option && styles.dropdownItemTextActive]}>
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

      {/* ── Detail Modal ── */}
      <AnnouncementDetail
        item={selectedItem}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </SafeAreaView>
  );
}

// ── Detail styles ─────────────────────────────────────────────────────────────
const detailStyles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFB6C1',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#2D1B2E',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    gap: 12,
  },
  adminAvatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#CA5D86',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#2D1B2E',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: moderateScale(11),
    color: '#B5B7C0',
  },
  priorityBadge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  priorityText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  titleSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(6),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#2D1B2E',
    lineHeight: 28,
  },
  contentSection: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(14),
  },
  content: {
    fontSize: moderateScale(15),
    color: '#4A4A4A',
    lineHeight: 24,
  },
  imageWrapper: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  divider: {
    height: 8,
    backgroundColor: '#F5F5F5',
    marginVertical: verticalScale(12),
  },
  attachSection: {
    paddingHorizontal: scale(16),
    gap: 10,
  },
  attachTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#2D1B2E',
    marginBottom: verticalScale(6),
  },
  attachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: scale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  attachIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachName: {
    fontSize: moderateScale(13),
    color: '#2D1B2E',
    fontWeight: '600',
  },
  attachType: {
    fontSize: moderateScale(11),
    color: '#B5B7C0',
    marginTop: 2,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 2,
  },
  readMoreText: {
    fontSize: moderateScale(11),
    color: '#CA5D86',
    fontWeight: '500',
  },
};