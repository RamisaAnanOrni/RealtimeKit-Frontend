"use client";

import React, { useState } from "react";
import { useConsultationPolling } from "@/hooks/useConsultationPolling";
import { completeConsultation, markConsultationJoined } from "@/lib/farmer-api";
import { meetingLinkWithContext } from "@/lib/api";
import {
  Clock,
  Video,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ConsultationStatusProps {
  consultationId: number;
}

export default function ConsultationStatusPage({
  consultationId,
}: ConsultationStatusProps) {
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  // Use the polling hook for real-time updates
  const { data, error, isPolling, retry } = useConsultationPolling(
    consultationId,
    {
      intervalMs: 5000, // Poll every 5 seconds
      timeoutMs: 30 * 60 * 1000, // 30 minute timeout
    }
  );

  const consultation = data;
  const isWaiting =
    consultation && consultation.status === "PENDING";
  const isDeclined = consultation && consultation.status === "DECLINED";
  const isCompleted =
    consultation &&
    ["COMPLETED", "EXPIRED", "DECLINED", "CANCELLED"].includes(
      consultation.status
    );
  const isReady =
    consultation &&
    consultation.can_join &&
    // Join button visible exactly at: MEETING_CREATED (admin generated the
    // link), ACCEPTED / IN_PROGRESS (rejoin / vet-joined first). Hidden at
    // every other state — including terminal COMPLETED / DECLINED / CANCELLED.
    ["MEETING_CREATED", "ACCEPTED", "IN_PROGRESS"].includes(
      consultation.status
    );
  const isExpired = consultation && consultation.is_link_expired;

  // Handle joining the call: first signal the backend (status -> ACCEPTED,
  // Meeting -> STARTED), then open the room with the consultation id + role
  // attached so the meeting page can complete the consultation on "Leave".
  // The backend update is best-effort so a transient network error never
  // blocks the Farmer from joining; the join button stays visible in
  // ACCEPTED / IN_PROGRESS anyway.
  const handleJoinCall = async () => {
    if (!consultation?.meeting_link) return;

    try {
      await markConsultationJoined(consultation.id);
      retry();
    } catch {
      // Non-fatal — the link remains available in every active state.
    }

    window.open(
      meetingLinkWithContext(
        consultation.meeting_link,
        consultation.id,
        "farmer",
      ),
      "_blank",
    );
  };

  // End the call from the farmer side: transition the request (and its
  // Meeting) to COMPLETED, then refetch so the UI resolves to the completed
  // banner instead of the join screen.
  const handleEndCall = async () => {
    if (!consultation || isEnding) return;
    setIsEnding(true);
    setEndError(null);
    try {
      await completeConsultation(consultation.id);
      retry();
    } catch (err) {
      setEndError(err instanceof Error ? err.message : "Failed to end the consultation");
    } finally {
      setIsEnding(false);
    }
  };

  if (!consultation && isPolling) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#063b2b]" />
          <p className="text-[#59736a]">Loading consultation details...</p>
        </div>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <div className="flex gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <h3 className="font-semibold">Error Loading Consultation</h3>
              <p className="text-sm mt-2 text-red-800">{error}</p>
              <button
                onClick={retry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] p-6 text-center">
          <p className="text-[#59736a]">Consultation not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#063b2b]">
          Consultation Status
        </h1>
        <p className="text-[#59736a]">
          Request ID: #{consultation.id} • Created on{" "}
          {consultation.created_at
            ? new Date(consultation.created_at).toLocaleDateString()
            : "—"}
        </p>
      </div>

      {/* Status Banner */}
      {isWaiting && (
        <div className="rounded-2xl border border-amber-200 bg-[#fffbeb] p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-6 w-6 shrink-0 animate-pulse text-[#b45309]" />
            <div>
              <h3 className="text-lg font-bold text-[#b45309]">
                Finding Available Veterinarian
              </h3>
              <p className="mt-1 text-sm text-[#92400e] leading-relaxed">
                Your consultation request has been received. A veterinarian will review your case and generate a meeting link within a few minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ready Banner */}
      {isReady && !isExpired && (
        <div className="rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#063b2b]" />
            <div>
              <h3 className="text-lg font-bold text-[#063b2b]">
                Veterinarian is Ready!
              </h3>
              <p className="mt-1 text-sm text-[#59736a] leading-relaxed">
                Please join the call within 10 minutes. The meeting link will expire automatically after that.
              </p>
            </div>
          </div>

          <button
            onClick={handleJoinCall}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#063b2b] py-3.5 text-white font-semibold shadow-md transition hover:bg-[#0a5240] focus:outline-none focus:ring-2 focus:ring-[#063b2b]/40"
          >
            <Video className="h-5 w-5" />
            JOIN VIDEO CALL
          </button>

          <button
            onClick={handleEndCall}
            disabled={isEnding}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d7e3df] py-3 text-sm font-semibold text-[#063b2b] transition hover:bg-[#e8f2ef]/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEnding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Ending call...
              </>
            ) : (
              "End Call"
            )}
          </button>

          {endError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {endError}
            </p>
          )}
        </div>
      )}

      {/* Expired Banner */}
      {isExpired && !isCompleted && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
            <div>
              <h3 className="text-lg font-bold">Meeting Link Expired</h3>
              <p className="mt-1 text-sm text-red-800 leading-relaxed">
                The meeting link has expired. Please contact support or submit a new consultation request.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completed / Ended Banner */}
      {isCompleted && (
        <div className="rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-[#063b2b]" />
            <div>
              <h3 className="text-lg font-bold text-[#063b2b]">
                {isDeclined
                  ? "Consultation Declined"
                  : "Consultation Completed"}
              </h3>
              <p className="mt-1 text-sm text-[#59736a] leading-relaxed">
                {isDeclined
                  ? "The veterinarian could not take this consultation. Please submit a new request."
                  : "This consultation has ended. The video call is no longer available."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Details Box */}
      <div className="rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] p-6 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#59736a]">
            Consultation Details
          </span>
          <h2 className="mt-2 text-xl font-semibold text-[#063b2b]">
            {consultation.health_problem || "Consultation Request"}
          </h2>
        </div>

        {/* Animal Information Grid */}
        <div className="grid grid-cols-2 gap-4 border-t border-[#e8f2ef] pt-4">
          <div>
            <span className="text-xs font-semibold text-[#59736a]">
              Animal Type
            </span>
            <p className="mt-1 text-sm font-medium text-[#063b2b] capitalize">
              {consultation.animal_type || "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#59736a]">
              Breed
            </span>
            <p className="mt-1 text-sm font-medium text-[#063b2b]">
              {consultation.breed || "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#59736a]">
              Gender
            </span>
            <p className="mt-1 text-sm font-medium text-[#063b2b] capitalize">
              {consultation.gender || "—"}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#59736a]">
              Age
            </span>
            <p className="mt-1 text-sm font-medium text-[#063b2b]">
              {consultation.age || "—"}
            </p>
          </div>
        </div>

        {/* Assigned Vet (if available) */}
        {consultation.assigned_vet && (
          <div className="border-t border-[#e8f2ef] pt-4">
            <span className="text-xs font-semibold text-[#59736a]">
              Assigned Veterinarian
            </span>
            <p className="mt-1 text-sm font-medium text-[#063b2b]">
              {consultation.assigned_vet.user?.full_name ||
                `Dr. ${consultation.assigned_vet.user?.username}`}
            </p>
            {consultation.assigned_vet.speciality && (
              <p className="text-xs text-[#59736a] mt-1">
                {consultation.assigned_vet.speciality}
              </p>
            )}
          </div>
        )}

        {/* Status Badge */}
        <div className="border-t border-[#e8f2ef] pt-4">
          <span className="text-xs font-semibold text-[#59736a]">
            Status
          </span>
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                isReady && !isExpired
                  ? "bg-[#e8f2ef] text-[#063b2b]"
                  : isWaiting
                  ? "bg-[#fef3c7] text-[#b45309]"
                  : "bg-[#e8f2ef] text-[#59736a]"
              }`}
            >
              {isReady && !isExpired && (
                <CheckCircle2 className="h-3 w-3" />
              )}
              {isWaiting && <Clock className="h-3 w-3 animate-pulse" />}
              {consultation.status}
            </span>
          </div>
        </div>
      </div>

      {/* Polling Status Indicator */}
      {isWaiting && isPolling && (
        <div className="flex items-center justify-center gap-2 text-xs text-[#59736a]">
          <Loader2 className="h-3 w-3 animate-spin" />
          Checking for updates every 5 seconds...
        </div>
      )}
    </div>
  );
}