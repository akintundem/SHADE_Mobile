import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth:token';
const USER_KEY = 'auth:user';

let memoryToken: string | null = null;

export async function setToken(token: string) {
  console.log('💾 Saving token to storage:', token.substring(0, 20) + '...');
  memoryToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  console.log('✅ Token saved successfully');
}

export async function getToken(): Promise<string | null> {
  if (memoryToken) {
    console.log('🔐 Using memory token:', memoryToken.substring(0, 20) + '...');
    return memoryToken;
  }
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  memoryToken = token;
  if (token) {
    console.log('🔐 Retrieved token from storage:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️  No token found in storage');
  }
  return token;
}

export async function clearToken() {
  memoryToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function setUser(user: unknown) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser<T = unknown>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

