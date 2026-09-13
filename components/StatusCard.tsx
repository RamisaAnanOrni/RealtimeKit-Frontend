"use client";

import React from "react";
import { Clock, Video, Phone, CheckCircle2 } from "lucide-react";

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
  return (
    <div className="w-full space-y-4">
      {/* Banner / Header Status */}
      {status === "pending" ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-6 w-6 shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="text-base font-semibold">Waiting for a Veterinarian</h3>
              <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                Your consultation request has been received. A doctor will review your case and connect shortly.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-900 dark:text-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-900" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">Doctor is Ready!</h3>
              <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                {message || "A veterinarian is ready to start your consultation session."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Details Box */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Request Details
          </span>
          <p className="mt-1 text-base font-medium text-text">{problem}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border-light pt-4">
          <div>
            <span className="text-xs font-semibold text-text-secondary">Phone Number</span>
            <p className="mt-0.5 text-sm font-medium text-text flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-text-muted" />
              {phone}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold text-text-secondary">Assigned Vet</span>
            <p className="mt-0.5 text-sm font-medium text-text">
              {vetName || "Assigning..."}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {status === "ready" && onJoin && (
          <div className="pt-2">
            <button
              onClick={onJoin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Video className="h-4 w-4" />
              JOIN VIDEO CALL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}