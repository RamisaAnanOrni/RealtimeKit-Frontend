"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileText, Zap } from "lucide-react";
import ConsultationRequestForm from "@/components/ConsultationRequestForm";

const BENEFITS = [
  {
    icon: Zap,
    title: "Instant Consultation",
    description: "Connect with a certified vet in minutes.",
  },
  {
    icon: FileText,
    title: "Digital Prescription",
    description: "Receive and share e-prescriptions securely.",
  },
  {
    icon: Clock,
    title: "24/7 SLA",
    description: "Around-the-clock emergency support.",
  },
];

export default function ConsultationPage() {
  const router = useRouter();

  const handleSuccess = (consultationId: number) => {
    // Redirect to consultation status page
    router.push(`/farmer/consultation/${consultationId}/status`);
  };

  return (
    <main className="min-h-screen bg-[#edf4f1] p-0 sm:p-4 lg:p-8">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl overflow-hidden rounded-none bg-[#fbfcfa] shadow-2xl shadow-[#063b2b]/15 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left — Green Hero Sidebar (replicated from AuthPanel) */}
        <aside className="relative hidden overflow-hidden bg-[#063b2b] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,#fff_26%,transparent_27%,transparent_75%,#fff_76%,transparent_77%)] bg-size-[24px_24px] opacity-10" />

          <div className="relative">
            <Link href="/farmer/dashboard" className="text-lg font-bold tracking-tight">
              ✣ Agricore VetCare
            </Link>
            <div className="mt-20 max-w-sm">
              <span className="rounded-full border border-[#d7f4e9]/25 bg-[#d7f4e9]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d7f4e9]">
                ● Secure tele-health
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight">
                A Safe &amp; Secure Platform Connecting Livestock Farmers with
                Expert Veterinarians
              </h1>
              <p className="mt-5 text-sm leading-6 text-[#d7f4e9]/75">
                Empowering Bangladesh&apos;s agriculture with instant veterinary
                support, real-time health monitoring, and professional livestock
                management.
              </p>
            </div>
          </div>

          <div className="relative">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[#d7f4e9]/60">
              Key Benefits
            </p>
            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#063b2b]/60 text-[#d7f4e9]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <strong className="block text-sm font-semibold text-[#d7f4e9]">
                      {title}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-[#d7f4e9]/60">
                      {description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/75 p-4 text-[#063b2b] shadow-lg">
                <strong className="block text-2xl text-[#e4ad43]">10,000+</strong>
                <span className="text-[10px]">Certified Vets</span>
              </div>
              <div className="rounded-xl bg-white/75 p-4 text-[#063b2b] shadow-lg">
                <strong className="block text-2xl text-[#e4ad43]">5-Min</strong>
                <span className="text-[10px]">Emergency SLA</span>
              </div>
            </div>

            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image
                src="/cow%20(2).jpg"
                alt="Veterinary care for livestock"
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </aside>

        {/* Right — Consultation Request Form */}
        <section className="flex min-w-0 flex-col px-5 py-6 sm:px-10 sm:py-10 lg:px-20 lg:py-12">
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            <button
              type="button"
              onClick={() => router.push("/farmer/dashboard")}
              className="mb-5 self-start text-xs font-medium text-[#59736a] hover:text-[#063b2b]"
            >
              ← Back to Dashboard
            </button>

            <p className="text-xs font-medium text-[#59736a]">Tele-Health Consultation</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#063b2b]">
              Request a Veterinarian Consultation
            </h2>
            <p className="mt-2 text-xs text-[#71877f]">
              Tell us about your animal and the health concern — a vet will
              respond shortly.
            </p>

            <ConsultationRequestForm onSuccess={handleSuccess} />
          </div>
        </section>
      </div>
    </main>
  );
}