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
