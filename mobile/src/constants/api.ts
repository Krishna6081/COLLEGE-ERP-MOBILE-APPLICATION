import { Platform, NativeModules } from 'react-native';

/**
 * Dynamically resolves the development machine's IP address.
 * When a mobile phone connects to Expo over Hotspot or Wi-Fi,
 * NativeModules.SourceCode.scriptURL contains the laptop's host IP (e.g. 10.98.161.149:8081).
 */
const getDevHost = (): string => {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
      if (address && address !== 'localhost' && address !== '127.0.0.1') {
        return address;
      }
    }
  } catch (e) {
    // ignore
  }

  // Active Mobile Hotspot IP address
  return '10.98.161.149';
};

const devHost = getDevHost();

const DEV_API_URL = `http://${devHost}:5000/api/v1`;

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || DEV_API_URL,
  TIMEOUT: 15000,
};
