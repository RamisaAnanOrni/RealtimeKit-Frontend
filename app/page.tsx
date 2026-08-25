import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/50 bg-white/75 shadow-sm backdrop-blur-xl supports-backdrop-filter:bg-white/60 transition-all duration-300">
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-margin-mobile md:h-20 md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
            <span className="text-lg sm:text-2xl font-bold text-primary tracking-tight">
              Agricore VetCare
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#"
              className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
            >
              Tele-Health
            </Link>
            <Link
              href="#"
              className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
            >
              Veterinarians
            </Link>
            <Link
              href="#"
              className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              href="#"
              className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
            >
              Farm Rewards
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden md:flex bg-error-red text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-error transition-colors items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                emergency
              </span>
              Emergency CTA
            </button>
            <button aria-label="Open navigation menu" className="md:hidden text-primary p-2">
              <span className="material-symbols-outlined text-[28px]">
                menu
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative isolate flex min-h-140 w-full items-center justify-center overflow-hidden bg-primary-dark sm:min-h-150 lg:min-h-155">
          <div className="absolute inset-0 z-0 bg-primary-dark">
            <Image
              src="/cow%20(2).jpg"
              alt="Healthy brown cow on a farm"
              fill
              priority
              className="object-contain object-right"
            />
            <div className="absolute inset-0 bg-linear-to-r from-primary-dark via-primary/75 to-primary/15" />
          </div>

          <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center">
            <div className="w-full max-w-2xl py-20 text-left sm:py-24 md:w-3/5 lg:py-28">
              <span className="inline-block py-1 px-3 rounded-full bg-surface-container-highest/20 text-primary-fixed text-sm font-semibold mb-6 border border-primary-fixed/20 backdrop-blur-sm">
                Trusted by 10,000+ Farmers
              </span>
              <h1 className="mb-6 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                Professional Veterinary Care for Every Farm.
              </h1>
              <p className="mb-10 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                Empowering Bangladeshi farmers with 24/7 tele-health, expert
                consultations, and a reliable medicine marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth" className="flex items-center justify-center gap-2 rounded-full bg-primary-fixed px-6 py-3.5 text-sm font-semibold text-on-primary-fixed shadow-lg shadow-black/15 transition-all hover:bg-primary-fixed-dim sm:px-8 sm:py-4">
                  Start Consultation
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </Link>
                <Link href="/guest" className="flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 sm:px-8 sm:py-4">
                  <span className="material-symbols-outlined text-sm">
                    call
                  </span>
                  Emergency Call
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="relative z-20 mx-auto -mt-8 w-[calc(100%-2rem)] max-w-5xl rounded-xl border border-white/15 bg-primary-container py-6 text-on-primary shadow-2xl shadow-primary/20 sm:py-8 md:py-10">
          <div className="grid grid-cols-3 divide-x divide-outline-variant/30">
            <div className="flex flex-col items-center justify-center px-6">
                <span className="text-3xl md:text-5xl font-bold text-primary-fixed mb-2">
                10k+
              </span>
              <span className="text-sm font-semibold text-primary-fixed-dim uppercase tracking-wider">
                Farmers Served
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-6">
                <span className="text-3xl md:text-5xl font-bold text-primary-fixed mb-2">
                500+
              </span>
              <span className="text-sm font-semibold text-primary-fixed-dim uppercase tracking-wider">
                Certified Vets
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-6">
                <span className="text-3xl md:text-5xl font-bold text-primary-fixed mb-2">
                100k+
              </span>
              <span className="text-sm font-semibold text-primary-fixed-dim uppercase tracking-wider">
                Healthy Livestock
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-surface-border w-full mt-16">
        <div className="w-full py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-primary text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                pets
              </span>
              <span className="text-2xl font-bold text-primary">
                Agricore VetCare
              </span>
            </div>
            <p className="text-base text-on-surface-variant">
              Providing professional, accessible veterinary care and authentic
              medicines for every farm in Bangladesh.
            </p>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-primary mb-2">
              Platform
            </h4>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Care Guides
            </Link>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Pharmacy Locator
            </Link>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Support
            </Link>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-primary mb-2">Legal</h4>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Legal Information
            </Link>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-base text-on-surface-variant hover:underline hover:text-primary transition-all duration-200"
            >
              Terms of Service
            </Link>
          </div>

          <div className="col-span-1 flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-primary mb-2">Contact</h4>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">mail</span>
              <span className="text-base">support@agricorevet.com</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant mt-2">
              <span className="material-symbols-outlined text-sm">phone</span>
              <span className="text-base">16244 (24/7 Hotline)</span>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-surface-border py-6 mt-8">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex justify-center items-center">
            <p className="text-base text-on-surface-variant text-center">
              © 2026 Agricore VetCare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}