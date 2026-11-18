import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { RefreshCw, Plus } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Layout, Shadows, webGradient, webInteractive } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRightPress?: () => void;
  rightIconLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRightPress, rightIconLabel }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= Layout.desktopBreakpoint;
  const label = rightIconLabel || 'Refresh';
  const isAddAction = label.includes('+') || label.toLowerCase().includes('new') || label.toLowerCase().includes('add');

  if (isDesktop) {
    return (
      <View style={styles.desktopBar}>
        <View style={styles.desktopInner}>
          <View style={styles.titleContainer}>
            <View style={styles.desktopTitleRow}>
              <View style={styles.accentBar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.desktopTitle} numberOfLines={1}>{title}</Text>
                {subtitle ? <Text style={styles.desktopSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
              </View>
            </View>
          </View>
          {onRightPress ? (
            <TouchableOpacity
              style={[styles.desktopActionBtn, webInteractive, isAddAction && styles.desktopActionPrimary]}
              onPress={onRightPress}
              activeOpacity={0.8}
            >
              {isAddAction ? (
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <RefreshCw size={14} color={Colors.primary} strokeWidth={2.3} />
              )}
              <Text style={[styles.desktopActionText, isAddAction && styles.desktopActionPrimaryText]}>
                {label.replace(/^\+\s*/, '')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.mobileContainer, webGradient(Colors.primary, Colors.secondary, 135)]}>
      <View style={styles.titleContainer}>
        <Text style={styles.mobileTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.mobileSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {onRightPress ? (
        <TouchableOpacity
          style={[styles.mobileActionBtn, webInteractive]}
          onPress={onRightPress}
          activeOpacity={0.8}
        >
          {isAddAction ? (
            <Plus size={14} color="#FFFFFF" strokeWidth={2.5} />
          ) : (
            <RefreshCw size={13} color="#FFFFFF" strokeWidth={2.3} />
          )}
          <Text style={styles.mobileActionText}>{label.replace(/^\+\s*/, '')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop SaaS Top Bar
  desktopBar: {
    backgroundColor: Colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 16,
    paddingHorizontal: 28,
    ...Shadows.sm,
  },
  desktopInner: {
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  desktopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accentBar: {
    width: 4,
    height: 34,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  desktopTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  desktopSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  desktopActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  desktopActionPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  desktopActionText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  desktopActionPrimaryText: {
    color: '#FFFFFF',
  },

  // Mobile / Tablet Gradient Header
  mobileContainer: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'web' ? 22 : 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 12,
    ...Shadows.md,
  },
  titleContainer: {
    flex: 1,
  },
  mobileTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  mobileSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.84)',
    marginTop: 3,
    fontWeight: '500',
  },
  mobileActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
  },
  mobileActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
