"use client";

import { useRouter } from "next/navigation";
import ConsultationRequestForm from "@/components/ConsultationRequestForm";
import BackButton from "@/components/BackButton";

export default function ConsultationPage() {
  const router = useRouter();

  const handleSuccess = (consultationId: number) => {
    // Redirect to consultation status page
    router.push(`/farmer/consultation/${consultationId}/status`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-light py-12 px-4">
      <div className="w-full max-w-2xl mx-auto mb-6">
        <BackButton href="/farmer/dashboard" label="Back to Dashboard" />
      </div>
      <ConsultationRequestForm onSuccess={handleSuccess} />
    </div>
  );
}
