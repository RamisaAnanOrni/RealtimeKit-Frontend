"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getVetProfile } from "@/lib/api";

type VetProfile = {
  full_name: string;
  phone: string;
  nid: string;
  university: string;
  cgpa: string;
  license_id: string;
  experience: number;
};

const EMPTY_PROFILE: VetProfile = {
  full_name: "",
  phone: "",
  nid: "",
  university: "",
  cgpa: "",
  license_id: "",
  experience: 0,
};

const fieldClass =
  "text-sm text-[#17352d]";

function FieldRow({ label, value }: { label: string; value: string | number }) {
  const display = String(value ?? "").trim() || "—";
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[#e8f2ef] py-3.5 last:border-0">
      <span className="text-xs font-semibold text-[#59736a]">{label}</span>
      <span className={fieldClass}>{display}</span>
    </div>
  );
}

export default function VetProfilePage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [profile, setProfile] = useState<VetProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getVetProfile();
      setProfile({ ...EMPTY_PROFILE, ...data });
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      if (/403|permission/i.test(msg)) {
        setError("You do not have veterinarian access. Redirecting to sign in...");
        setTimeout(() => router.replace("/auth"), 1500);
      } else if (/401|unauthorized|invalid/i.test(msg)) {
        setError("Your session has expired. Redirecting to sign in...");
        setTimeout(() => router.replace("/auth"), 1500);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "vet") {
      router.replace("/auth");
      return;
    }
    void Promise.resolve().then(() => load());
  }, [authLoading, user, load, router]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#edf4f1]">
        <Loader2 className="h-6 w-6 animate-spin text-[#063b2b]" />
      </main>
    );
  }

  const displayName = profile.full_name || user?.username || "Veterinarian";

  return (
    <main className="min-h-screen bg-[#edf4f1] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/vet/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#59736a] hover:text-[#063b2b]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] shadow-xl shadow-[#063b2b]/5">
          <header className="bg-[#063b2b] px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <span className="text-2xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Dr. {displayName}</h1>
                <p className="text-sm text-[#d7f4e9]/80">Veterinary Profile</p>
              </div>
            </div>
          </header>

          <div className="px-6 py-2">
            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#063b2b]" />
              </div>
            ) : (
              <>
                <div className="mt-2">
                  <FieldRow label="Full Name" value={`Dr. ${displayName}`} />
                  <FieldRow label="Phone" value={profile.phone} />
                  <FieldRow label="NID Number" value={profile.nid} />
                  <FieldRow label="University" value={profile.university} />
                  <FieldRow label="CGPA" value={profile.cgpa} />
                  <FieldRow label="License ID" value={profile.license_id} />
                  <FieldRow label="Years of Experience" value={profile.experience} />
                </div>
                <p className="mt-5 flex items-center justify-center gap-1.5 pb-2 text-center text-[10px] text-[#71877f]">
                  <Mail className="h-3 w-3" /> Keep your credentials up to date to receive consultation requests.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}