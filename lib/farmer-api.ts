/**
 * FARMER API SERVICE
 * Handles all farmer-specific operations (dashboard, profile, requests, etc.)
 * Direct Django backend calls only - NO Next.js API routes.
 */

import { fetchJson, getAuthHeaders } from "./api";

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
