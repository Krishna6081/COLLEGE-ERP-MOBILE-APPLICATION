import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';
import { Radii, Shadows } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.lg,
    padding: 18,
    marginVertical: 7,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
});
