import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/Header';
import { DrawerMenu } from '@/components/DrawerMenu';
import { BookOpen } from 'lucide-react-native';

export default function GuidesScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [drawerVisible, setDrawerVisible] = useState(false);
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <Header
        greeting="Guias"
        subtitle="Tutoriais e informações úteis"
        onMenuPress={() => setDrawerVisible(true)}
        icon={<BookOpen size={20} color="#fff" />}
      />

      <ScrollView style={styles.scrollView}>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <View style={[styles.iconContainer, { backgroundColor: theme.surface }]}>
            <BookOpen size={64} color={theme.textSecondary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>Em breve</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Guias e tutoriais estarão disponíveis em breve
          </Text>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
