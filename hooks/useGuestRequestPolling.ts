"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getGuestRequest, GuestRequestResponse } from "../lib/guest-api";

interface UsePollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

export function useGuestRequestPolling(
  requestId: number | null,
  options: UsePollingOptions = {}
) {
  const { intervalMs = 5000, timeoutMs = 30 * 60 * 1000 } = options;

  const [data, setData] = useState<GuestRequestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  const fetchStatus = useCallback(
    async (id: number) => {
      try {
        const result = await getGuestRequest(id);
        setData(result);
        setError(null);

        if (result.status === "MEETING_CREATED") {
          stopPolling();
        }

        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      }
    },
    [stopPolling]
  );

  useEffect(() => {
    if (!requestId) return;

    let cancelled = false;

    async function initialFetch() {
      const result = await fetchStatus(requestId!);
      if (cancelled || !result) return;

      timerRef.current = setInterval(() => {
        if (!cancelled) {
          fetchStatus(requestId!);
        }
      }, intervalMs);
    }

    initialFetch();

    timeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        stopPolling();
        setError("Polling timed out. Please refresh or contact support.");
      }
    }, timeoutMs);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [requestId, intervalMs, timeoutMs, fetchStatus, stopPolling]);

  return { data, error, retry: () => requestId && fetchStatus(requestId) };
}
