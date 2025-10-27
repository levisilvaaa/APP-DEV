import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';

interface HeaderProps {
  greeting: string;
  subtitle?: string;
  onMenuPress?: () => void;
  icon?: React.ReactNode;
  hideMenu?: boolean;
}

export function Header({ greeting, subtitle, onMenuPress, icon, hideMenu = false }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#e40f11', '#b91c1c']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.header, { paddingTop: insets.top + 12 }]}
    >
      <View style={styles.content}>
        {!hideMenu && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={0.7}>
            <Menu size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        )}

        <View style={styles.textContainer}>
          <View style={styles.greetingRow}>
            {icon && icon}
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo-branca.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textContainer: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.85,
    marginTop: 2,
    fontWeight: '400',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  logoImage: {
    width: 85,
    height: 38,
  },
});
