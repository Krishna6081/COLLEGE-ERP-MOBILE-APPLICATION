import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const isTunnelHost = (host: string): boolean =>
  /\.(exp\.direct|ngrok\.io|ngrok-free\.app|ngrok\.app)$/i.test(host);

const hostFrom = (uri?: string | null): string | undefined => {
  if (!uri) return undefined;
  const host = uri
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, '')
    .split('/')[0]
    .replace(/:\d+$/, '');

  if (!host || host === 'localhost' || host === '127.0.0.1' || isTunnelHost(host)) {
    return undefined;
  }
  return host;
};

/**
 * Dynamically resolves the laptop's live LAN / mobile-hotspot IP from Expo Go metadata.
 * When a physical phone opens the app over Wi-Fi or Mobile Hotspot, Expo Go already
 * connects to Metro on the laptop's live IP (e.g. 10.59.186.149:8081).
 */
const getLiveExpoLanHost = (): string | undefined => {
  if (Platform.OS === 'web') return undefined;

  const candidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any)?.expoGoConfig?.debuggerHost,
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any)?.manifest?.debuggerHost,
  ];

  for (const candidate of candidates) {
    const host = hostFrom(candidate);
    if (host) return host;
  }

  try {
    const bundleHost = hostFrom(NativeModules.SourceCode?.scriptURL);
    if (bundleHost) return bundleHost;
  } catch {
    // Fall back below
  }

  return undefined;
};

const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    const webHost = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
    return `http://${webHost}:5000/api/v1`;
  }

  // On physical devices in dev mode, prefer Expo's live LAN/hotspot IP so changing
  // hotspot IPs never get stuck on a stale EXPO_PUBLIC_API_URL in .env.
  if (__DEV__) {
    const liveLanHost = getLiveExpoLanHost();
    if (liveLanHost) {
      return `http://${liveLanHost}:5000/api/v1`;
    }
  }

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${fallbackHost}:5000/api/v1`;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 15000,
};
