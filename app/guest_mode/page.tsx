'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamic import with SSR disabled to bypass cache mismatch
const GuestConsultationForm = dynamic(
  () => import('@/components/guest/GuestConsultationForm'),
  { ssr: false }
);

export default function GuestModePage() {
  return (
    <div className="guest-page min-h-screen text-[#14352f] flex flex-col">
      <header className="guest-header w-full">
        <div className="guest-header-inner">
          <Link
            href="/"
            aria-label="Back to home"
            className="guest-back-link"
          >
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            <span>Back to home</span>
          </Link>
          <Link href="/" className="guest-brand" aria-label="AgriVet home">
            <span className="guest-brand-mark"><span className="material-symbols-outlined" aria-hidden="true">eco</span></span>
            Agri<span>Vet</span>
          </Link>
          <span className="guest-header-note">Guest access</span>
        </div>
      </header>

      <main className="guest-main flex-grow">
        <GuestConsultationForm />
      </main>
    </div>
  );
}