import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Radii, Shadows, webGradient, webInteractive } from '../constants/theme';

type DashboardUnavailableProps = {
  title: string;
  message?: string;
  onRetry: () => void;
};

export const DashboardUnavailable: React.FC<DashboardUnavailableProps> = ({
  title,
  message,
  onRetry,
}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <AlertCircle size={28} color={Colors.danger} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>
        {message || 'Could not load this dashboard. Check your connection and try again.'}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onRetry}
        style={[styles.button, webGradient(Colors.primary, Colors.secondary, 135), webInteractive]}
        activeOpacity={0.85}
      >
        <RefreshCw size={15} color="#FFFFFF" strokeWidth={2.2} />
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.cardBg,
    borderRadius: Radii.xl,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: Radii.md,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
