/**
 * DailyDock — MMKV Storage Service
 *
 * Type-safe wrapper around react-native-mmkv v4 for persistent local storage.
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/** Storage instances — separate for each domain */
const instances: Record<string, MMKV> = {};

function getInstance(name: string): MMKV {
  if (!instances[name]) {
    instances[name] = createMMKV({ id: `dailydock-${name}` });
  }
  return instances[name]!;
}

/** Default app storage instance */
export const appStorage = createMMKV({ id: 'dailydock-app' });

/** Get a typed value from storage */
export function getItem<T>(key: string, store: string = 'app'): T | null {
  const instance = getInstance(store);
  const value = instance.getString(key);
  if (value === undefined) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Set a typed value to storage */
export function setItem<T>(key: string, value: T, store: string = 'app'): void {
  const instance = getInstance(store);
  instance.set(key, JSON.stringify(value));
}

/** Remove a value from storage */
export function removeItem(key: string, store: string = 'app'): void {
  const instance = getInstance(store);
  instance.remove(key);
}

/** Check if a key exists */
export function hasItem(key: string, store: string = 'app'): boolean {
  const instance = getInstance(store);
  return instance.contains(key);
}

/** Get all keys in a store */
export function getAllKeys(store: string = 'app'): string[] {
  const instance = getInstance(store);
  return instance.getAllKeys();
}

/** Clear all data in a store */
export function clearStore(store: string = 'app'): void {
  const instance = getInstance(store);
  instance.clearAll();
}

/** Clear ALL stores */
export function clearAllStores(): void {
  const storeNames = ['app', 'tasks', 'habits', 'settings', 'analytics'];
  storeNames.forEach(name => {
    try {
      clearStore(name);
    } catch {
      // Store might not exist yet
    }
  });
}

/**
 * Zustand MMKV storage adapter.
 * Pass to Zustand's persist middleware for automatic MMKV persistence.
 */
export function createMMKVStorage(storeName: string): StateStorage {
  const instance = getInstance(storeName);
  return {
    getItem: (key: string): string | null => {
      const value = instance.getString(key);
      return value ?? null;
    },
    setItem: (key: string, value: string): void => {
      instance.set(key, value);
    },
    removeItem: (key: string): void => {
      instance.remove(key);
    },
  };
}
