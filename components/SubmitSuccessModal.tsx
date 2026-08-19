"use client";

import React, { useEffect, useRef } from "react";
import { Info } from "lucide-react";

interface SubmitSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitSuccessModal({
  isOpen,
  onClose,
}: SubmitSuccessModalProps) {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      okRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-light bg-surface p-8 shadow-xl">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal/10">
            <Info className="h-7 w-7 text-teal" />
          </div>
        </div>

        <h2
          id="success-modal-title"
          className="mb-2 text-center text-lg font-bold text-text"
        >
          Request Submitted
        </h2>

        <p className="mb-6 text-center text-sm leading-relaxed text-text-secondary">
          A vet will join within minutes. Please wait while we connect you with a veterinarian.
        </p>

        <button
          ref={okRef}
          onClick={onClose}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          OK
        </button>
      </div>
    </div>
  );
}
