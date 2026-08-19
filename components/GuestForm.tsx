"use client";

import React, { useState } from "react";
import {
  Phone,
  FileText,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Info,
} from "lucide-react";

interface GuestFormProps {
  onSubmit: (phone: string, problem: string, description?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[^\d]/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export default function GuestForm({
  onSubmit,
  isLoading,
  error,
}: GuestFormProps) {
  const [phone, setPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [problemError, setProblemError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let valid = true;

    if (!validatePhone(phone)) {
      setPhoneError("Enter a valid phone number (10-15 digits)");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!problem.trim()) {
      setProblemError("Please describe the problem briefly");
      valid = false;
    } else {
      setProblemError("");
    }

    if (valid) {
      onSubmit(phone.trim(), problem.trim(), description.trim() || undefined);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left trust panel */}
      <div className="relative flex flex-col justify-between bg-primary px-8 py-10 text-white lg:min-h-screen lg:w-[440px] lg:shrink-0 lg:px-12 lg:py-16">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Tele-Health
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            Expert Veterinary
            <br />
            Care for Your
            <br />
            Livestock
          </h1>

          <p className="mb-10 max-w-xs text-sm leading-relaxed text-white/70">
            Connect instantly with certified veterinarians.
            Get professional guidance for your livestock
            health concerns &mdash; anytime, anywhere.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xl font-bold">10,000+</div>
              <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                Certified Vets
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xl font-bold">5 min</div>
              <div className="text-xs font-medium uppercase tracking-wide text-white/60">
                Emergency SLA
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 hidden lg:block">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <Stethoscope className="h-10 w-10 shrink-0 text-teal-light" />
            <div>
              <div className="text-sm font-semibold">Trusted by 50,000+ farmers</div>
              <div className="text-xs text-white/50">Across Bangladesh</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-text">Guest Mode</h2>
            <p className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Info className="h-4 w-4 shrink-0" />
              No account required. Submit and wait for a vet.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-secondary"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="01xxx"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text placeholder-text-muted transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? "phone-error" : undefined}
                />
              </div>
              {phoneError && (
                <p id="phone-error" className="mt-1.5 text-xs text-error" role="alert">
                  {phoneError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="problem"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-secondary"
              >
                Problem Summary
              </label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-text-muted" />
                <input
                  id="problem"
                  type="text"
                  placeholder="e.g. Cow not eating, fever"
                  value={problem}
                  onChange={(e) => {
                    setProblem(e.target.value);
                    if (problemError) setProblemError("");
                  }}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text placeholder-text-muted transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  aria-invalid={!!problemError}
                  aria-describedby={problemError ? "problem-error" : undefined}
                />
              </div>
              {problemError && (
                <p id="problem-error" className="mt-1.5 text-xs text-error" role="alert">
                  {problemError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-text-secondary"
              >
                Detailed Description
                <span className="ml-1 font-normal normal-case tracking-normal text-text-muted">(optional)</span>
              </label>
              <textarea
                id="description"
                placeholder="Provide more details about symptoms, when it started, number of animals affected..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder-text-muted transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-error/20 bg-error/5 p-3.5 text-sm text-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                <>
                  SUBMIT REQUEST
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            A veterinarian will be assigned to your case shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
