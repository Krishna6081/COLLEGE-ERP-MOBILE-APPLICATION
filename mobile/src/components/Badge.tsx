import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

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
        return { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', dot: '#10B981' };
      case 'warning':
        return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', dot: '#F59E0B' };
      case 'danger':
        return { bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C', dot: '#EF4444' };
      case 'info':
        return { bg: '#F0FDFA', border: '#99F6E4', text: '#0F766E', dot: Colors.accent };
      case 'neutral':
        return { bg: '#F1F5F9', border: '#E2E8F0', text: '#475569', dot: '#94A3B8' };
      default:
        return { bg: Colors.primaryLight, border: Colors.primarySoft, text: Colors.primary, dot: Colors.primary };
    }
  };

  const s = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[styles.dot, { backgroundColor: s.dot }]} />
      <Text style={[styles.text, { color: s.text }]} numberOfLines={1}>
        {badgeText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
