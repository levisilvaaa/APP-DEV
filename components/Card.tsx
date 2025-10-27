import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'low' | 'medium' | 'high';
  index?: number;
}

export function Card({ children, style, elevation = 'medium' }: CardProps) {
  const { theme } = useTheme();

  const shadowStyles = {
    low: {
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    medium: {
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    high: {
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          ...shadowStyles[elevation],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  },
});
