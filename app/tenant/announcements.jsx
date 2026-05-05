import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import styles, { COLORS } from '../../src/announcementsstyles';
const FILTER_OPTIONS = ['Today', 'This Week', 'This Month', 'All Time'];

// placeholder data — swap for real api call when backend is ready
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    priority: 'Low',
    title: 'Internet Downtime Notification',
    preview: 'Be prepared for possible internet downtime later from 9:00 PM to midnight. Plan your activities accordingly.',
    date: 'February 19, 2026 · 5:00 PM',
    files: 0,
    image: null,
    read: false,
    pinned: false,
  },
  {
    id: '2',
    priority: 'Low',
    title: 'Water Billing Reminder: Due on the 28th',
    preview: 'Please note that the water billing for February 2026 was already posted, and payments are due on the 28th.',
    date: 'February 18, 2026 · 3:35 PM',
    files: 0,
    image: null,
    read: true,
    pinned: true,
  },
  {
    id: '3',
    priority: 'High',
    title: 'Urgent Pest Control Notice',
    preview: 'Pest Control will be conducted in all rooms tomorrow, February 19 from 9:00 AM to 12:00 PM. Please vacate your rooms.',
    date: 'February 17, 2026 · 3:25 PM',
    files: 2,
    image: null,
    read: false,
    pinned: false,
  },
];

const priorityColors = {
  High: { bg: '#FFD7C7', text: '#EB9C7D' },
  Low:  { bg: '#E5ECF6', text: '#B5B7C0' },
};

// single announcement card
const AnnouncementCard = ({ item }) => {
  const p = priorityColors[item.priority] || { bg: '#E5ECF6', text: '#B5B7C0' };
  const [imageError, setImageError] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.priorityBadge, { backgroundColor: p.bg }]}>
          <Text style={[styles.priorityText, { color: p.text }]}>{item.priority}</Text>
        </View>
        <TouchableOpacity style={styles.dotsBtn}>
          <MaterialIcons name="more-horiz" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPreview}>{item.preview}</Text>

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
  const [activeTab, setActiveTab] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      // TODO: replace with real api call when backend is ready
      // const res = await fetch
      // const data = await res.json();
      // setAnnouncements(data);
      setAnnouncements(MOCK_ANNOUNCEMENTS);
    } catch (error) {
      console.error('failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = () => {
    let list = announcements;
    if (activeTab === 'Unread') list = list.filter((a) => !a.read);
    if (activeTab === 'Pinned') list = list.filter((a) => a.pinned);
    return list;
  };

  return (
<   SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* header row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.topRowRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.dark} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={require('../../assets/def_icon.png')} style={styles.avatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* page title */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Announcements 📢</Text>
        <Text style={styles.headerSub}>View notices and announcements</Text>
      </View>

      {/* filter row */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={16} color="#fff" />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>

        {/* this week dropdown trigger */}
        <TouchableOpacity
          style={styles.weekBtn}
          onPress={() => setShowDropdown(true)}
        >
          <Ionicons name="calendar-outline" size={16} color={COLORS.dark} />
          <Text style={styles.weekBtnText}>{selectedFilter}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* tabs */}
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

      {/* list or loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {filteredAnnouncements().length === 0 ? (
            <Text style={styles.emptyText}>No announcements here.</Text>
          ) : (
            filteredAnnouncements().map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.bottomNav}>
        <NavItem iconName="home" label="Home" isActive onPress={() => router.replace('/dashboard')} />
        <NavItem iconName="person-outline" label="Visitor" />
        <NavItem iconName="warning" label="Emergency" isCenter />
        <NavItem iconName="water-drop" label="Water Bill" />
        <NavItem iconName="account-circle" label="Profile" />
      </View>

      {/* dropdown modal for week filter */}
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

    </SafeAreaView>
  );
}