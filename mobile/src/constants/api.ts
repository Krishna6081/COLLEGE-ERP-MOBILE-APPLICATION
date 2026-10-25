import { Platform } from 'react-native';

// Local Wi-Fi LAN IP to enable direct connection from physical devices running Expo Go
const LAN_API_URL = 'http://192.168.31.252:5000/api/v1';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || LAN_API_URL,
  TIMEOUT: 15000,
};
