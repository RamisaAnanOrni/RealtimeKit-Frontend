/**
 * VIDEO CALL & MEETING API SERVICE
 * Handles video consultation meetings, Dyte integration, and meeting management.
 * Direct Django backend calls only - NO Next.js API routes.
 */

import { fetchJson, getAuthHeaders } from "./api";

// ============================================================================
// MEETING MODELS
// ============================================================================

export interface Meeting {
  id: number;
  meeting_id: string;
  status: "CREATED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  farmer: any;
  vet?: any;
  livestock_type?: string;
  problem_description?: string;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  farmer_join_link?: string;
  vet_join_link?: string;
  cloudflare_meeting_id?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DyteParticipant {
  participant_id: string;
  user_name: string;
  role?: string;
  status?: string;
}

export interface MeetingCredentials {
  meeting_id: string;
  participant_id: string;
  auth_token: string;
  base_url?: string;
}

// ============================================================================
// CREATE MEETING
// ============================================================================

export interface CreateMeetingRequest {
  farmer_id: number;
  vet_id?: number;
  livestock_type?: string;
  problem_description?: string;
  scheduled_at?: string;
}

/**
 * Create new consultation meeting
 * Returns farmer and vet join links for the video call
 */
export async function createMeeting(
  data: CreateMeetingRequest,
): Promise<Meeting> {
  return fetchJson<Meeting>(
    "/meeting/create/",
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

// ============================================================================
// GET MEETING
// ============================================================================

/**
 * Fetch meeting details by ID
 */
export async function getMeeting(meetingId: number | string): Promise<Meeting> {
  return fetchJson<Meeting>(
    `/meeting/${meetingId}/`,
    { method: "GET" },
    true,
  );
}

/**
 * Get meeting by Dyte meeting ID
 */
export async function getMeetingByDyteId(dyteId: string): Promise<Meeting> {
  return fetchJson<Meeting>(
    `/meeting/dyte/${dyteId}/`,
    { method: "GET" },
    true,
  );
}

// ============================================================================
// UPDATE MEETING
// ============================================================================

export interface UpdateMeetingRequest {
  status?: string;
  notes?: string;
}

/**
 * Update meeting status or notes
 */
export async function updateMeeting(
  meetingId: number | string,
  data: UpdateMeetingRequest,
): Promise<Meeting> {
  return fetchJson<Meeting>(
    `/meeting/${meetingId}/`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    },
    true,
  );
}

/**
 * Start/begin a meeting
 */
export async function startMeeting(meetingId: number | string): Promise<Meeting> {
  return updateMeeting(meetingId, { status: "IN_PROGRESS" });
}

/**
 * End/complete a meeting
 */
export async function endMeeting(
  meetingId: number | string,
  notes?: string,
): Promise<Meeting> {
  return updateMeeting(meetingId, { status: "COMPLETED", notes });
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(meetingId: number | string): Promise<Meeting> {
  return updateMeeting(meetingId, { status: "CANCELLED" });
}

// ============================================================================
// MEETING CREDENTIALS
// ============================================================================

export interface MeetingCredentialsRequest {
  meeting_id: string;
  participant_type: "farmer" | "vet";
}

/**
 * Get Dyte meeting credentials for joining
 * Used to authenticate participants in the video call
 */
export async function getMeetingCredentials(
  meetingId: number | string,
  participantType: "farmer" | "vet",
): Promise<MeetingCredentials> {
  return fetchJson<MeetingCredentials>(
    `/meeting/${meetingId}/credentials/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ participant_type: participantType }),
    },
    true,
  );
}

// ============================================================================
// MEETING PARTICIPANTS
// ============================================================================

/**
 * Get list of participants in a meeting
 */
export async function getMeetingParticipants(
  meetingId: number | string,
): Promise<DyteParticipant[]> {
  return fetchJson<DyteParticipant[]>(
    `/meeting/${meetingId}/participants/`,
    { method: "GET" },
    true,
  );
}

// ============================================================================
// RECORDING
// ============================================================================

export interface MeetingRecording {
  id: number;
  meeting_id: number;
  recording_url?: string;
  recording_size?: number;
  duration?: number;
  created_at: string;
}

/**
 * Check if meeting has been recorded
 */
export async function getMeetingRecording(
  meetingId: number | string,
): Promise<MeetingRecording | null> {
  try {
    return await fetchJson<MeetingRecording>(
      `/meeting/${meetingId}/recording/`,
      { method: "GET" },
      true,
    );
  } catch {
    return null;
  }
}

/**
 * Get meeting recording download link
 */
export async function getRecordingDownloadLink(
  meetingId: number | string,
): Promise<{ download_url: string }> {
  return fetchJson<{ download_url: string }>(
    `/meeting/${meetingId}/recording/download/`,
    { method: "GET" },
    true,
  );
}

// ============================================================================
// MEETING LIST
// ============================================================================

export interface MeetingListParams {
  status?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get farmer's meetings (for farmers)
 */
export async function getFarmerMeetings(params?: MeetingListParams): Promise<Meeting[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const queryStr = query.toString();
  return fetchJson<Meeting[]>(
    `/meeting/farmer/${queryStr ? "?" + queryStr : ""}`,
    { method: "GET" },
    true,
  );
}

/**
 * Get vet's meetings (for vets)
 */
export async function getVetMeetings(params?: MeetingListParams): Promise<Meeting[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.offset) query.append("offset", params.offset.toString());

  const queryStr = query.toString();
  return fetchJson<Meeting[]>(
    `/meeting/vet/${queryStr ? "?" + queryStr : ""}`,
    { method: "GET" },
    true,
  );
}

// ============================================================================
// MEETING HEALTH NOTES
// ============================================================================

export interface HealthNote {
  id: number;
  meeting_id: number;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  follow_up?: string;
  created_by?: string;
  created_at: string;
}

/**
 * Get health notes from a meeting
 */
export async function getMeetingHealthNotes(
  meetingId: number | string,
): Promise<HealthNote[]> {
  return fetchJson<HealthNote[]>(
    `/meeting/${meetingId}/notes/`,
    { method: "GET" },
    true,
  );
}

/**
 * Add health notes to a meeting
 */
export async function addHealthNotes(
  meetingId: number | string,
  notes: Partial<HealthNote>,
): Promise<HealthNote> {
  return fetchJson<HealthNote>(
    `/meeting/${meetingId}/notes/`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(notes),
    },
    true,
  );
}
