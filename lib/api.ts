export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://194.238.22.134:8000/api";

export type AuthRecord = {
  access: string;
  refresh?: string;
  role?: string;
  username?: string;
};

export function normalizeRole(role?: string): "farmer" | "vet" {
  const value = (role ?? "").toString().trim().toLowerCase();
  if (value === "vet" || value === "veterinarian" || value === "doctor") return "vet";
  return "farmer";
}

export function getStoredAuth(): AuthRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("agrivet_auth");
    if (!raw) return null;
    return JSON.parse(raw) as AuthRecord;
  } catch {
    return null;
  }
}

export function saveAuth(auth: AuthRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("agrivet_auth", JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("agrivet_auth");
}

export function getAuthHeaders(includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";
  const auth = getStoredAuth();
  if (auth?.access) {
    headers.Authorization = `Bearer ${auth.access}`;
  }
  return headers;
}

export async function fetchJson<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers ?? {});

  if (withAuth) {
    const auth = getStoredAuth();
    if (auth?.access) {
      headers.set("Authorization", `Bearer ${auth.access}`);
    }
  }

  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? data?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export async function loginWithBackend({ username, password }: { username: string; password: string }) {
  return fetchJson<{ access?: string; refresh?: string; role?: string; username?: string; detail?: string; message?: string; }>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );
}

export async function registerWithBackend({ phone, fullName, password, role }: { phone: string; fullName: string; password: string; role: string }) {
  const candidateEndpoints = ["/auth/register/", "/auth/signup/"];

  let lastError: Error | null = null;

  for (const endpoint of candidateEndpoints) {
    try {
      return await fetchJson<{ success?: boolean; message?: string; access?: string; refresh?: string; role?: string; username?: string; detail?: string }>(
        endpoint,
        {
          method: "POST",
          body: JSON.stringify({ phone, fullName, password, role }),
        },
        false,
      );
    } catch (error) {
      lastError = error as Error;
    }
  }

  throw lastError ?? new Error("Unable to create account.");
}

export async function createMeeting() {
  return fetchJson<{ success?: boolean; meeting?: unknown; farmer?: unknown; vet?: unknown }>("/meeting/create/", {
    method: "POST",
  });
}