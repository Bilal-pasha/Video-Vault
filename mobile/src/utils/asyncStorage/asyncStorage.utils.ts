import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic function to get a value from AsyncStorage
export const getItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

// Generic function to set a value in AsyncStorage
export const setItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Handle error
  }
};

// Generic function to remove a value from AsyncStorage
export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Handle error
  }
};

// Generic function to remove multiple values from AsyncStorage
export const multiRemove = async (keys: string[]): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // Handle error
  }
};