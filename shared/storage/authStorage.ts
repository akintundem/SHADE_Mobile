import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth:token';
const REFRESH_TOKEN_KEY = 'auth:refreshToken';
const USER_KEY = 'auth:user';
const DEVICE_ID_KEY = 'auth:deviceId';

let memoryToken: string | null = null;
let memoryRefreshToken: string | null = null;

export async function setToken(token: string) {
  memoryToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (memoryToken) {
    return memoryToken;
  }
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  memoryToken = token;

  return token;
}

export async function clearToken() {
  memoryToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Clear all auth data
export async function clearAllAuth() {
  memoryToken = null;
  memoryRefreshToken = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
    AsyncStorage.removeItem(DEVICE_ID_KEY),
  ]);
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

export async function setDeviceId(deviceId: string) {
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
}

export async function getDeviceId(): Promise<string | null> {
  return await AsyncStorage.getItem(DEVICE_ID_KEY);
}

export async function clearDeviceId() {
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
}

export async function setRefreshToken(refreshToken: string) {
  memoryRefreshToken = refreshToken;
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken(): Promise<string | null> {
  if (memoryRefreshToken) {
    return memoryRefreshToken;
  }
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  memoryRefreshToken = refreshToken;
  return refreshToken;
}

export async function clearRefreshToken() {
  memoryRefreshToken = null;
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}

