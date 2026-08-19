"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface DuplicateModalProps {
  isOpen: boolean;
  onOk: () => void;
}

export default function DuplicateModal({ isOpen, onOk }: DuplicateModalProps) {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      okRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOk();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onOk]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-modal-title"
    >
      <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm" onClick={onOk} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border-light bg-surface p-8 shadow-xl">
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/10">
            <AlertTriangle className="h-7 w-7 text-amber" />
          </div>
        </div>

        <h2
          id="duplicate-modal-title"
          className="mb-2 text-center text-lg font-bold text-text"
        >
          Open Request Already Exists
        </h2>

        <p className="mb-6 text-center text-sm leading-relaxed text-text-secondary">
          You already have an active consultation request. We will take you to its status page.
        </p>

        <button
          ref={okRef}
          onClick={onOk}
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          VIEW MY REQUEST
        </button>
      </div>
    </div>
  );
}
