/**
 * VET API SERVICE
 * Handles all vet-specific operations (dashboard, profile, consultations, etc.)
 * Direct Django backend calls only - NO Next.js API routes.
 */

import { fetchJson, getAuthHeaders } from "./api";

// ============================================================================
// VET PROFILE
// ============================================================================

export interface VetProfile {
  id: number;
  username: string;
  email?: string;
  phone: string;
  full_name: string;
  role: "vet";
  bio?: string;
  license_number?: string;
  specialization?: string[];
  experience_years?: number;
  clinic_name?: string;
  clinic_address?: string;
  availability_status?: "available" | "busy" | "offline";
  profile_picture?: string;
  rating?: number;
  total_consultations?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch vet's profile information
 */
export async function getVetProfile(): Promise<VetProfile> {
  return fetchJson<VetProfile>(
    "/vet/profile/",
    { method: "GET" },
    true,
  );
}

/**
 * Update vet's profile
 */
export async function updateVetProfile(data: Partial<VetProfile>): Promise<VetProfile> {
  return fetchJson<VetProfile>(
    "/vet/profile/",
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

// ============================================================================
// VET DASHBOARD
// ============================================================================

export interface VetDashboardStats {
  total_consultations: number;
  pending_requests: number;
  today_consultations: number;
  weekly_consultations?: number;
  average_rating?: number;
  recent_consultations?: any[];
  pending_requests_list?: any[];
}

/**
 * Fetch vet dashboard with statistics
 */
export async function getVetDashboard(): Promise<VetDashboardStats> {
  return fetchJson<VetDashboardStats>(
    "/vet/dashboard/",
    { method: "GET" },
    true,
  );
}

// ============================================================================
// VET CONSULTATIONS
// ============================================================================

export interface VetConsultation {
  id: number;
  farmer: any;
  livestock_type: string;
  problem: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  diagnosis?: string;
  treatment?: string;
  meeting_link?: string;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

/**
 * Fetch all vet consultations
 */
export async function getVetConsultations(status?: string): Promise<VetConsultation[]> {
  const query = status ? `?status=${status}` : "";
  return fetchJson<VetConsultation[]>(
    `/vet/consultations/${query}`,
    { method: "GET" },
    true,
  );
}

/**
 * Get specific consultation
 */
export async function getVetConsultation(consultationId: number): Promise<VetConsultation> {
  return fetchJson<VetConsultation>(
    `/vet/consultations/${consultationId}/`,
    { method: "GET" },
    true,
  );
}

/**
 * Update consultation status
 */
export async function updateConsultationStatus(
  consultationId: number,
  status: string,
  data?: { diagnosis?: string; treatment?: string; notes?: string },
): Promise<VetConsultation> {
  return fetchJson<VetConsultation>(
    `/vet/consultations/${consultationId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, ...data }),
    },
    true,
  );
}

/**
 * Complete consultation with diagnosis and treatment
 */
export async function completeConsultation(
  consultationId: number,
  diagnosis: string,
  treatment: string,
  notes?: string,
): Promise<VetConsultation> {
  return updateConsultationStatus(consultationId, "COMPLETED", {
    diagnosis,
    treatment,
    notes,
  });
}

// ============================================================================
// VET AVAILABILITY
// ============================================================================

export type AvailabilityStatus = "available" | "busy" | "offline";

/**
 * Update vet availability status
 */
export async function updateAvailabilityStatus(
  status: AvailabilityStatus,
): Promise<VetProfile> {
  return fetchJson<VetProfile>(
    "/vet/availability/",
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ availability_status: status }),
    },
    true,
  );
}

// ============================================================================
// VET SCHEDULE
// ============================================================================

export interface TimeSlot {
  id: number;
  day: string; // "MON", "TUE", etc.
  start_time: string; // "09:00"
  end_time: string; // "17:00"
}

/**
 * Fetch vet's availability schedule
 */
export async function getVetSchedule(): Promise<TimeSlot[]> {
  return fetchJson<TimeSlot[]>(
    "/vet/schedule/",
    { method: "GET" },
    true,
  );
}

/**
 * Update vet's availability schedule
 */
export async function updateVetSchedule(slots: TimeSlot[]): Promise<TimeSlot[]> {
  return fetchJson<TimeSlot[]>(
    "/vet/schedule/",
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ slots }),
    },
    true,
  );
}

// ============================================================================
// VET RATINGS & REVIEWS
// ============================================================================

export interface ConsultationReview {
  id: number;
  rating: number;
  comment?: string;
  farmer_name: string;
  consultation_id: number;
  created_at: string;
}

/**
 * Fetch vet reviews
 */
export async function getVetReviews(limit?: number): Promise<ConsultationReview[]> {
  const query = limit ? `?limit=${limit}` : "";
  return fetchJson<ConsultationReview[]>(
    `/vet/reviews/${query}`,
    { method: "GET" },
    true,
  );
}

// ============================================================================
// VET SPECIALIZATION
// ============================================================================

/**
 * Get list of available specializations
 */
export async function getSpecializations(): Promise<string[]> {
  return fetchJson<string[]>(
    "/vet/specializations/",
    { method: "GET" },
    false, // Public endpoint
  );
}

// ============================================================================
// VET CONSULTATION REQUESTS (NEW WORKFLOW)
// ============================================================================

export interface ConsultationRequest {
  id: number;
  farmer: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
  animal_type: string;
  breed?: string;
  gender?: string;
  age?: string;
  health_problem: string;
  status: string;
  assigned_vet?: {
    id: number;
    user: {
      username: string;
      first_name?: string;
    };
  };
  farmer_link?: string;
  vet_link?: string;
  link_expires_at?: string;
  expires_at?: string;
  is_link_expired?: boolean;
  created_at: string;
  updated_at: string;
}

export interface VetResponseResult {
  status: string;
  message: string;
  vet_link?: string;
  consultation_id: number;
}

/**
 * Get all consultation requests assigned to the logged-in Vet
 */
export async function getVetAssignedRequests(): Promise<ConsultationRequest[]> {
  return fetchJson<ConsultationRequest[]>(
    "/vet/request/list/",
    { method: "GET" },
    true,
  );
}

/**
 * Get video meetings assigned to the logged-in Vet.
 * Each meeting carries the vet_link, farmer_link, request, and farmer details.
 */
export async function getVetAssignedMeetings(): Promise<any[]> {
  return fetchJson<any[]>(
    "/vet/meetings/",
    { method: "GET" },
    true,
  );
}

/**
 * Get assigned consultation requests with fallback:
 * 1. Try /vet/meetings/ (rich data with vet_link) when available.
 * 2. Fall back to /vet/request/list/ (legacy endpoint).
 */
export async function getVetAssignedRequestsWithFallback(): Promise<ConsultationRequest[]> {
  try {
    const meetings = await getVetAssignedMeetings();
    if (Array.isArray(meetings) && meetings.length > 0) {
      return meetings.map((m: any) => ({
        id: m.request?.id ?? m.id,
        farmer: m.farmer ?? m.request?.farmer ?? { username: "Farmer" },
        animal_type: m.request?.animal_type ?? m.livestock_type ?? "",
        breed: m.request?.breed ?? "",
        gender: m.request?.gender ?? "",
        age: m.request?.age ?? "",
        health_problem: m.request?.health_problem ?? m.request?.problem ?? "",
        status: m.request?.status ?? m.status ?? "PENDING",
        assigned_vet: m.vet ?? m.request?.assigned_vet,
        vet_link: m.vet_link ?? m.request?.vet_link,
        farmer_link: m.farmer_link ?? m.request?.farmer_link,
        link_expires_at: m.request?.link_expires_at ?? m.request?.expires_at,
        expires_at: m.request?.expires_at,
        is_link_expired: m.request?.is_link_expired ?? false,
        created_at: m.created_at ?? m.request?.created_at ?? new Date().toISOString(),
        updated_at: m.updated_at ?? m.request?.updated_at ?? new Date().toISOString(),
      }));
    }
  } catch {
    // Meetings endpoint unavailable -> fall through to legacy endpoint.
  }

  return getVetAssignedRequests();
}

/**
 * Accept a consultation request
 * Returns the vet_link for immediate video session access
 */
export async function acceptConsultationRequest(
  requestId: number,
): Promise<VetResponseResult> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/vet/requests/${requestId}/respond/`,
    {
      method: "POST",
      headers: getAuthHeaders(false),
      body: JSON.stringify({ action: "accept" }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to accept request: ${response.status}`);
  }

  return response.json();
}

/**
 * Decline a consultation request
 */
export async function declineConsultationRequest(
  requestId: number,
): Promise<VetResponseResult> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/vet/requests/${requestId}/respond/`,
    {
      method: "POST",
      headers: getAuthHeaders(false),
      body: JSON.stringify({ action: "decline" }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || `Failed to decline request: ${response.status}`);
  }

  return response.json();
}
