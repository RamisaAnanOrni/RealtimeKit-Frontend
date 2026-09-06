"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Clock, MapPin, Loader2 } from "lucide-react";

interface VetRequestCardProps {
  requestId: number;
  farmerName: string;
  animalType: string;
  breed?: string;
  location?: string;
  createdAt: string;
  expiresAt: string;
  status?: string;
  vetLink?: string;
  onAccept: (requestId: number) => Promise<void>;
  onDecline: (requestId: number) => Promise<void>;
}

export default function VetRequestCard({
  requestId,
  farmerName,
  animalType,
  breed,
  location,
  createdAt,
  expiresAt,
  status,
  vetLink,
  onAccept,
  onDecline,
}: VetRequestCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate and update countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft({ minutes, seconds });
        setIsExpired(false);
      }
    };

    updateCountdown();
    timerRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt]);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(requestId);
    } catch (error) {
      console.error("Error accepting request:", error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await onDecline(requestId);
    } catch (error) {
      console.error("Error declining request:", error);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleJoin = () => {
    if (vetLink) {
      window.open(vetLink, "_blank", "width=1200,height=800");
    }
  };

  // If expired, show a different UI
  if (isExpired) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
        <div className="flex items-center gap-3 mb-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="font-medium">Consultation Expired</p>
        </div>
        <p className="text-sm">This consultation request has expired and can no longer be accepted.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with countdown */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Farmer Request</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-text-muted">Request #{requestId}</p>
            {status && (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                {status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
        
        {/* Countdown badge */}
        {timeLeft && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200 font-mono text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>⏳ {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")} mins left</span>
          </div>
        )}
      </div>

      {/* Farmer Info */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">
              {farmerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-muted">Farmer Name</p>
            <p className="text-base font-semibold text-foreground">{farmerName}</p>
          </div>
        </div>

        {/* Animal Info */}
        <div>
          <p className="text-sm font-medium text-text-muted">Animal Information</p>
          <p className="text-base text-foreground">
            {animalType} {breed ? `- ${breed}` : ""}
          </p>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm">{location}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          onClick={handleDecline}
          disabled={isDeclining || isAccepting}
          className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm
                     border border-border text-foreground
                     hover:bg-secondary/50 hover:border-border/80
                     transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeclining ? (
            <>
              <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
              Declining...
            </>
          ) : (
            "Decline"
          )}
        </button>

        <button
          onClick={vetLink ? handleJoin : handleAccept}
          disabled={isAccepting || isDeclining}
          className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm
                     bg-gradient-to-r from-green-600 to-emerald-600
                     hover:from-green-700 hover:to-emerald-700
                     text-white shadow-sm hover:shadow-md
                     transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     active:scale-98 ${vetLink ? "ring-2 ring-emerald-300 animate-pulse" : ""}`}
        >
          {isAccepting ? (
            <>
              <Loader2 className="h-4 w-4 inline mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              {vetLink && <span className="inline-block h-2 w-2 rounded-full bg-white mr-2" />}
              Join Video Call
            </>
          )}
        </button>
      </div>
    </div>
  );
}
