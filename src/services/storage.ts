import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  },
  deleteItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },
};

export const tokenStorage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') return webStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      webStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      webStorage.deleteItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
