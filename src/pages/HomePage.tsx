```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, SafeAreaView } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView, createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { Inter_500Medium, Inter_600SemiBold, useFonts } from '@react-native-google-fonts/inter';
import { LexendDeca_400Regular } from '@react-native-google-fonts/lexend-deca';
import auth from '@react-native-firebase/auth';

// Sidebar Context (mimicking Lovable's SidebarProvider)
interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// AppLayout Component (simplified to avoid conflicts)
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen) }}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SidebarContext.Provider>
  );
};

// Drawer Content Component (converted from MainDrawerWidget)
const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const [markLocation, setMarkLocation] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    photoUrl: 'https://eeqmvfbsupumublzxlil.supabase.co/storage/v1/object/public/roots//man.png',
    name: 'Display Name',
    username: '-',
    followers: 123,
    following: 123,
  });

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserData({
        photoUrl: user.photoURL || userData.photoUrl,
        name: user.displayName || 'Display Name',
        username: user.displayName || '-',
        followers: 123, // Replace with Supabase query if available
        following: 123, // Replace with Supabase query if available
      });
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.reset({ index: 0, routes: [{ name: 'AuthPageTRASH' }] });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const MenuItem: React.FC<{ icon: string; text: string; route?: string; onPress?: () => void; iconType?: 'Ionicons' | 'FontAwesome' }> = ({ icon, text, route, onPress, iconType = 'Ionicons' }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress || (route ? () => navigation.navigate(route) : undefined)}
    >
      {iconType === 'FontAwesome' ? (
        <FontAwesomeIcon name={icon} size={24} color="#007AFF" />
      ) : (
        <Icon name={icon} size={28} color="#007AFF" />
      )}
      <Text style={styles.menuText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <DrawerContentScrollView style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRCodeShareProfile')}
        >
          <Icon name="qr-code-outline" size={33} color="#000" />
        </TouchableOpacity>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{ uri: userData.photoUrl }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.displayName}>{userData.name}</Text>
        <Text style={styles.username}>@{userData.username}</Text>
        <View style={styles.followContainer}>
          <View style={styles.followItem}>
            <Text style={styles.followCount}>{userData.followers}</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
          <View style={styles.followItem}>
            <Text style={styles.followCount}>{userData.following}</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
        </View>
      </View>
      <View style={styles.menuContainer}>
        <MenuItem icon="location-outline" text="Account" route="AccountSetting" />
        <MenuItem icon="person-outline" text="Edit Profile" route="EditProfile" />
        <MenuItem icon="document-text-outline" text="Documents" route="Documents" />
        <MenuItem icon="box-open" text="My Products" route="MyProducts" iconType="FontAwesome" />
        <MenuItem icon="storefront-outline" text="Hosting" route="MyMarkets" />
        <MenuItem
          icon="checkmark-circle-outline"
          text="Verification"
          onPress={() => {
            alert('Coming soon');
          }}
        />
        <View style={styles.switchContainer}>
          <View style={styles.switchLabel}>
            <Icon name="location" size={31} color="#FD333F" />
            <Text style={styles.menuText}>Mark Location</Text>
          </View>
          <Switch
            value={markLocation}
            onValueChange={setMarkLocation}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={markLocation ? '#FFFFFF' : '#F4F4F4'}
          />
        </View>
      </View>
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        <View style={styles.themeToggle}>
          <TouchableOpacity
            style={[styles.themeOption, !isDarkMode ? styles.themeOptionActive : null]}
            onPress={() => setIsDarkMode(false)}
          >
            <Icon name="sunny" size={16} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeOption, isDarkMode ? styles.themeOptionActive : null]}
            onPress={() => setIsDarkMode(true)}
          >
            <Icon name="moon" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

// Home Page Component (converted from HomePageModel)
const HomePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const { toggleSidebar } = useSidebar();

  useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    LexendDeca_400Regular,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
          <Icon name="menu" size={30} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => alert(`Searching for: ${searchText}`)}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.welcomeText}>Welcome to the Home Page</Text>
          {/* Add more content here, e.g., product list from Supabase */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// Bottom Tab Navigator Component (converted from BottomMenuWidget)
const BottomTab: React.FC = () => (
  <BottomTabNavigator.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#FF9B41',
      tabBarInactiveTintColor: '#FFFFFF',
      tabBarStyle: { backgroundColor: '#007AFF', height: 64 },
    }}
    initialRouteName="Home"
  >
    <BottomTabNavigator.Screen
      name="Home"
      component={HomePage}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="home-outline" size={31} color={color} />,
        tabBarLabel: 'Home',
      }}
    />
    <BottomTabNavigator.Screen
      name="Map"
      component={PlaceholderScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="map-outline" size={31} color={color} />,
        tabBarLabel: 'Explore',
      }}
    />
    <BottomTabNavigator.Screen
      name="ProductDetail"
      component={PlaceholderScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="add-circle-outline" size={31} color={color} />,
        tabBarLabel: 'Add',
      }}
    />
    <BottomTabNavigator.Screen
      name="ListProducts"
      component={PlaceholderScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="list-outline" size={31} color={color} />,
        tabBarLabel: 'List',
      }}
    />
    <BottomTabNavigator.Screen
      name="Chats"
      component={PlaceholderScreen}
      options={{
        tabBarIcon: ({ color, size }) => <FontAwesomeIcon name="comment" size={29} color={color} />,
        tabBarLabel: 'Chat',
      }}
    />
  </BottomTabNavigator.Navigator>
);

// Placeholder Screen for Navigation
const PlaceholderScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.welcomeText}>Placeholder Screen</Text>
  </View>
);

// Main App Component
const Drawer = createDrawerNavigator();
const BottomTabNavigator = createBottomTabNavigator();

const App: React.FC = () => (
  <AppLayout>
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Tabs" component={BottomTab} />
        <Drawer.Screen name="QRCodeShareProfile" component={PlaceholderScreen} />
        <Drawer.Screen name="Profile" component={PlaceholderScreen} />
        <Drawer.Screen name="AccountSetting" component={PlaceholderScreen} />
        <Drawer.Screen name="EditProfile" component={PlaceholderScreen} />
        <Drawer.Screen name="Documents" component={PlaceholderScreen} />
        <Drawer.Screen name="MyProducts" component={PlaceholderScreen} />
        <Drawer.Screen name="MyMarkets" component={PlaceholderScreen} />
        <Drawer.Screen name="AuthPageTRASH" component={PlaceholderScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  </AppLayout>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#007AFF',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    color: '#FFF',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  welcomeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    textAlign: 'center',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  drawerHeader: {
    padding: 16,
  },
  qrButton: {
    width: 35.2,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  displayName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 28,
    marginLeft: 16,
  },
  username: {
    fontFamily: 'Inter_500Medium',
    fontSize: 21,
    marginLeft: 16,
    marginTop: 6,
  },
  followContainer: {
    flexDirection: 'row',
    marginLeft: 16,
    marginBottom: 8,
  },
  followItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  followCount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  followLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    marginLeft: 8,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
  },
  menuText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    marginLeft: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  logoutText: {
    fontFamily: 'LexendDeca_400Regular',
    fontSize: 14,
    color: '#FFF',
  },
  themeToggle: {
    flexDirection: 'row',
    width: 90,
    height: 36,
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 4,
    alignSelf: 'flex-start',
  },
  themeOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  themeOptionActive: {
    backgroundColor: '#767577',
  },
});

export default App;
```