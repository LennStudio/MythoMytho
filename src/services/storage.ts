import AsyncStorage from '@react-native-async-storage/async-storage';

/** Lecture JSON tolérante : toute erreur ou donnée corrompue retombe sur `fallback`. */
export async function loadJson<T>(key: string, parse: (raw: unknown) => T, fallback: T): Promise<T> {
  try {
    const text = await AsyncStorage.getItem(key);
    return text === null ? fallback : parse(JSON.parse(text) as unknown);
  } catch {
    return fallback;
  }
}
export async function saveJson(key: string, value: unknown): Promise<void> {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch { /* quota / stockage indisponible */ }
}
export async function loadRaw(key: string): Promise<string | null> {
  try { return await AsyncStorage.getItem(key); } catch { return null; }
}
export async function saveRaw(key: string, value: string): Promise<void> {
  try { await AsyncStorage.setItem(key, value); } catch { /* ignoré */ }
}
