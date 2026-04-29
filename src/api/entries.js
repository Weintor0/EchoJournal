import Constants from "expo-constants";
import { Platform } from "react-native";

function getApiBaseUrl() {
  const configuredBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()) {
    return configuredBaseUrl.replace(/\/$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  const host = typeof hostUri === "string" ? hostUri.split(":")[0] : "";
  if (host) {
    return `http://${host}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const API_BASE_URL = getApiBaseUrl();

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

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
