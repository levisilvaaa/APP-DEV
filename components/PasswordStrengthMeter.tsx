import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (pwd.length === 0) {
      return { score: 0, label: '', color: '#e2e8f0' };
    }

    let score = 0;

    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Fraca', color: '#ef4444' };
    if (score <= 4) return { score: 2, label: 'Média', color: '#f59e0b' };
    return { score: 3, label: 'Forte', color: '#10b981' };
  };

  const strength = calculateStrength(password);

  if (password.length === 0) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              {
                backgroundColor: bar <= strength.score ? strength.color : '#e2e8f0',
              },
            ]}
          />
        ))}
      </View>
      {strength.label && (
        <Text style={[styles.label, { color: strength.color }]}>
          Força: {strength.label}
        </Text>
      )}
      <View style={styles.requirements}>
        <Text style={[
          styles.requirement,
          password.length >= 8 ? styles.requirementMet : styles.requirementUnmet
        ]}>
          {password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
        </Text>
        <Text style={[
          styles.requirement,
          /[A-Z]/.test(password) ? styles.requirementMet : styles.requirementUnmet
        ]}>
          {/[A-Z]/.test(password) ? '✓' : '○'} Letra maiúscula
        </Text>
        <Text style={[
          styles.requirement,
          /[a-z]/.test(password) ? styles.requirementMet : styles.requirementUnmet
        ]}>
          {/[a-z]/.test(password) ? '✓' : '○'} Letra minúscula
        </Text>
        <Text style={[
          styles.requirement,
          /\d/.test(password) ? styles.requirementMet : styles.requirementUnmet
        ]}>
          {/\d/.test(password) ? '✓' : '○'} Número
        </Text>
        <Text style={[
          styles.requirement,
          /[^a-zA-Z0-9]/.test(password) ? styles.requirementMet : styles.requirementUnmet
        ]}>
          {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Caractere especial
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirements: {
    gap: 4,
  },
  requirement: {
    fontSize: 12,
  },
  requirementMet: {
    color: '#10b981',
  },
  requirementUnmet: {
    color: '#94a3b8',
  },
});
