/**
 * CORE API SERVICE MODULE
 * Handles all direct Django REST API communication.
 * NO Next.js API routes - Direct browser → Django backend only.
 */

// env ফাইল না বদলে NEXT_PUBLIC_BACKEND_URL অথবা NEXT_PUBLIC_API_BASE_URL থেকে URL ধরে নিবে
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");

export const STATIC_API_KEY =
  process.env.NEXT_PUBLIC_STATIC_API_KEY || "agrivet-secret-lifetime-key-2026";

export type AuthRecord = {
  access: string;
  refresh?: string;
  role?: string;
  username?: string;
};

export type ApiErrorResponse = {
  detail?: string;
  message?: string;
  error?: string;
  non_field_errors?: string[];
  [key: string]: any;
};

export type GuestRequestResponse = {
  request_id: number;
  status: "PENDING" | "MEETING_CREATED";
  problem: string;
  phone?: string;
  message: string;
  farmer_join_link?: string;
};

export type GuestSubmitResponse = {
  success: boolean;
  request_id: number;
  status: string;
  message: string;
  phone: string;
  problem: string;
};

// ============================================================================
// AUTH MANAGEMENT
// ============================================================================

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

const AUTH_CHANGED_EVENT = "agrivet-auth-changed";

export function saveAuth(auth: AuthRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("agrivet_auth", JSON.stringify(auth));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("agrivet_auth");
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthToken(): string | null {
  const auth = getStoredAuth();
  return auth?.access || null;
}

// ============================================================================
// HEADERS & REQUEST UTILITIES
// ============================================================================

export function getAuthHeaders(includeJson = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (includeJson) headers["Content-Type"] = "application/json";

  const auth = getStoredAuth();
  if (auth?.access) {
    headers.Authorization = `Bearer ${auth.access}`;
  }

  if (STATIC_API_KEY) {
    headers["X-API-KEY"] = STATIC_API_KEY;
  }

  return headers;
}

export function buildUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

// ============================================================================
// GENERIC FETCH UTILITY
// ============================================================================

export async function fetchJson<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const url = buildUrl(path);
  const headers = new Headers(options.headers ?? {});

  if (withAuth) {
    const auth = getStoredAuth();
    if (auth?.access) {
      headers.set("Authorization", `Bearer ${auth.access}`);
    }
  }

  if (STATIC_API_KEY && !headers.has("X-API-KEY")) {
    headers.set("X-API-KEY", STATIC_API_KEY);
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

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

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
  // ডাইরেক্ট এন্ডপয়েন্ট কল
  return fetchJson<{ success?: boolean; message?: string; access?: string; refresh?: string; role?: string; username?: string; detail?: string }>(
    "/auth/signup/",
    {
      method: "POST",
      body: JSON.stringify({ phone, fullName, password, role }),
    },
    false,
  );
}

export async function login(username: string, password: string) {
  return fetchJson<{ 
    access?: string; 
    refresh?: string; 
    role?: string; 
    username?: string; 
    detail?: string; 
    message?: string; 
  }>(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    false,
  );
}

export async function register(data: {
  phone: string;
  fullName: string;
  password: string;
  role: string;
}) {
  return registerWithBackend(data);
}

export async function logout() {
  clearAuth();
  return { success: true };
}

// ============================================================================
// FARMER ENDPOINTS
// ============================================================================

export async function getFarmerDashboard() {
  return fetchJson<any>("/farmer/dashboard/", { method: "GET" }, true);
}

export async function getFarmerProfile() {
  return fetchJson<any>("/farmer/profile/", { method: "GET" }, true);
}

export async function updateFarmerProfile(data: any) {
  return fetchJson<any>(
    "/farmer/profile/",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true,
  );
}

export async function getFarmerRequests() {
  return fetchJson<any>("/farmer/requests/", { method: "GET" }, true);
}

export async function getFarmerRequest(requestId: number) {
  return fetchJson<any>(`/farmer/requests/${requestId}/`, { method: "GET" }, true);
}

// ============================================================================
// VET ENDPOINTS
// ============================================================================

export async function getVetDashboard() {
  return fetchJson<any>("/vet/dashboard/", { method: "GET" }, true);
}

export async function getVetProfile() {
  return fetchJson<any>("/vet/profile/", { method: "GET" }, true);
}

export async function updateVetProfile(data: any) {
  return fetchJson<any>(
    "/vet/profile/",
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true,
  );
}

export async function getVetConsultations() {
  return fetchJson<any>("/vet/consultations/", { method: "GET" }, true);
}

export async function getVetConsultation(consultationId: number) {
  return fetchJson<any>(`/vet/consultations/${consultationId}/`, { method: "GET" }, true);
}

// ============================================================================
// MEETING/VIDEO CALL ENDPOINTS
// ============================================================================

export async function createMeeting() {
  return fetchJson<{ 
    success?: boolean; 
    meeting?: any; 
    farmer?: any; 
    vet?: any 
  }>(
    "/meeting/create/",
    { method: "POST" },
    true,
  );
}

export async function getMeeting(meetingId: string | number) {
  return fetchJson<any>(`/meeting/${meetingId}/`, { method: "GET" }, true);
}

export async function updateMeetingStatus(
  meetingId: string | number,
  status: string,
) {
  return fetchJson<any>(
    `/meeting/${meetingId}/update-status/`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
    true,
  );
}

// ============================================================================
// GUEST REQUEST ENDPOINTS (FIXED - NO AUTH REQUIREMENT)
// ============================================================================

export async function submitGuestRequest(phone: string, problem: string) {
  return fetchJson<{
    success?: boolean;
    request_id?: number;
    status?: string;
    message?: string;
    phone?: string;
    problem?: string;
    farmer_join_link?: string;
  }>(
    "/guest/request/",
    {
      method: "POST",
      body: JSON.stringify({
        phone: phone.replace(/[^\d+]/g, ""),
        problem,
      }),
    },
    false, // explicitly disable auth
  );
}

export async function getGuestRequest(requestId: number | string) {
  return fetchJson<any>(
    `/guest/request/${requestId}/`,
    { method: "GET", cache: "no-store" },
    false,
  );
}

export async function pollGuestRequest(requestId: number | string) {
  return fetchJson<any>(
    `/guest/request/${requestId}/poll/`,
    { method: "GET", cache: "no-store" },
    false,
  );
}

// ============================================================================
// JWT DECODING & PROFILE FETCHING
// ============================================================================

export function decodeJwt(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    return decoded;
  } catch {
    console.error("[JWT Decode] Failed to decode JWT");
    return null;
  }
}

export async function fetchUserProfile(): Promise<{ role?: string; username?: string; id?: number } | null> {
  try {
    const auth = getStoredAuth();
    if (!auth?.access) {
      console.warn("[Profile Fetch] No auth token available");
      return null;
    }

    const profile = await fetchJson<{ role?: string; username?: string; id?: number }>(
      "/profile/",
      { method: "GET" },
      true
    );

    console.log("[Profile Fetch] Success:", { role: profile?.role, username: profile?.username });
    return profile || null;
  } catch (error) {
    console.error("[Profile Fetch] Failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

// ============================================================================
// ERROR HANDLING UTILITY
// ============================================================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object") {
    const err = error as any;
    return (
      err.detail ??
      err.message ??
      err.error ??
      JSON.stringify(error)
    );
  }
  return "An unexpected error occurred";
}