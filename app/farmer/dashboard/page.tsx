"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ClipboardCheck, Filter, HeartPulse, Leaf, Menu, PawPrint, PhoneCall, ShieldAlert, Star, Wheat, X } from "lucide-react";
import { clearAuth, fetchJson, getStoredAuth } from "@/lib/api";

type DashboardLog = {
  id: string;
  animal_id?: string;
  treatment: string;
  date: string;
  status: string;
};

type DashboardData = {
  user: { id?: number; name: string; phone?: string };
  appointments: number;
  rewards: number;
  livestock: { cattle: number; poultry: number; goats: number };
  logs: DashboardLog[];
};

const emptyDashboard: DashboardData = {
  user: { name: "Farmer" },
  appointments: 0,
  rewards: 0,
  livestock: { cattle: 0, poultry: 0, goats: 0 },
  logs: [],
};

const livestockCards = [
  { label: "Cattle", detail: "2 due for checkup", icon: Leaf, color: "bg-[#E4EFEB] text-primary" },
  { label: "Poultry", detail: "Healthy flock", icon: PawPrint, color: "bg-[#FFF0D4] text-[#B86B00]" },
  { label: "Goats", detail: "1 vaccination due", icon: Wheat, color: "bg-[#DDF7ED] text-[#168268]" },
];

export default function FarmerDashboardPage() {
  const [notice, setNotice] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboard);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth?.access) {
      window.location.assign("/auth");
      return;
    }

    fetchJson<DashboardData>("/farmer/dashboard/", { method: "GET" })
      .then((data) => {
        setDashboard({
          ...emptyDashboard,
          ...data,
          user: data.user ?? { name: auth.username ?? "Farmer" },
          livestock: {
            cattle: data.livestock?.cattle ?? 0,
            poultry: data.livestock?.poultry ?? 0,
            goats: data.livestock?.goats ?? 0,
          },
          logs: data.logs ?? [],
        });
      })
      .catch((error) => {
        console.error(error);
        showNotice("Dashboard data could not be loaded.");
      })
      .finally(() => setLoadingDashboard(false));
  }, []);

  async function logout() {
    clearAuth();
    window.location.assign("/auth");
  }

  const morningText = useMemo(() => `Hello, ${dashboard.user.name}`, [dashboard.user.name]);

  if (loadingDashboard) return <div className="flex min-h-screen items-center justify-center text-sm font-semibold text-text-secondary">Loading your farm dashboard...</div>;

  return (
    <div id="top" className="min-h-screen bg-[#FBFCF9] text-text">
      <header className="sticky top-0 z-20 border-b border-border-light bg-[#FBFCF9]/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <a href="#top" className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white"><Wheat className="h-4 w-4" /></span>
            Agricore <span className="font-medium text-text-secondary">VetCare</span>
          </a>
          <nav className="hidden items-center gap-8 text-xs font-semibold text-text-secondary md:flex" aria-label="Main navigation">
            <a className="border-b-2 border-primary py-7 text-primary" href="#consultation">Tele-Health</a>
            <a className="transition hover:text-primary" href="#livestock">My Livestock</a>
            <a className="transition hover:text-primary" href="#rewards">Rewards</a>
          </nav>
          <div className="relative flex items-center gap-3">
            <button aria-label="Notifications" className="hidden rounded-full p-2 text-text-secondary hover:bg-background-alt hover:text-primary sm:block"><Bell className="h-[18px] w-[18px]" /></button>
            <button aria-label="Open profile" onClick={() => setProfileOpen(!profileOpen)} className="hidden rounded-full p-2 text-text-secondary hover:bg-background-alt hover:text-primary sm:block"><span className="text-base">◉</span></button>
            {profileOpen && (
              <div className="absolute right-28 top-12 z-30 w-36 rounded-xl border border-border-light bg-white p-2 shadow-lg">
                <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-[#C34A4A] hover:bg-[#FFF0F0]">Logout</button>
              </div>
            )}
            <button onClick={() => showNotice("Emergency call requested. A care coordinator will contact you shortly.")} className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[11px] font-bold text-white shadow-sm hover:bg-primary-light sm:flex"><PhoneCall className="h-3.5 w-3.5" /> Emergency Call</button>
            <button aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-primary md:hidden">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-border-light bg-surface px-5 py-3 md:hidden">
            <div className="flex flex-col gap-3 text-sm font-semibold text-primary">
              <a href="#consultation" onClick={() => setMenuOpen(false)}>Tele-Health</a>
              <a href="#livestock" onClick={() => setMenuOpen(false)}>My Livestock</a>
              <a href="#rewards" onClick={() => setMenuOpen(false)}>Rewards</a>
              <button onClick={logout} className="border-t border-border-light pt-3 text-left text-[#C34A4A]">Logout</button>
            </div>
          </div>
        )}
      </header>

      {notice && (
        <div role="status" className="fixed right-5 top-20 z-30 flex max-w-xs items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg">
          <ClipboardCheck className="h-4 w-4 shrink-0" />{notice}
        </div>
      )}

      <main className="mx-auto max-w-[1240px] px-5 pb-14 pt-10 sm:px-8 lg:px-10 lg:pt-14">
        <section id="consultation" className="mb-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal">Tuesday, October 17, 2023</p>
            <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{morningText}</h1>
            <p className="mt-3 text-sm text-text-secondary">Your farm is looking healthy today. <span className="font-semibold text-primary">{dashboard.appointments} upcoming appointments.</span></p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => showNotice("Opening tele-health consultation...")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-primary-light"><HeartPulse className="h-4 w-4" /> Start Tele-Health Consultation</button>
            <button onClick={() => showNotice("Emergency report started.")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFF0F0] px-5 py-3.5 text-xs font-bold text-[#C34A4A] hover:bg-[#FFE3E3]"><ShieldAlert className="h-4 w-4" /> Report Emergency</button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div id="livestock" className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Farm snapshot</p>
                <h2 className="mt-1 text-lg font-bold text-primary">Livestock Overview</h2>
              </div>
              <button onClick={() => showNotice("All livestock records are up to date.")} className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-primary">View All</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {livestockCards.map(({ label, detail, icon: Icon, color }, index) => (
                <div key={label} className={`rounded-xl p-4 ${color}`}>
                  <div className="mb-5 flex items-center justify-between">
                    <Icon className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
                  </div>
                  <div className="text-2xl font-bold">{Object.values(dashboard.livestock)[index]}</div>
                  <p className="mt-1 text-[11px] font-medium opacity-75">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="rewards" className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-sm">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[18px] border-white/5" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#A9D8C8]">Keep growing</p>
                  <h2 className="mt-1 text-lg font-bold">Farm Rewards</h2>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber text-primary"><Star className="h-4 w-4 fill-current" /></span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight">{dashboard.rewards}</span>
                <span className="mb-1 text-sm font-bold text-[#A9D8C8]">Pts</span>
              </div>
              <p className="mt-1 text-xs text-[#B9D5CC]">Rewards earned from healthy farm care</p>
              <button onClick={() => showNotice("Rewards catalog coming soon.")} className="mt-6 rounded-lg bg-white px-4 py-2 text-[11px] font-bold text-primary hover:bg-[#E7F4EF]">Redeem Now</button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-border-light bg-surface p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Care history</p>
              <h2 className="mt-1 text-lg font-bold text-primary">Recent Medical Logs</h2>
            </div>
            <button aria-label="Filter medical logs" onClick={() => showNotice("Filter options are ready.")} className="rounded-lg p-2 text-text-secondary hover:bg-background-alt hover:text-primary"><Filter className="h-4 w-4" /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-b border-border-light text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  <th className="pb-3 pl-2">Animal ID</th>
                  <th className="pb-3">Treatment / Checkup</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.logs.map((log) => (
                  <tr key={log.id} className="border-b border-border-light last:border-0">
                    <td className="py-4 pl-2 text-xs font-bold text-primary">{log.animal_id ?? log.id}</td>
                    <td className="py-4 text-xs font-medium text-text-secondary">{log.treatment}</td>
                    <td className="py-4 text-xs text-text-secondary">{log.date}</td>
                    <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${log.status === "Completed" ? "bg-[#E5F5EB] text-success" : "bg-[#FFF0D4] text-[#B86B00]"}`}>{log.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
