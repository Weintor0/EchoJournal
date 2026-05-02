import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { request } from './entries';

const SESSION_STORAGE_KEY = 'personal-media-journal-session';
const SESSION_FILE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}session.json`
  : '';

function canUseWebStorage() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage;
}

async function readJsonFile(fileUri, fallbackValue) {
  if (!fileUri) return fallbackValue;

  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    return fallbackValue;
  }

  const fileContents = await FileSystem.readAsStringAsync(fileUri);

  if (!fileContents.trim()) {
    return fallbackValue;
  }

  return JSON.parse(fileContents);
}

async function writeJsonFile(fileUri, value) {
  if (!fileUri) return;

  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(value));
}

async function readSession() {
  if (canUseWebStorage()) {
    const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  }

  return readJsonFile(SESSION_FILE_URI, null);
}

async function writeSession(value) {
  if (canUseWebStorage()) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
    return;
  }

  await writeJsonFile(SESSION_FILE_URI, value);
}

async function clearSession() {
  if (canUseWebStorage()) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  if (SESSION_FILE_URI) {
    await FileSystem.deleteAsync(SESSION_FILE_URI, { idempotent: true });
  }
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

export async function registerUser({ name, surname, email, password }) {
  const user = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      surname,
      email: normalizeEmail(email),
      password,
    }),
  });

  await writeSession({ userId: user.id });

  return user;
}

export async function loginUser({ email, password }) {
  const user = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: normalizeEmail(email),
      password,
    }),
  });

  await writeSession({ userId: user.id });

  return user;
}

export async function getCurrentUser() {
  const session = await readSession();

  if (!session?.userId) {
    return null;
  }

  try {
    return await request(`/auth/users/${session.userId}`);
  } catch {
    return null;
  }
}

export async function updateProfilePicture(userId, profilePicture) {
  return request(`/auth/users/${userId}/profile-picture`, {
    method: 'PUT',
    body: JSON.stringify({ profilePicture }),
  });
}

export async function logoutUser() {
  await clearSession();
}
