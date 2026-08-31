/**
 * AUTHENTICATION API SERVICE
 * Handles user login, registration, token refresh, and logout.
 * Direct Django backend calls only - NO Next.js API routes.
 */

import {
  API_BASE_URL,
  STATIC_API_KEY,
  fetchJson,
  getAuthHeaders,
  saveAuth,
  clearAuth,
  AuthRecord,
} from "./api";

// ============================================================================
// USER LOGIN
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends AuthRecord {
  message?: string;
}

/**
 * Authenticate user with Django backend
 * Stores access token and role in localStorage
 */
export async function userLogin(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetchJson<LoginResponse>(
    "/auth/login/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    false // No auth needed for login
  );

  // Save credentials to localStorage
  if (response.access) {
    saveAuth({
      access: response.access,
      refresh: response.refresh,
      role: response.role,
      username: response.username || payload.username,
    });
  }

  return response;
}

// ============================================================================
// USER REGISTRATION
// ============================================================================

export interface SignupRequest {
  phone: string;
  full_name?: string;
  password: string;
  role: "farmer" | "vet";
}

export interface SignupResponse {
  success?: boolean;
  message?: string;
  access?: string;
  refresh?: string;
  username?: string;
  role?: string;
}

/**
 * Register new user with Django backend
 */
export async function userSignup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await fetchJson<SignupResponse>(
    "/auth/signup/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    false
  );

  // Auto-login after successful signup if access token provided
  if (response.access) {
    saveAuth({
      access: response.access,
      refresh: response.refresh,
      role: response.role,
      username: response.username,
    });
  }

  return response;
}

// ============================================================================
// TOKEN REFRESH
// ============================================================================

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

/**
 * Refresh expired access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return fetchJson<RefreshTokenResponse>(
    "/auth/token/refresh/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    },
    false
  );
}

// ============================================================================
// USER LOGOUT
// ============================================================================

/**
 * Clear local authentication state
 * Backend doesn't require logout endpoint for stateless JWT
 */
export function userLogout(): void {
  clearAuth();
}

// ============================================================================
// VERIFY TOKEN
// ============================================================================

export interface TokenVerifyRequest {
  token: string;
}

export interface TokenVerifyResponse {
  valid: boolean;
}

/**
 * Verify if current token is still valid
 */
export async function verifyToken(token: string): Promise<TokenVerifyResponse> {
  try {
    await fetchJson<any>(
      "/auth/token/verify/",
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ token }),
      },
      false
    );
    return { valid: true };
  } catch (error) {
    return { valid: false };
  }
}

// ============================================================================
// CURRENT USER
// ============================================================================

export interface CurrentUser {
  id: number;
  username: string;
  email?: string;
  role: "farmer" | "vet";
  phone?: string;
  full_name?: string;
  profile_picture?: string;
}

/**
 * Fetch current authenticated user details
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  return fetchJson<CurrentUser>(
    "/auth/user/",
    { method: "GET" },
    true // Requires authentication
  );
}

// ============================================================================
// PASSWORD CHANGE
// ============================================================================

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Change user password
 */
export async function changePassword(payload: ChangePasswordRequest): Promise<any> {
  return fetchJson<any>(
    "/auth/password/change/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    },
    true
  );
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

/**
 * Request password reset (sends email)
 */
export async function requestPasswordReset(email: string): Promise<any> {
  return fetchJson<any>(
    "/auth/password/reset/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    },
    false
  );
}

/**
 * Confirm password reset with token
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<any> {
  return fetchJson<any>(
    "/auth/password/reset/confirm/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, new_password: newPassword }),
    },
    false
  );
}