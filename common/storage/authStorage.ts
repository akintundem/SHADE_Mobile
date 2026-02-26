import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth:token';
const ID_TOKEN_KEY = 'auth:idToken';
const REFRESH_TOKEN_KEY = 'auth:refreshToken';
const USER_KEY = 'auth:user';

let memoryToken: string | null = null;
let memoryIdToken: string | null = null;
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

export async function setIdToken(token: string) {
  memoryIdToken = token;
  await AsyncStorage.setItem(ID_TOKEN_KEY, token);
}

export async function getIdToken(): Promise<string | null> {
  if (memoryIdToken) {
    return memoryIdToken;
  }
  const token = await AsyncStorage.getItem(ID_TOKEN_KEY);
  memoryIdToken = token;
  return token;
}

export async function clearIdToken() {
  memoryIdToken = null;
  await AsyncStorage.removeItem(ID_TOKEN_KEY);
}

// Clear all auth data
export async function clearAllAuth() {
  memoryToken = null;
  memoryIdToken = null;
  memoryRefreshToken = null;
  await Promise.all([
    AsyncStorage.removeItem(TOKEN_KEY),
    AsyncStorage.removeItem(ID_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    AsyncStorage.removeItem(USER_KEY),
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

export async function setRefreshToken(refreshToken: string) {
  memoryRefreshToken = refreshToken;
  // Persist for Auth0 token refresh
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken(): Promise<string | null> {
  if (memoryRefreshToken) {
    return memoryRefreshToken;
  }
  const token = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  memoryRefreshToken = token;
  return token;
}

export async function clearRefreshToken() {
  memoryRefreshToken = null;
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
}
