import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Radii, Shadows, webGradient, webInteractive } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  icon,
}) => {
  const getVariantStyle = (): ViewStyle => {
    if (disabled) return { backgroundColor: '#CBD5E1' };
    switch (variant) {
      case 'secondary':
        return { backgroundColor: Colors.secondary };
      case 'danger':
        return { backgroundColor: Colors.danger };
      case 'outline':
        return {
          backgroundColor: Colors.cardBg,
          borderWidth: 1.5,
          borderColor: Colors.primary,
        };
      default:
        return webGradient(Colors.primary, Colors.secondary, 135);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant !== 'outline' && !disabled && Shadows.sm,
        getVariantStyle(),
        webInteractive,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon}
          <Text
            style={[
              styles.text,
              variant === 'outline' && { color: Colors.primary },
              disabled && { color: '#64748B' },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
