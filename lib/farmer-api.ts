/**
 * FARMER API SERVICE
 * Handles all farmer-specific operations (dashboard, profile, requests, etc.)
 * Direct Django backend calls only - NO Next.js API routes.
 */

import { fetchJson, getAuthHeaders, getAuthToken } from "./api";

// ============================================================================
// FARMER PROFILE
// ============================================================================

export interface FarmerProfile {
  id: number;
  username: string;
  email?: string;
  phone: string;
  full_name: string;
  role: "farmer";
  bio?: string;
  location?: string;
  village?: string;
  upazila?: string;
  district?: string;
  profile_picture?: string;
  livestock_types?: string[];
  total_livestock?: number;
  experience_years?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch farmer's profile information
 */
export async function getFarmerProfile(): Promise<FarmerProfile> {
  return fetchJson<FarmerProfile>(
    "/farmer/profile/",
    { method: "GET" },
    true,
  );
}

/**
 * Update farmer's profile
 */
export async function updateFarmerProfile(data: Partial<FarmerProfile>): Promise<FarmerProfile> {
  return fetchJson<FarmerProfile>(
    "/farmer/profile/",
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

// ============================================================================
// FARMER DASHBOARD
// ============================================================================

export interface FarmerDashboardStats {
  total_livestock: number;
  pending_consultations: number;
  completed_consultations: number;
  upcoming_meetings?: number;
  recent_consultations?: any[];
}

/**
 * Fetch farmer dashboard with statistics and recent consultations
 */
export async function getFarmerDashboard(): Promise<FarmerDashboardStats> {
  return fetchJson<FarmerDashboardStats>(
    "/farmer/dashboard/",
    { method: "GET" },
    true,
  );
}

// ============================================================================
// FARMER LIVESTOCK
// ============================================================================

export interface Livestock {
  id: number;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  health_status?: string;
  image_url?: string;
  created_at?: string;
}

/**
 * Fetch farmer's livestock
 */
export async function getFarmerLivestock(): Promise<Livestock[]> {
  return fetchJson<Livestock[]>(
    "/farmer/livestock/",
    { method: "GET" },
    true,
  );
}

/**
 * Add new livestock
 */
export async function addLivestock(data: Partial<Livestock>): Promise<Livestock> {
  return fetchJson<Livestock>(
    "/farmer/livestock/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

/**
 * Update livestock information
 */
export async function updateLivestock(
  livestockId: number,
  data: Partial<Livestock>,
): Promise<Livestock> {
  return fetchJson<Livestock>(
    `/farmer/livestock/${livestockId}/`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

/**
 * Delete livestock
 */
export async function deleteLivestock(livestockId: number): Promise<void> {
  await fetchJson<any>(
    `/farmer/livestock/${livestockId}/`,
    { method: "DELETE" },
    true,
  );
}

// ============================================================================
// FARMER CONSULTATION REQUESTS
// ============================================================================

export interface ConsultationRequest {
  id: number;
  animal_type: string;
  breed?: string;
  gender?: string;
  age?: string;
  health_problem?: string;
  cow_image?: string;
  status: "PENDING" | "ASSIGNED" | "MEETING_CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  assigned_vet?: {
    id: number;
    user: {
      id: number;
      username: string;
      full_name?: string;
    };
    speciality?: string;
  };
  meeting_link?: string;
  link_expires_at?: string;
  is_link_expired?: boolean;
  can_join?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationResponse {
  id: number;
  animal_type: string;
  breed?: string;
  gender?: string;
  age?: string;
  health_problem?: string;
  status: string;
  meeting_link?: string;
  link_expires_at?: string;
  is_link_expired?: boolean;
  can_join?: boolean;
  assigned_vet?: any;
  created_at?: string;
}

/**
 * Create a new tele-health consultation request
 */
export async function createConsultationRequest(data: {
  animal_type: string;
  breed?: string;
  gender?: string;
  age?: string;
  health_problem: string;
  cow_image?: File;
}): Promise<ConsultationRequest> {
  // Explicitly require the FARMER's JWT so a VET token can never be replayed
  // against the farmer request-creation endpoint (no token bleed).
  const token = getAuthToken();
  if (!token) {
    throw new Error(
      "Authentication required. Please sign in with your farmer account.",
    );
  }

  const formData = new FormData();
  formData.append("animal_type", data.animal_type);
  if (data.breed) formData.append("breed", data.breed);
  if (data.gender) formData.append("gender", data.gender);
  if (data.age) formData.append("age", data.age);
  formData.append("health_problem", data.health_problem);
  if (data.cow_image) formData.append("cow_image", data.cow_image);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/farmer/consultation/create/`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(false), // Don't set Content-Type for FormData - let browser set multipart/form-data
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    let message = `Failed to create consultation: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData?.detail ?? errorData?.message ?? message;
    } catch {
      // Non-JSON response body (e.g. an HTML error page) - keep the fallback.
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Get consultation request status (for polling)
 */
export async function getConsultationStatus(
  requestId: number,
): Promise<ConsultationResponse> {
  return fetchJson<ConsultationResponse>(
    `/farmer/consultation/${requestId}/status/`,
    { method: "GET" },
    true,
  );
}

/**
 * Get list of farmer's consultation requests
 */
export async function getFarmerConsultations(): Promise<ConsultationRequest[]> {
  return fetchJson<ConsultationRequest[]>(
    "/farmer/request/list/",
    { method: "GET" },
    true,
  );
}

// ============================================================================
// FARMER REQUESTS & CONSULTATIONS
// ============================================================================

export interface FarmerRequest {
  id: number;
  status: "PENDING" | "MEETING_CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  problem: string;
  livestock_type?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  meeting_link?: string;
  assigned_vet?: any;
}

/**
 * Fetch all farmer requests
 */
export async function getFarmerRequests(status?: string): Promise<FarmerRequest[]> {
  const query = status ? `?status=${status}` : "";
  return fetchJson<FarmerRequest[]>(
    `/farmer/requests/${query}`,
    { method: "GET" },
    true,
  );
}

/**
 * Get specific farmer request
 */
export async function getFarmerRequest(requestId: number): Promise<FarmerRequest> {
  return fetchJson<FarmerRequest>(
    `/farmer/requests/${requestId}/`,
    { method: "GET" },
    true,
  );
}

/**
 * Cancel a farmer request
 */
export async function cancelFarmerRequest(requestId: number): Promise<FarmerRequest> {
  return fetchJson<FarmerRequest>(
    `/farmer/requests/${requestId}/cancel/`,
    { method: "POST", headers: getAuthHeaders() },
    true,
  );
}

// ============================================================================
// FARMER CONSULTATION HISTORY
// ============================================================================

export interface ConsultationHistory {
  id: number;
  date: string;
  vet_name: string;
  problem: string;
  diagnosis?: string;
  treatment?: string;
  status: string;
  notes?: string;
}

/**
 * Fetch consultation history
 */
export async function getConsultationHistory(
  limit?: number,
  offset?: number,
): Promise<ConsultationHistory[]> {
  const query = new URLSearchParams();
  if (limit) query.append("limit", limit.toString());
  if (offset) query.append("offset", offset.toString());
  const queryStr = query.toString();

  return fetchJson<ConsultationHistory[]>(
    `/farmer/consultations/${queryStr ? "?" + queryStr : ""}`,
    { method: "GET" },
    true,
  );
}
