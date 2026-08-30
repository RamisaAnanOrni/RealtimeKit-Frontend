"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, ClipboardList, HeartPulse, MessageSquareText, PhoneCall, ShieldCheck, Stethoscope, UserRoundCheck, XCircle } from "lucide-react";
import { fetchJson, getStoredAuth } from "@/lib/api";
import { useRoleProtection } from "@/hooks/useRoleProtection";

type PendingRequest = {
  id: string | number;
  farmer?: { username?: string; name?: string };
  problem?: string;
  description?: string;
  status?: string;
  assigned_vet?: { user?: { username?: string } } | null;
  created_at?: string;
};

export default function VetDashboardPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [status, setStatus] = useState<"AVAILABLE" | "OFFLINE" | "BUSY">("AVAILABLE");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Consultation queue is live.");
  const [diagnosis, setDiagnosis] = useState("Mastitis and reduced appetite");
  const [medicine, setMedicine] = useState("Amoxicillin 20mg/kg");
  const [instructions, setInstructions] = useState("Administer once daily for 5 days. Continue hydration monitoring and reassess after 48 hours.");

  // Protect this route - only vets can access
  useRoleProtection("vet");

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.access) {
      window.location.assign("/auth");
      return;
    }

    fetchJson<PendingRequest[]>("/vet/request/list/", { method: "GET" })
      .then((data) => {
        setRequests(data || []);
        if (data?.[0]) setSelectedRequest(data[0]);
      })
      .catch((error) => {
        console.error(error);
        setNotice("Unable to load pending requests.");
      });
  }, []);

  useEffect(() => {
    if (!selectedRequest && requests[0]) setSelectedRequest(requests[0]);
  }, [requests, selectedRequest]);

  const selectedId = selectedRequest?.id?.toString();

  const countdown = useMemo(() => {
    const total = 14 * 60;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }, []);

  async function updateVetStatus(nextStatus: "AVAILABLE" | "OFFLINE" | "BUSY") {
    const auth = getStoredAuth();
    if (!auth?.access) {
      window.location.assign("/auth");
      return;
    }

    try {
      const result = await fetchJson<{ success?: boolean; status?: string; message?: string }>("/vet/status/", {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatus((result.status as any) ?? nextStatus);
      setNotice(result.message ?? `Status changed to ${nextStatus}.`);
    } catch (error) {
      console.error(error);
      setNotice("Status update failed. Please try again.");
    }
  }

  async function acceptRequest(requestId: number | string) {
    try {
      const result = await fetchJson<{ success?: boolean; message?: string; meeting_link?: string; join_url?: string }>(`/vet/request/accept/${requestId}/`, {
        method: "POST",
      });
      setBusy(true);
      setNotice(result.message ?? "Request accepted.");
      if (result.meeting_link || result.join_url) {
        window.open(result.meeting_link || result.join_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error(error);
      setNotice("Unable to accept this request.");
    }
  }

  function submitPrescription() {
    setNotice("Prescription sent successfully to the farmer.");
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-text">
      <header className="border-b border-border-light bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white"><Stethoscope className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Agricore</p>
              <h1 className="text-lg font-bold text-primary">Vet Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-border-light bg-background-alt p-2 text-text-secondary"><Bell className="h-4 w-4" /></button>
            <button
              onClick={() => updateVetStatus(status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE")}
              className={`rounded-full px-4 py-2 text-xs font-bold ${status === "AVAILABLE" ? "bg-primary text-white" : "bg-[#E6EFEA] text-primary"}`}
            >
              {status === "AVAILABLE" ? "Active" : "Offline"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Tuesday, October 17, 2023</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-primary">Welcome back, Dr. {getStoredAuth()?.username ?? "Vet"}</h2>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border-light bg-white p-3 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF4EF] text-primary"><CalendarDays className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Urgent cases</p>
              <p className="text-sm font-bold text-primary">{requests.filter((request) => request.status === "PENDING").length} pending</p>
            </div>
          </div>
        </div>

        <div className="mb-7 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF3F2] text-primary"><ClipboardList className="h-5 w-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Live</span>
            </div>
            <p className="text-2xl font-bold text-primary">{requests.length}</p>
            <p className="mt-1 text-sm font-semibold text-text-secondary">Pending Requests</p>
            <p className="mt-2 text-[11px] text-text-muted">Review and respond to open farmer consultations.</p>
          </div>

          <div className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F7ED] text-[#168268]"><CheckCircle2 className="h-5 w-5" /></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Trend</span>
            </div>
            <p className="text-2xl font-bold text-primary">92%</p>
            <p className="mt-1 text-sm font-semibold text-text-secondary">Success Consultations</p>
            <p className="mt-2 text-[11px] text-text-muted">Positive treatment outcomes from the last 30 days.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-border-light bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Queue</p>
                <h3 className="text-lg font-bold text-primary">Consultation requests</h3>
              </div>
              <button className="rounded-full bg-[#EAF4EF] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">{requests.filter((request) => request.status === "PENDING").length} new</button>
            </div>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border-light bg-background-alt p-4 text-sm text-text-secondary">No pending requests.</div>
              ) : (
                requests.map((request) => (
                  <button
                    key={String(request.id)}
                    onClick={() => setSelectedRequest(request)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${selectedId === String(request.id) ? "border-primary bg-[#EEF8F3]" : "border-border-light bg-background-alt hover:border-primary/50"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-primary">{request.farmer?.name ?? request.farmer?.username ?? "Farmer"}</p>
                        <p className="text-[10px] text-text-secondary">Cow / Livestock</p>
                      </div>
                      <span className="rounded-full bg-[#FFF0F0] px-2 py-1 text-[9px] font-bold text-[#C34A4A]">High</span>
                    </div>
                    <p className="text-[11px] text-text-secondary">{request.problem ?? request.description ?? "General livestock concern"}</p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-text-muted">
                      <span>{request.created_at ? new Date(request.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now"}</span>
                      <span className="rounded-full px-2 py-1 font-bold bg-[#FFF4DF] text-[#B86B00]">{request.status ?? "PENDING"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="space-y-6">
            {selectedRequest && (
              <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Selected case</p>
                    <h3 className="text-xl font-bold text-primary">{selectedRequest.farmer?.name ?? selectedRequest.farmer?.username ?? "Farmer"}</h3>
                  </div>
                  <button onClick={() => acceptRequest(String(selectedRequest.id))} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"><HeartPulse className="h-4 w-4" /> Accept request</button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-background-alt p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Patient</p>
                    <p className="mt-2 text-lg font-bold text-primary">Cross Cow / Cattle</p>
                    <p className="mt-3 text-sm text-text-secondary">Issue tag: {selectedRequest.problem ?? "Livestock concern"}</p>
                  </div>
                  <div className="rounded-2xl bg-background-alt p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Call window</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{countdown}</p>
                    <p className="mt-2 text-sm text-text-secondary">Farmer at Bogura, Bangladesh</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => acceptRequest(String(selectedRequest.id))} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"><ShieldCheck className="h-4 w-4" /> Accept case</button>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-[#EED3D3] bg-[#FFF5F5] px-4 py-2.5 text-xs font-bold text-[#C34A4A]"><XCircle className="h-4 w-4" /> Decline</button>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border-light bg-white px-4 py-2.5 text-xs font-bold text-primary"><MessageSquareText className="h-4 w-4" /> Message farmer</button>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border-light bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">Prescription</p>
                  <h3 className="text-lg font-bold text-primary">Digital Rx pad</h3>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-[#EAF4EF] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-primary"><UserRoundCheck className="h-3.5 w-3.5" /> Save note</button>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-sm font-semibold text-text-secondary">
                  Diagnosed Disease
                  <textarea value={diagnosis} onChange={(event) => setDiagnosis(event.target.value)} className="mt-2 min-h-[130px] w-full rounded-2xl border border-border-light bg-background-alt p-4 text-sm text-text-secondary outline-none" />
                </label>
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-text-secondary">
                    Prescribed Medicine & Dosage
                    <input value={medicine} onChange={(event) => setMedicine(event.target.value)} className="mt-2 w-full rounded-2xl border border-border-light bg-background-alt p-3 text-sm text-text-secondary outline-none" />
                  </label>
                  <label className="block text-sm font-semibold text-text-secondary">
                    Dosage & Instructions
                    <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} className="mt-2 min-h-[130px] w-full rounded-2xl border border-border-light bg-background-alt p-4 text-sm text-text-secondary outline-none" />
                  </label>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-light pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">Route to pharmacy</div>
                <button onClick={submitPrescription} className="rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white">Submit Digital Prescription & Route to Pharmacy</button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-border-light bg-[#EEF8F3] px-4 py-3 text-sm font-medium text-primary shadow-sm">
          {notice}
        </div>
      </main>
    </div>
  );
}
