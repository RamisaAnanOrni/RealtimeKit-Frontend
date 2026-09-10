"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Wheat } from "lucide-react";
import { useRoleProtection } from "@/hooks/useRoleProtection";
import { getFarmerProfile } from "@/lib/api";

type FarmerProfile = {
  id?: number;
  full_name: string;
  phone: string;
  username?: string;
  role?: string;
};

function FieldRow({ label, value }: { label: string; value: string | number }) {
  const display = String(value ?? "").trim() || "—";
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[#e8f2ef] py-3.5 last:border-0">
      <span className="text-xs font-semibold text-[#59736a]">{label}</span>
      <span className="text-sm text-[#17352d]">{display}</span>
    </div>
  );
}

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useRoleProtection("farmer");

  useEffect(() => {
    let cancelled = false;
    getFarmerProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setError("Profile could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = profile?.full_name || "Farmer";

  return (
    <main className="min-h-screen bg-[#edf4f1] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/farmer/dashboard"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#59736a] hover:text-[#063b2b]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <section className="overflow-hidden rounded-2xl border border-[#d7e3df] bg-[#fbfcfa] shadow-xl shadow-[#063b2b]/5">
          <header className="bg-[#063b2b] px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                <span className="text-2xl font-bold">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{displayName}</h1>
                <p className="text-sm text-[#d7f4e9]/80">Farmer Profile</p>
              </div>
            </div>
          </header>

          <div className="px-6 py-2">
            {error && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
            {!profile && !error ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#063b2b]" />
              </div>
            ) : (
              <div className="mt-2">
                <FieldRow label="Full Name" value={profile?.full_name ?? ""} />
                <FieldRow label="Phone" value={profile?.phone ?? ""} />
                <FieldRow label="Role" value={profile?.role ? "Farmer" : ""} />
              </div>
            )}
            <p className="mt-5 flex items-center justify-center gap-1.5 pb-2 text-center text-[10px] text-[#71877f]">
              <Wheat className="h-3 w-3" /> Agricore VetCare — Farmer Account
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}