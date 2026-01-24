import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_LINK_KEY = 'pending_saved_link';

export const pendingLinkStorage = {
  async get(): Promise<string | null> {
    return AsyncStorage.getItem(PENDING_LINK_KEY);
  },

  async set(url: string): Promise<void> {
    await AsyncStorage.setItem(PENDING_LINK_KEY, url);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(PENDING_LINK_KEY);
  },
};
