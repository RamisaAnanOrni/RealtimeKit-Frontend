"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getConsultationStatus, ConsultationResponse } from "../lib/farmer-api";

interface UseConsultationPollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onStatusChange?: (status: ConsultationResponse) => void;
  onLinkReady?: (meetingLink: string) => void;
}

export function useConsultationPolling(
  consultationId: number | null,
  options: UseConsultationPollingOptions = {}
) {
  const {
    intervalMs = 5000,
    timeoutMs = 30 * 60 * 1000, // 30 minutes
    onStatusChange,
    onLinkReady,
  } = options;

  const [data, setData] = useState<ConsultationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const fetchStatus = useCallback(
    async (id: number) => {
      try {
        const result = await getConsultationStatus(id);
        setData(result);
        setError(null);

        // Call callback if provided
        if (onStatusChange) {
          onStatusChange(result);
        }

        // If meeting link is ready and callback provided, call it
        if (result.meeting_link && result.can_join && onLinkReady) {
          onLinkReady(result.meeting_link);
          stopPolling(); // Stop polling once link is ready
        }

        // Stop polling if consultation is completed or cancelled
        if (
          result.status === "COMPLETED" ||
          result.status === "CANCELLED" ||
          result.is_link_expired
        ) {
          stopPolling();
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [stopPolling, onStatusChange, onLinkReady]
  );

  useEffect(() => {
    if (!consultationId) return;

    let cancelled = false;

    async function initialFetch() {
      const result = await fetchStatus(consultationId!);
      if (cancelled || !result) return;

      setIsPolling(true);

      timerRef.current = setInterval(() => {
        if (!cancelled) {
          fetchStatus(consultationId!);
        }
      }, intervalMs);
    }

    initialFetch();

    timeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        stopPolling();
        setError("Polling timed out. The consultation link may have expired.");
      }
    }, timeoutMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [consultationId, intervalMs, timeoutMs, fetchStatus, stopPolling]);

  return {
    data,
    error,
    isPolling,
    retry: () => consultationId && fetchStatus(consultationId),
    stop: stopPolling,
  };
}
