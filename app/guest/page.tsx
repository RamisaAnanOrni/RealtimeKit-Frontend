"use client";

import { useState, useCallback } from "react";
import { submitGuestRequest } from "../../lib/guest-api";
import { useGuestRequestPolling } from "../../hooks/useGuestRequestPolling";
import GuestForm from "../../components/GuestForm";
import StatusCard from "../../components/StatusCard";
import DuplicateModal from "../../components/DuplicateModal";
import SubmitSuccessModal from "../../components/SubmitSuccessModal";
import { ArrowLeft, Activity } from "lucide-react";

interface StoredRequest {
  requestId: number;
  phone: string;
  problem: string;
}

function loadStoredRequest(): StoredRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("guest_request");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredRequest(data: StoredRequest) {
  sessionStorage.setItem("guest_request", JSON.stringify(data));
}

function clearStoredRequest() {
  sessionStorage.removeItem("guest_request");
}

export default function GuestPage() {
  const [screen, setScreen] = useState<"form" | "status">(() => {
    const stored = loadStoredRequest();
    return stored ? "status" : "form";
  });
  const [formData, setFormData] = useState<StoredRequest | null>(() => {
    return loadStoredRequest();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    data: pollData,
    error: pollError,
    retry: retryPoll,
  } = useGuestRequestPolling(formData?.requestId ?? null);

  const meetingReady = pollData?.status === "MEETING_CREATED";
  const showSuccessNow = showSuccessModal && !meetingReady;

  const handleSubmit = useCallback(
    async (phone: string, problem: string, description?: string) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const fullProblem = description
          ? `${problem}\n\nDetails: ${description}`
          : problem;

        const result = await submitGuestRequest(phone, fullProblem);

        if (
          result.message &&
          result.message.toLowerCase().includes("already have an open request")
        ) {
          const stored: StoredRequest = {
            requestId: result.request_id,
            phone,
            problem,
          };
          saveStoredRequest(stored);
          setFormData(stored);
          setShowDuplicateModal(true);
          return;
        }

        const stored: StoredRequest = {
          requestId: result.request_id,
          phone,
          problem,
        };
        saveStoredRequest(stored);
        setFormData(stored);
        setShowSuccessModal(true);
        setScreen("status");
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const handleBack = useCallback(() => {
    clearStoredRequest();
    setFormData(null);
    setScreen("form");
    setSubmitError(null);
  }, []);

  const handleJoinCall = useCallback(() => {
    if (pollData?.farmer_join_link) {
      window.open(pollData.farmer_join_link, "_blank", "noopener,noreferrer");
    }
  }, [pollData]);

  const handleDuplicateOk = useCallback(() => {
    setShowDuplicateModal(false);
    setScreen("status");
  }, []);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const displayPhone = formData?.phone ?? "";
  const displayProblem = pollData?.problem ?? formData?.problem ?? "";

  if (screen === "form") {
    return (
      <>
        <GuestForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          error={submitError}
        />
        <DuplicateModal isOpen={showDuplicateModal} onOk={handleDuplicateOk} />
        <SubmitSuccessModal
          isOpen={showSuccessNow}
          onClose={handleSuccessModalClose}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-border-light bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-text-secondary transition hover:bg-background-alt focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Go back to form"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-base font-bold text-text">Consultation Status</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6 pb-24 sm:py-8">
        {pollData?.status === "MEETING_CREATED" ? (
          <StatusCard
            status="ready"
            problem={displayProblem}
            phone={displayPhone}
            vetName={pollData.message ? undefined : undefined}
            message={pollData.message}
            onJoin={handleJoinCall}
          />
        ) : (
          <StatusCard
            status="pending"
            problem={displayProblem}
            phone={displayPhone}
          />
        )}

        {pollError && (
          <div
            className="mt-4 rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error"
            role="alert"
          >
            <p className="mb-2 font-medium">{pollError}</p>
            <button
              onClick={retryPoll}
              className="font-semibold underline transition hover:text-error/80"
            >
              Retry
            </button>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border-light bg-surface/90 backdrop-blur-md sm:hidden">
        <div className="flex h-14 items-center justify-center gap-2 text-primary">
          <Activity className="h-4 w-4" />
          <span className="text-sm font-semibold">Status</span>
        </div>
      </nav>

      <DuplicateModal isOpen={showDuplicateModal} onOk={handleDuplicateOk} />
      <SubmitSuccessModal
        isOpen={showSuccessNow}
        onClose={handleSuccessModalClose}
      />
    </div>
  );
}
