"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  Clock,
  ChevronRight,
  CheckCircle2,
  Award,
  Send,
} from "lucide-react";
import VetRequestCard from "@/components/VetRequestCard";
import { useAuth } from "@/components/AuthProvider";
import { getStoredAuth } from "@/lib/api";
import {
  getVetAssignedRequestsWithFallback,
  acceptConsultationRequest,
  declineConsultationRequest,
  getVetDashboard,
  ConsultationRequest,
  VetDashboardStats,
} from "@/lib/vet-api";

// ---------------------------------------------------------------------------
// Mock data for sections the backend doesn't serve yet
// ---------------------------------------------------------------------------
const UPCOMING_APPOINTMENTS = [
  { id: 1, time: "10:30", farmer: "Kamrul Hasan", animal: "Poultry", symptoms: "Feverish signs, low egg production" },
  { id: 2, time: "11:15", farmer: "Rahim Uddin", animal: "Cow", symptoms: "Loss of appetite, lethargy" },
  { id: 3, time: "12:00", farmer: "Fatima Begum", animal: "Goat", symptoms: "Hoof rot, limping" },
];

// Stable expiry fallback (evaluated once at module load, not during a render).
const DEFAULT_EXPIRY = new Date(Date.now() + 10 * 60000).toISOString();

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function VetDashboardPage() {
  const router = useRouter();

  // Auth & profile
  const [isActive, setIsActive] = useState(true);

  // Data
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [stats, setStats] = useState<VetDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Rx Pad form
  const [rxPatientId] = useState("AV-992381");
  const [rxDisease, setRxDisease] = useState("");
  const [rxMedicine, setRxMedicine] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxSubmitting, setRxSubmitting] = useState(false);

  // -----------------------------------------------------------------------
  // Auth check + data fetch
  // -----------------------------------------------------------------------
  const { user, authLoading } = useAuth();
  const vetName = user?.username || "Veterinarian";

  const load = useCallback(
    async (silent = false) => {
      try {
        const [reqs, dash] = await Promise.all([
          getVetAssignedRequestsWithFallback(),
          getVetDashboard().catch(() => null),
        ]);
        setRequests(reqs);
        if (dash) setStats(dash);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard";
        if (/403|permission/i.test(msg)) {
          // Backend rejected the request as a non-VET. Force a relogin.
          setError("You do not have veterinarian access. Redirecting to sign in...");
          setTimeout(() => router.replace("/auth"), 1500);
        } else if (/401|unauthorized|invalid/i.test(msg)) {
          setError("Your session has expired. Redirecting to sign in...");
          setTimeout(() => router.replace("/auth"), 1500);
        } else {
          setError(msg);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [router],
  );

  // Gate: never redirect while the stored session/role is still resolving.
  useEffect(() => {
    if (authLoading) return;

    const auth = getStoredAuth();
    if (!auth?.access) {
      router.push("/auth");
      return;
    }

    // Role guard: only VET accounts may access the vet dashboard.
    // Non-vets (farmers/admin/unknown) must NOT hit VET-only endpoints,
    // otherwise Django returns 403 Forbidden.
    if (user?.role !== "vet") {
      // Farmers (and admins) go to the farmer experience; unauthenticated -> auth.
      router.replace("/farmer/dashboard");
      return;
    }

    // Defer the initial fetch out of the effect's synchronous phase; every
    // setState inside `load` runs only after its awaited fetches settle.
    void Promise.resolve().then(() => load());
  }, [authLoading, user, router, load]);

  // Poll quietly every 3s so a meeting link/status change pushed from the
  // Django admin is picked up without a manual page refresh.
  useEffect(() => {
    if (authLoading || user?.role !== "vet") return;
    const timer = setInterval(() => load(true), 10000);
    return () => clearInterval(timer);
  }, [authLoading, user, load]);

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------
  const handleAccept = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      const result = await acceptConsultationRequest(requestId);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "ACCEPTED", vet_link: result.vet_link } : r,
        ),
      );
      if (result.vet_link) window.open(result.vet_link, "_blank", "width=1200,height=800");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await declineConsultationRequest(requestId);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "DECLINED" } : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmitRx = async () => {
    setRxSubmitting(true);
    // Simulate submission — replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRxSubmitting(false);
    setRxDisease("");
    setRxMedicine("");
    setRxDosage("");
  };

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------
  const activeRequests = requests.filter(
    (r) => r.status !== "DECLINED" && r.status !== "COMPLETED",
  );

  const pendingCount = stats?.pending_requests ?? activeRequests.length;
  const successCount = stats?.total_consultations ?? 142;
  const rewardPoints = 1250;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* ================================================================
          TOP BAR
      ================================================================ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsActive((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  isActive ? "bg-success" : "bg-border"
                }`}
                aria-label="Toggle availability"
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-foreground">
                {isActive ? "Active" : "Offline"}
              </span>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-on-primary">
                  {vetName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================================================================
            HERO BANNER
        ================================================================ */}
        <section className="bg-emerald-950 text-white rounded-2xl p-6">
          <h1 className="text-2xl font-bold">
            Welcome back, Dr. {vetName}
          </h1>
          <p className="mt-1 text-emerald-300/80 text-sm">
            {pendingCount} urgent pending cases, {stats?.today_consultations ?? 8} scheduled consultations
          </p>
        </section>

        {/* ================================================================
            ERROR ALERT
        ================================================================ */}
        {error && (
          <div className="rounded-lg border border-error-red/20 bg-error-red/10 p-4 text-error-red flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* ================================================================
            KEY METRICS ROW
        ================================================================ */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pending Requests */}
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Pending Requests
              </p>
              <p className="mt-1 text-3xl font-bold text-error-red">
                {String(pendingCount).padStart(2, "0")}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-error-red/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-error-red" />
            </div>
          </div>

          {/* Success Consultations */}
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Success Consultations
              </p>
              <p className="mt-1 text-3xl font-bold text-success">
                {successCount}
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </div>

          {/* Reward Points */}
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Reward Points
              </p>
              <p className="mt-1 text-3xl font-bold text-amber">
                {rewardPoints.toLocaleString()} Pts
              </p>
            </div>
            <div className="h-11 w-11 rounded-full bg-amber/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber" />
            </div>
          </div>
        </section>

        {/* ================================================================
            MAIN BODY — 2-COLUMN ASYMMETRIC GRID
        ================================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ----------------------------------------------------------
              LEFT COLUMN (col-span-7)
          ---------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">
            {/* Farmer Request Section */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Incoming Farmer Requests
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-10 text-center">
                  <p className="font-medium text-foreground mb-1">No pending requests</p>
                  <p className="text-sm text-text-muted">
                    New consultation requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRequests.map((request) => (
                    <VetRequestCard
                      key={request.id}
                      requestId={request.id}
                      farmerName={
                        request.farmer.first_name || request.farmer.username || "Farmer"
                      }
                      animalType={request.animal_type}
                      breed={request.breed}
                      location="Gazipur, Bangladesh"
                      createdAt={request.created_at}
                      expiresAt={
                        request.expires_at ||
                        request.link_expires_at ||
                        DEFAULT_EXPIRY
                      }
                      status={request.status}
                      vetLink={request.vet_link}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span role="img" aria-label="calendar">&#128197;</span>{" "}
                Upcoming Appointments
              </h2>

              <div className="space-y-3">
                {UPCOMING_APPOINTMENTS.map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Time badge */}
                    <div className="flex-shrink-0 w-16 text-center rounded-lg bg-primary/10 py-2 px-1">
                      <span className="text-sm font-bold text-primary">{appt.time}</span>
                    </div>

                    {/* Patient info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {appt.farmer}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {appt.animal} &bull; {appt.symptoms}
                      </p>
                    </div>

                    {/* Arrow CTA */}
                    <button className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                      <ChevronRight className="h-4 w-4 text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------
              RIGHT COLUMN (col-span-5)
          ---------------------------------------------------------- */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span role="img" aria-label="notepad">&#128221;</span>{" "}
                  Digital Rx Pad
                </h2>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  Patient ID #{rxPatientId}
                </span>
              </div>

              {/* Diagnosed Disease */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Diagnosed Disease
                </label>
                <input
                  type="text"
                  value={rxDisease}
                  onChange={(e) => setRxDisease(e.target.value)}
                  placeholder="e.g., Bovine Ephemeral Fever"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {/* Prescribed Medicine */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Prescribed Medicine
                </label>
                <input
                  type="text"
                  value={rxMedicine}
                  onChange={(e) => setRxMedicine(e.target.value)}
                  placeholder="e.g., Oxytetracylina LA 20%"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              {/* Dosage & Instructions */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Dosage &amp; Instructions
                </label>
                <textarea
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  placeholder="Enter detailed dosage instructions for the farmer..."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleSubmitRx}
                disabled={rxSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rxSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Digital Prescription &amp; Route to Pharmacy
              </button>

              {/* Footer note */}
              <p className="text-xs text-text-muted text-center leading-relaxed">
                The prescription will be automatically sent to the nearest Rural Pharmacy for
                fulfillment.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
