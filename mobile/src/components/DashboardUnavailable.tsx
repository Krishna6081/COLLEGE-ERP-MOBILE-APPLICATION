import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

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
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>
      {message || 'Could not load this dashboard. Check your connection and try again.'}
    </Text>
    <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.button}>
      <Text style={styles.buttonText}>Try again</Text>
    </TouchableOpacity>
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
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
