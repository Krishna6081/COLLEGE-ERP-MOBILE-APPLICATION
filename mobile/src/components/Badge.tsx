import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label?: string;
  text?: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ label, text, type, variant }) => {
  const badgeText = label || text || '';
  const badgeType = type || variant || 'primary';

  const getStyles = () => {
    switch (badgeType) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'danger':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'info':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'neutral':
        return { bg: '#F1F5F9', text: '#64748B' };
      default:
        return { bg: '#DBEAFE', text: '#1D4ED8' };
    }
  };

  const style = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{badgeText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
