import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  Settings,
  Moon,
  Languages,
  Bell,
  HelpCircle,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';
  const { language, setLanguage } = useLanguage();
  const [slideAnim] = useState(new Animated.Value(-DRAWER_WIDTH));
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      fetchProfile();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const getAvatarPublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const publicAvatarUrl = getAvatarPublicUrl(avatarUrl);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = async () => {
    onClose();
    await signOut();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'pt' ? 'en' : 'pt');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: theme.card,
              transform: [{ translateX: slideAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.profileSection,
              {
                backgroundColor: mode === 'dark' ? 'rgba(228, 15, 17, 0.1)' : '#fef2f2',
                borderColor: mode === 'dark' ? 'rgba(228, 15, 17, 0.2)' : '#fee2e2',
              },
            ]}
            onPress={() => handleNavigation('/(tabs)/settings')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              {publicAvatarUrl ? (
                <Image source={{ uri: publicAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.email?.[0].toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              {fullName ? (
                <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>
                  {fullName}
                </Text>
              ) : null}
              <Text style={[styles.profileEmail, { color: theme.textSecondary }]} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/settings')}
            >
              <User size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigation('/(tabs)/settings')}
            >
              <Settings size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Settings</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
              <Moon size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Dark Mode</Text>
              <View style={styles.toggleContainer}>
                <View
                  style={[
                    styles.toggle,
                    isDark ? styles.toggleActive : styles.toggleInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      isDark && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
              <Languages size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>
                {language === 'pt' ? 'Português' : 'English'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Bell size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>Notifications</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem}>
              <HelpCircle size={20} color={theme.textSecondary} />
              <Text style={[styles.menuText, { color: theme.text }]}>
                Help and Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.logoutItem, { backgroundColor: mode === 'dark' ? 'rgba(220, 38, 38, 0.1)' : '#fef2f2' }]}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#dc2626" />
              <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e40f11',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#e40f11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 13,
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  toggleContainer: {
    marginLeft: 'auto',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleInactive: {
    backgroundColor: '#d1d5db',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  logoutItem: {
    marginTop: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '600',
  },
});
