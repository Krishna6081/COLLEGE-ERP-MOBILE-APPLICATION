import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const hostFrom = (uri?: string | null): string | undefined => {
  if (!uri) return undefined;
  const host = uri
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, '')
    .split('/')[0]
    .replace(/:\d+$/, '');

  if (!host || host === 'localhost' || host === '127.0.0.1') return undefined;
  return host;
};

/**
 * Dynamically resolves the development machine's IP address.
 * When a mobile phone connects to Expo over Hotspot or Wi-Fi,
 * NativeModules.SourceCode.scriptURL contains the laptop's host IP (e.g. 10.98.161.149:8081).
 */
const getDevHost = (): string => {
  // On web, hostUri / scriptURL contain the LAN/hotspot IP that the Expo CLI
  // advertises for physical devices. That address is unreachable from the browser
  // itself, so we skip those sources entirely and fall through to window.location.
  if (Platform.OS !== 'web') {
    const expoHost = hostFrom(Constants.expoConfig?.hostUri);
    if (expoHost) return expoHost;

    try {
      const bundleHost = hostFrom(NativeModules.SourceCode?.scriptURL);
      if (bundleHost) return bundleHost;
    } catch {
      // The platform-specific fallback below handles simulator builds.
    }
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }

  // Android emulators reach the host machine through this reserved bridge address.
  // For a physical device without Expo host metadata, set EXPO_PUBLIC_API_URL.
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const devHost = getDevHost();

const DEV_API_URL = `http://${devHost}:5000/api/v1`;

export const API_CONFIG = {
  // On web: always use the localhost-derived URL — EXPO_PUBLIC_API_URL holds the
  // hotspot IP for physical devices and is unreachable from a browser on localhost.
  // On native: prefer EXPO_PUBLIC_API_URL (set in .env for hotspot/LAN access).
  BASE_URL: Platform.OS === 'web' ? DEV_API_URL : (process.env.EXPO_PUBLIC_API_URL || DEV_API_URL),
  TIMEOUT: 15000,
};
