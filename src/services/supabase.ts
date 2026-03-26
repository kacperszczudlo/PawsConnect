
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;
const memoryStorage = new Map<string, string>();

let warnedAboutAsyncStorage = false;

const warnAsyncStorageFallback = (error: unknown) => {
	if (!warnedAboutAsyncStorage) {
		warnedAboutAsyncStorage = true;
		console.warn('[supabase] AsyncStorage unavailable, using in-memory auth storage.', error);
	}
};

const safeStorage = {
	getItem: async (key: string) => {
		try {
			return await AsyncStorage.getItem(key);
		} catch (error) {
			warnAsyncStorageFallback(error);
			return memoryStorage.get(key) ?? null;
		}
	},
	setItem: async (key: string, value: string) => {
		try {
			await AsyncStorage.setItem(key, value);
		} catch (error) {
			warnAsyncStorageFallback(error);
			memoryStorage.set(key, value);
		}
	},
	removeItem: async (key: string) => {
		try {
			await AsyncStorage.removeItem(key);
		} catch (error) {
			warnAsyncStorageFallback(error);
			memoryStorage.delete(key);
		}
	},
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be set in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: safeStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
