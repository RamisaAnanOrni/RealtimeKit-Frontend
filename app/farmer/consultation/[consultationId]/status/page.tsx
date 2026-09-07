"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ConsultationStatusPage from "@/components/ConsultationStatusPage";
import BackButton from "@/components/BackButton";
import { getStoredAuth } from "@/lib/api";

export default function ConsultationStatusRoute() {
  const router = useRouter();
  const params = useParams();
  const consultationId = Number(params?.consultationId);

  useEffect(() => {
    // Check authentication
    const auth = getStoredAuth();
    if (!auth?.access) {
      router.push("/auth");
    }
  }, [router]);

  if (!consultationId || isNaN(consultationId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Invalid Consultation ID
          </h1>
          <p className="text-text-muted mt-2">
            The consultation ID is missing or invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-light py-12 px-4">
      <div className="w-full max-w-2xl mx-auto mb-6">
        <BackButton href="/farmer/consultation" label="Back to Consultation" />
      </div>
      <ConsultationStatusPage consultationId={consultationId} />
    </div>
  );
}

