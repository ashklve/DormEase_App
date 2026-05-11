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
  Linking,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/constants/announcementsstyles';
import client from '../../api/client';

const FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];

const priorityColors = {
  High: { bg: '#FFD7C7', text: '#EB9C7D' },
  Moderate: { bg: '#FFF3CD', text: '#D4A017' },
  Low: { bg: '#E5ECF6', text: '#B5B7C0' },
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
const AnnouncementDetail = ({ item, visible, onClose }) => {
  if (!item) return null;

  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };

  // parse comma-separated attachment paths into an array
  const attachments = item.attachments
    ? item.attachments.split(',').map((a) => a.trim()).filter(Boolean)
    : [];

  const getFileName = (path) => path.split('/').pop();

  const openFile = (path) => {
    const url = `${client.defaults.baseURL.replace('/api', '')}/storage/${path}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {/* header */}
        <View style={detailStyles.header}>
          <TouchableOpacity onPress={onClose} style={detailStyles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <Text style={detailStyles.headerTitle}>Announcement</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={detailStyles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* priority badge */}
          <View style={[detailStyles.priorityBadge, { backgroundColor: p.bg }]}>
            <Text style={[detailStyles.priorityText, { color: p.text }]}>
              {item.priority}
            </Text>
          </View>

          {/* title */}
          <Text style={detailStyles.title}>{item.title}</Text>

          {/* date */}
          <View style={detailStyles.metaRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.muted} />
            <Text style={detailStyles.metaText}>{item.date}</Text>
          </View>

          {/* divider */}
          <View style={detailStyles.divider} />

          {/* full content */}
          <Text style={detailStyles.content}>{item.preview}</Text>

          {/* image if present */}
          {item.image ? (
            <View style={detailStyles.imageWrapper}>
              <Image
                source={{ uri: item.image }}
                style={detailStyles.image}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* attachments */}
          {attachments.length > 0 && (
            <View style={detailStyles.attachSection}>
              <Text style={detailStyles.attachTitle}>
                📎 Attachments ({attachments.length})
              </Text>
              {attachments.map((path, i) => (
                <TouchableOpacity
                  key={i}
                  style={detailStyles.attachItem}
                  onPress={() => openFile(path)}
                >
                  <View style={detailStyles.attachIcon}>
                    <Ionicons name="document-outline" size={18} color={COLORS.primary} />
                  </View>
                  <Text style={detailStyles.attachName} numberOfLines={1}>
                    {getFileName(path)}
                  </Text>
                  <Ionicons name="download-outline" size={18} color={COLORS.muted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ── Announcement Card ─────────────────────────────────────────────────────────
const AnnouncementCard = ({ item, onPress }) => {
  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageError, setImageError] = useState(false);

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

      {/* preview — truncated to 2 lines on card */}
      <Text style={styles.cardPreview} numberOfLines={2}>{item.preview}</Text>

      {item.image && !imageError ? (
        <View style={styles.cardImageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
          <Text style={styles.cardImageCaption}>{item.title}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>{item.date}</Text>
        <View style={styles.filesRow}>
          <Ionicons name="folder-outline" size={14} color={COLORS.muted} />
          <Text style={styles.filesText}>{item.files} files</Text>
        </View>
      </View>

      {/* tap to read hint */}
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
  const [activeTab, setActiveTab] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await client.get('/announcements', { timeout: 8000 });
      setAnnouncements(res.data);
    } catch (error) {
      console.error('announcements error:', error.message);
      console.error('announcements error code:', error.code);
      setAnnouncements([]); // ← stop infinite loading on failure
    } finally {
      setLoading(false);
    }
  };

  // pull-to-refresh handler
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* header */}
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

      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Announcements 📢</Text>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
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
        </ScrollView>
      )}

      {/* bottom nav */}
      <View style={styles.bottomNav}>
        <NavItem
          iconName="home"
          label="Home"
          isActive={false}
          onPress={() => router.push('/tenant/dashboard')}
        />
        <NavItem iconName="person-outline" label="Visitor" isActive={false} />
        <NavItem iconName="warning" label="Emergency" isCenter />
        <NavItem iconName="water-drop" label="Water Bill" isActive={false} />
        <NavItem iconName="account-circle" label="Profile" isActive={false} />
      </View>

      {/* period filter dropdown */}
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
                    onPress={() => {
                      setSelectedFilter(option);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedFilter === option && styles.dropdownItemTextActive,
                    ]}>
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

      {/* full announcement detail modal */}
      <AnnouncementDetail
        item={selectedItem}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
      />

    </SafeAreaView>
  );
}

// ── Detail modal styles ───────────────────────────────────────────────────────
const detailStyles = {
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1B2E',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D1B2E',
    lineHeight: 28,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#B5B7C0',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  content: {
    fontSize: 15,
    color: '#2D1B2E',
    lineHeight: 24,
    marginBottom: 20,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: 220,
  },
  attachSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  attachTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D1B2E',
    marginBottom: 4,
  },
  attachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 10,
  },
  attachIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachName: {
    flex: 1,
    fontSize: 13,
    color: '#2D1B2E',
    fontWeight: '500',
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 2,
  },
  readMoreText: {
    fontSize: 11,
    color: '#CA5D86',
    fontWeight: '500',
  },
};