import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiBaseUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  const host = typeof hostUri === "string" ? hostUri.split(":")[0] : "";
  if (__DEV__ && host) {
    return `http://${host}:3000`;
  }

  const configuredBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const API_BASE_URL = getApiBaseUrl();
const REQUEST_TIMEOUT_MS = 10000;

export async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Backend did not respond at ${API_BASE_URL}.`);
    }

    throw new Error(`Could not reach backend at ${API_BASE_URL}.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const fallbackMessage =
      typeof body === "string" && body.trim() ? body.trim() : "Request failed.";
    throw new Error(
      typeof body === "object" && body !== null ? body.error ?? "Request failed." : fallbackMessage
    );
  }

  return body;
}

export function getEntries({ limit } = {}) {
  const query = typeof limit === "number" ? `?limit=${limit}` : "";
  return request(`/entries${query}`);
}

export function getEntryById(id) {
  return request(`/entries/${id}`);
}

export function createEntry(entry) {
  return request("/entries", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export function updateEntry(id, entry) {
  return request(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(entry),
  });
}

export function deleteEntry(id) {
  return request(`/entries/${id}`, {
    method: "DELETE",
  });
}

export { API_BASE_URL };

