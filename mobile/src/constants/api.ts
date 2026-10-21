import { Platform } from 'react-native';

// Standard Local Machine Fallback IP / Port
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api/v1',
  ios: 'http://localhost:5000/api/v1',
  default: 'http://localhost:5000/api/v1',
});

export const API_CONFIG = {
  BASE_URL: 'http://10.132.197.240:5000/api/v1',
  TIMEOUT: 15000,
};