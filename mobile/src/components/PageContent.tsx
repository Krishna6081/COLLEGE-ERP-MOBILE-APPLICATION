import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Layout } from '../constants/theme';

interface PageContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const PageContent: React.FC<PageContentProps> = ({ children, style }) => (
  <View style={[styles.inner, style]}>{children}</View>
);

const styles = StyleSheet.create({
  inner: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
  },
});
