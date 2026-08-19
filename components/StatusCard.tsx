"use client";

import React from "react";
import {
  Phone,
  FileText,
  Video,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface StatusCardProps {
  status: "pending" | "ready";
  problem: string;
  phone: string;
  vetName?: string;
  message?: string;
  onJoin?: () => void;
}

export default function StatusCard({
  status,
  problem,
  phone,
  vetName,
  message,
  onJoin,
}: StatusCardProps) {
  const isReady = status === "ready";

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
          Consultation Summary
        </div>
        <div className="space-y-2.5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Problem</div>
              <div className="text-sm font-medium text-text">{problem}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-muted">Phone</div>
              <div className="text-sm font-medium text-text">{phone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status card */}
      <div className="rounded-2xl border border-border-light bg-surface p-6 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Status icon */}
          {isReady ? (
            <div className="relative mb-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
          ) : (
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-2 border-amber/30 animate-pulse-ring" />
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber/10">
                <Loader2 className="h-7 w-7 text-amber animate-spin-slow" />
              </div>
            </div>
          )}

          {/* Badge */}
          <div
            className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              isReady
                ? "bg-success/10 text-success"
                : "bg-amber/10 text-amber"
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Link Ready
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                Pending
              </>
            )}
          </div>

          {/* Message */}
          {isReady ? (
            <div className="mb-5 space-y-1">
              {vetName && (
                <p className="text-base font-semibold text-text">
                  Dr. {vetName}
                </p>
              )}
              <p className="text-sm text-text-secondary">
                {message || "A veterinarian is ready. Join the consultation using the link below."}
              </p>
            </div>
          ) : (
            <div className="mb-5">
              <p className="text-base font-semibold text-text">
                Waiting for a moment...
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                A vet will join within minutes
              </p>
            </div>
          )}

          {/* Join button */}
          {isReady && onJoin && (
            <button
              onClick={onJoin}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-teal px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-light focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2"
            >
              <Video className="h-4 w-4" />
              JOIN CALL
            </button>
          )}

          {!isReady && (
            <div className="flex items-center gap-2 rounded-xl bg-background-alt px-4 py-3 text-xs text-text-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Checking for updates every 5 seconds
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
