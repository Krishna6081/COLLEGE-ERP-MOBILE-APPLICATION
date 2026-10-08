import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'college_erp_access_token',
  REFRESH_TOKEN: 'college_erp_refresh_token',
  USER_DATA: 'college_erp_user_data',
};

// Memory fallback for web or non-supported secure environments
const memoryStorage: Record<string, string> = {};

export class StorageService {
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        memoryStorage[key] = value;
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      memoryStorage[key] = value;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return memoryStorage[key] || null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return memoryStorage[key] || null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        delete memoryStorage[key];
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      delete memoryStorage[key];
    }
  }

  static async setAccessToken(token: string) {
    await this.setItem(KEYS.ACCESS_TOKEN, token);
  }

  static async getAccessToken(): Promise<string | null> {
    return await this.getItem(KEYS.ACCESS_TOKEN);
  }

  static async setRefreshToken(token: string) {
    await this.setItem(KEYS.REFRESH_TOKEN, token);
  }

  static async getRefreshToken(): Promise<string | null> {
    return await this.getItem(KEYS.REFRESH_TOKEN);
  }

  static async clearAll() {
    await this.removeItem(KEYS.ACCESS_TOKEN);
    await this.removeItem(KEYS.REFRESH_TOKEN);
    await this.removeItem(KEYS.USER_DATA);
  }
}
