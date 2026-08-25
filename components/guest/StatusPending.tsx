'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface StatusPendingProps {
  problem?: string;
  phone?: string;
}

export default function StatusPending({
  problem = 'Goat not eating',
  phone = '01xxxx',
}: StatusPendingProps) {
  
  const [isCallReady, setIsCallReady] = useState(false);
  const [vetName, setVetName] = useState('Dr. Sarah Jenkins');

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCallReady(true);
    }, 5000); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#f8f9ff] text-[#0d1c2e] min-h-screen font-sans antialiased md:bg-[#eff4ff] pb-[100px]">
      
      {/* TopAppBar */}
      <header className="w-full sticky top-0 bg-[#f8f9ff] shadow-sm z-40">
        <div className="flex items-center justify-between px-5 h-[64px] max-w-[600px] mx-auto">
          <Link 
            href="/guest_mode"
            className="p-2 -ml-2 rounded-full hover:bg-[#dce9ff] transition-colors active:scale-95 text-[#0d1c2e] flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-[20px] font-semibold text-[#00685f]">Status</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-[600px] mx-auto px-5 pt-6 flex flex-col gap-6">
        
        {/* Summary Card */}
        <section className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1 text-[#00685f]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.5 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm15 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8.5 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 10c-3.87 0-7 2.24-7 5 0 2.25 2.21 4.14 5.31 4.76.54.11 1.09.24 1.69.24s1.15-.13 1.69-.24C16.79 19.14 19 17.25 19 15c0-2.76-3.13-5-7-5z" />
            </svg>
            <h2 className="text-[14px] font-semibold text-[#0d1c2e]">
              Consultation Request
            </h2>
          </div>
          
          <div className="bg-[#eff4ff] rounded-lg p-3">
            <p className="text-[12px] font-medium text-[#3d4947] mb-1">
              Reported Problem
            </p>
            <p className="text-[14px] text-[#0d1c2e]">
              {problem}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[#3d4947]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <p className="text-[14px]">
              {phone}
            </p>
          </div>
        </section>

        {/* Dynamic Status Card */}
        <section className="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center justify-center gap-6 min-h-[320px] transition-all">
          {isCallReady ? (
            /* 1st Screenshot: LINK READY State */
            <>
              {/* Badge */}
              <div className="bg-[#E6F4EA] text-[#137333] text-[12px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#CEEAD6]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                <span>LINK READY</span>
              </div>

              {/* Title & Vet Subtitle */}
              <div className="text-center">
                <h3 className="text-[22px] font-bold text-[#0d1c2e] mb-2">
                  Veterinarian Available
                </h3>
                <p className="text-[14px] text-[#3d4947] max-w-[280px] mx-auto leading-relaxed">
                  <span className="font-semibold text-[#0d1c2e]">{vetName}</span> is ready to begin your video consultation.
                </p>
              </div>

              {/* Join Call Button */}
              <div className="w-full max-w-[280px]">
                <button
                  onClick={() => alert('Joining call...')}
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-[15px] py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                  <span>JOIN CALL</span>
                </button>
              </div>

              <p className="text-[12px] text-[#707977] font-medium">
                Estimated duration: 15-20 mins
              </p>
            </>
          ) : (
            /* 2nd Screenshot: PENDING State */
            <>
              {/* Pending Badge */}
              <div className="bg-[#FEF3C7] text-[#B45309] text-[12px] font-medium px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Pending</span>
              </div>

              {/* Central Spinner */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#dce9ff]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-[#00685f] border-t-transparent animate-spin"></div>
                <svg className="w-8 h-8 text-[#00685f] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                </svg>
              </div>

              {/* Status Text */}
              <div className="text-center">
                <h3 className="text-[20px] font-semibold text-[#0d1c2e] mb-1">
                  Waiting for a moment...
                </h3>
                <p className="text-[14px] text-[#3d4947]">
                  A veterinarian is reviewing your request<br />and will connect shortly.
                </p>
              </div>
            </>
          )}
        </section>

        {/* Back Button */}
        <div className="w-full">
          <Link
            href="/guest_mode"
            className="w-full bg-white text-[#00685f] border border-[#00685f] font-semibold text-[16px] py-3 rounded-xl flex items-center justify-center hover:bg-[#f8f9ff] active:scale-95 transition-all shadow-sm"
          >
            Back
          </Link>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 rounded-t-xl bg-white border-t border-[#bcc9c6] shadow-[0px_-4px_20px_rgba(13,148,136,0.05)] md:hidden">
        <div className="flex justify-around items-center h-[80px] px-4 max-w-[600px] mx-auto gap-2">
          <button className="flex flex-col items-center justify-center text-[#3d4947] hover:bg-[#dbe4ea]/50 active:scale-90 transition-all rounded-xl px-4 py-1 flex-1">
            <span className="text-[12px] font-medium">Home</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-[#3d4947] hover:bg-[#dbe4ea]/50 active:scale-90 transition-all rounded-xl px-4 py-1 flex-1">
            <span className="text-[12px] font-medium">Consults</span>
          </button>
          
          <button className="flex flex-col items-center justify-center text-[#3d4947] hover:bg-[#dbe4ea]/50 active:scale-90 transition-all rounded-xl px-4 py-1 flex-1">
            <span className="text-[12px] font-medium">Pets</span>
          </button>
          
          <button className="flex flex-col items-center justify-center bg-[#00685f] text-white hover:bg-[#00685f]/90 active:scale-90 transition-all rounded-xl px-4 py-2 flex-1">
            <span className="text-[12px] font-bold">Status</span>
          </button>
        </div>
      </nav>
    </div>
  );
}