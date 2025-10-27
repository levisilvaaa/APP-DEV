import { Tabs } from 'expo-router';
import { Home, ShoppingBag, BookOpen, TrendingUp, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 75 : 65,
        },
        tabBarIconStyle: {
          marginTop: 4,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ size, color }) => <Home size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Loja',
          tabBarIcon: ({ size, color }) => <ShoppingBag size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progresso',
          tabBarIcon: ({ size, color }) => <TrendingUp size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="guides"
        options={{
          title: 'Guias',
          tabBarIcon: ({ size, color }) => <BookOpen size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config.',
          tabBarIcon: ({ size, color }) => <Settings size={32} color={color} />,
        }}
      />
    </Tabs>
  );
}
