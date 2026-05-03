import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import styles, { COLORS } from './styles';

const defaultPhoto = require('../assets/def_icon.png');

// placeholder user data — replace with real data from your database later
const userData = {
  firstName: 'Ash',
  fullName: 'Hilary Ashley Pagadora',
  username: '@hmpgdra',
  floor: 2,
  roomNumber: '202',
  roomCode: 'R202-01',
  currentBill: '206.25',
  pendingRequests: 0,
  profilePhoto: null, // null = use default photo. replace with url string from database
};

// placeholder announcements — replace with real data from your database later
const announcements = [
  {
    id: '1',
    title: 'Water Billing Reminder',
    date: 'February 18, 2026',
    preview: 'Please note that the water billing...',
  },
];

// shows good morning / afternoon / evening based on current time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

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

// single announcement row component
const AnnouncementItem = ({ title, date, preview }) => (
  <View style={styles.announcementCard}>
    <View style={styles.announceMegaphone}>
      <Ionicons name="megaphone" size={18} color={COLORS.primary} />
    </View>
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={styles.announceTitle}>{title}</Text>
      <Text style={styles.announceDate}>{date}</Text>
      <Text style={styles.announceText}>{preview}</Text>
    </View>
    <TouchableOpacity style={styles.viewBtn}>
      <Text style={styles.viewBtnText}>View</Text>
    </TouchableOpacity>
  </View>
);

// main screen
const Home = () => {
  const greeting = getGreeting();

  // controls if the drawer is open or closed
  const [drawerOpen, setDrawerOpen] = useState(false);

  // controls if the documents submenu is expanded
  const [documentsExpanded, setDocumentsExpanded] = useState(false);

  // animation value for sliding the drawer in and out
  const drawerAnim = useRef(new Animated.Value(-400)).current;

  // if user has a photo from the database use it, otherwise use the default
  const photoSource = userData.profilePhoto
    ? { uri: userData.profilePhoto }
    : defaultPhoto;

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={26} color="#333" />
          </TouchableOpacity>
          <Image source={photoSource} style={styles.headerAvatarImage} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >

        {/* greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetTitle}>
            {greeting}, {userData.firstName}! 👋
          </Text>
          <Text style={styles.greetSub}>Your dorm services are just a tap away.</Text>
        </View>

        {/* user card */}
        <View style={styles.userCard}>
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
              <Text style={styles.statValue}>{userData.currentBill}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending Requests</Text>
              <Text style={styles.statValue}>{userData.pendingRequests}</Text>
            </View>
          </View>
        </View>

        {/* quick actions */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginBottom: 12 }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          <QuickActionCard
            iconName="build"
            title="Maintenance Request"
            description="Report room issues for quick repair"
            onPress={() => {/* go to maintenance screen */}}
          />
          <QuickActionCard
            iconName="warning"
            title="Emergency Report"
            description="Alert staff immediately for urgent help"
            onPress={() => {/* go to emergency screen */}}
          />
          <QuickActionCard
            iconName="water-drop"
            title="Water Bill"
            description="View and track your current charges"
            onPress={() => {/* go to billing screen */}}
          />
          <QuickActionCard
            iconName="person-add"
            title="Register Visitor"
            description="Log your guest for smooth entry"
            onPress={() => {/* go to visitor screen */}}
          />
        </View>

        {/* announcements */}
        <View style={styles.announcementHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{announcements.length}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* loops through announcements array */}
        {announcements.map((item) => (
          <AnnouncementItem
            key={item.id}
            title={item.title}
            date={item.date}
            preview={item.preview}
          />
        ))}

      </ScrollView>

      {/* bottom nav */}
      <View style={styles.bottomNav}>
        <NavItem iconName="home"           label="Home"       isActive />
        <NavItem iconName="person-outline" label="Visitor" />
        <NavItem iconName="warning"        label="Emergency"  isCenter />
        <NavItem iconName="water-drop"     label="Water Bill" />
        <NavItem iconName="account-circle" label="Profile" />
      </View>

      {/* dark overlay behind drawer — only shows when drawer is open */}
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
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="home-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Dashboard</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* announcements */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="megaphone-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Announcements</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* documents — has a submenu that expands/collapses */}
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => setDocumentsExpanded(!documentsExpanded)}
        >
          <View style={styles.drawerItemLeft}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Documents</Text>
          </View>
          {/* arrow flips when submenu is open */}
          <Ionicons
            name={documentsExpanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color={COLORS.white}
          />
        </TouchableOpacity>

        {/* documents submenu — only shows when documentsExpanded is true */}
        {documentsExpanded && (
          <>
            <TouchableOpacity style={styles.drawerSubItem}>
              <Text style={styles.drawerSubItemText}>Documents Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerSubItem}>
              <Text style={styles.drawerSubItemText}>Tenant Records</Text>
            </TouchableOpacity>
          </>
        )}

        {/* maintenance */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <MaterialIcons name="build" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Maintenance</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* emergency */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="warning-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Emergency</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* visitor */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="people-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Visitor</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* billing */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Billing</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        {/* settings */}
        <TouchableOpacity style={styles.drawerItem}>
          <View style={styles.drawerItemLeft}>
            <Ionicons name="settings-outline" size={20} color={COLORS.white} />
            <Text style={styles.drawerItemText}>Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.drawerDivider} />

        {/* logout button at the bottom */}
        <TouchableOpacity style={styles.drawerLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.drawerLogoutText}>Logout</Text>
        </TouchableOpacity>

      </Animated.View>

    </SafeAreaView>
  );
};

export default Home;