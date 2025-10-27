import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sublabel: string;
  borderColor: string;
  iconBackgroundColor: string;
  index?: number;
}

export function StatCard({ icon, value, label, sublabel, borderColor, iconBackgroundColor }: StatCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { borderRightColor: borderColor, backgroundColor: theme.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.sublabel, { color: theme.textSecondary }]}>{sublabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderRightWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 13,
    color: '#64748b',
  },
});
