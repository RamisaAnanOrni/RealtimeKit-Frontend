"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent, useState } from "react";
import { getStoredAuth, loginWithBackend, normalizeRole, registerWithBackend, saveAuth } from "@/lib/api";

type Mode = "login" | "signup";
type Role = "farmer" | "vet";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d7e3df] bg-white px-3 text-sm text-[#17352d] outline-none transition placeholder:text-[#8aa099] focus:border-[#07533f] focus:ring-2 focus:ring-[#07533f]/10";

export default function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("farmer");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);
    const phone = (formData.get("phone") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();
    const fullName = (formData.get("fullName") ?? "").toString().trim();

    try {
      let result: any;

      if (mode === "login") {
        result = await loginWithBackend({ username: phone, password });
      } else {
        // Normalize role to UPPERCASE for backend (VET or FARMER)
        const normalizedRole = role === "vet" ? "VET" : "FARMER";
        
        const signupPayload: Record<string, string> = { phone, fullName, password, role: normalizedRole };
        if (normalizedRole === "VET") {
          signupPayload.nid = (formData.get("nid") ?? "").toString().trim();
          signupPayload.university = (formData.get("university") ?? "").toString().trim();
          signupPayload.cgpa = (formData.get("cgpa") ?? "").toString().trim();
          signupPayload.yearsOfExperience = (formData.get("yearsOfExperience") ?? "0").toString().trim();
          signupPayload.licenseId = (formData.get("licenseId") ?? "").toString().trim();
        }
        console.log("[AuthPanel] Signup Payload:", signupPayload);
        
        result = await registerWithBackend(signupPayload as any);
      }

      if (!result || result.detail || result.error) {
        throw new Error(result?.detail ?? result?.message ?? result?.error ?? "Authentication failed");
      }

      // For signup, no JWT token is returned - redirect to login
      if (mode === "signup") {
        setMessage("Account created successfully! Please log in with your phone number and password.");
        // Automatically switch to login mode after a brief delay
        setTimeout(() => {
          switchMode("login");
        }, 1500);
        setLoading(false);
        return;
      }

      // For login, expect JWT token
      const token = result.access ?? result.access_token;
      if (!token) {
        throw new Error("JWT token was not returned by the backend.");
      }

      // Extract role from backend response (explicit and required for login)
      const backendRole = result.role;
      console.log("[AuthPanel] Login response - role from backend:", backendRole);

      const resolvedRole = normalizeRole(backendRole || "farmer");
      console.log("[AuthPanel] Resolved role:", resolvedRole);

      const authPayload = {
        access: token,
        refresh: result.refresh,
        role: resolvedRole, // IMPORTANT: Store normalized role
        username: result.username ?? phone,
      };

      console.log("[AuthPanel] Saving auth payload:", {
        access: token ? "***[token]***" : "MISSING",
        refresh: result.refresh ? "***[token]***" : "MISSING",
        role: authPayload.role,
        username: authPayload.username,
      });

      saveAuth(authPayload);
      setMessage("Login successful.");

      const destination = resolvedRole === "vet" ? "/vet/dashboard" : "/farmer/dashboard";
      console.log("[AuthPanel] Redirecting to:", destination);

      if (typeof window !== "undefined") {
        window.location.assign(destination);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#edf4f1] p-0 sm:p-4 lg:p-8">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl overflow-hidden rounded-none bg-[#fbfcfa] shadow-2xl shadow-[#063b2b]/15 sm:min-h-[calc(100vh-4rem)] sm:rounded-3xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#063b2b] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,#fff_26%,transparent_27%,transparent_75%,#fff_76%,transparent_77%)] bg-size-[24px_24px] opacity-10" />
          <div className="relative">
            <Link href="/" className="text-lg font-bold tracking-tight">✣ Agricore VetCare</Link>
            <div className="mt-20 max-w-sm">
              <span className="rounded-full border border-[#d7f4e9]/25 bg-[#d7f4e9]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d7f4e9]">● Secure tele-health</span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight">A Safe &amp; Secure Platform Connecting Livestock Farmers with Expert Veterinarians</h1>
              <p className="mt-5 text-sm leading-6 text-[#d7f4e9]/75">Empowering Bangladesh&apos;s agriculture with instant veterinary support, real-time health monitoring, and professional livestock management.</p>
            </div>
          </div>
          <div className="relative">
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/75 p-4 text-[#063b2b] shadow-lg"><strong className="block text-2xl text-[#e4ad43]">10,000+</strong><span className="text-[10px]">Certified Vets</span></div>
              <div className="rounded-xl bg-white/75 p-4 text-[#063b2b] shadow-lg"><strong className="block text-2xl text-[#e4ad43]">5-Min</strong><span className="text-[10px]">Emergency SLA</span></div>
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

        <section className="flex min-w-0 flex-col px-5 py-6 sm:px-10 sm:py-10 lg:px-20 lg:py-12">
          <div className="flex justify-end gap-4 text-[#063b2b]" aria-label="Utility navigation"><span aria-hidden="true">◉</span><span aria-hidden="true">?</span></div>
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
            {mode === "signup" && <button type="button" onClick={() => switchMode("login")} className="mb-5 self-start text-xs text-[#59736a] hover:text-[#063b2b]">← Back to Login</button>}
            <p className="text-xs font-medium text-[#59736a]">{mode === "login" ? "Welcome Back" : "Create New Account"}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#063b2b]">{mode === "login" ? "Sign in to your account" : "Join Agricore VetCare"}</h2>
            <p className="mt-2 text-xs text-[#71877f]">{mode === "login" ? "Access your veterinary dashboard and livestock records." : "Join Bangladesh&apos;s most advanced vet-care network."}</p>

            {mode === "signup" && <div className="mt-6 grid grid-cols-2 rounded-lg bg-[#e8f2ef] p-1"><button type="button" onClick={() => setRole("farmer")} className={`rounded-md py-2 text-xs font-bold transition ${role === "farmer" ? "bg-[#063b2b] text-white shadow" : "text-[#567269]"}`}>Farmer</button><button type="button" onClick={() => setRole("vet")} className={`rounded-md py-2 text-xs font-bold transition ${role === "vet" ? "bg-[#063b2b] text-white shadow" : "text-[#567269]"}`}>Veterinarian</button></div>}

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-[#45635a]">Full Name<input required name="fullName" className={inputClass} placeholder="MD. Abdur Rahman" /></label><label className="text-xs font-semibold text-[#45635a]">Mobile Number<input required name="phone" className={inputClass} placeholder="017XXXXXXXX" /></label><label className="text-xs font-semibold text-[#45635a]">NID Number<input required name="nid" className={inputClass} placeholder="199XXXXXXXXXXXX" /></label><label className="text-xs font-semibold text-[#45635a]">Password<input required minLength={6} type="password" name="password" className={inputClass} placeholder="••••••••" /></label></div>}
              {mode === "login" && <><label className="text-xs font-semibold text-[#45635a]">Phone Number or Email<input required name="phone" className={inputClass} placeholder="017XXXXXXXX" /></label><label className="text-xs font-semibold text-[#45635a]">Password<input required type="password" name="password" className={inputClass} placeholder="••••••••" /></label><div className="flex items-center justify-between text-[11px] text-[#71877f]"><label className="flex items-center gap-2"><input type="checkbox" /> Remember Me</label><button type="button" className="font-semibold text-[#063b2b]">Forgot Password?</button></div></>}
              {mode === "signup" && role === "vet" && <><p className="pt-2 text-xs font-semibold text-[#45635a]">Academic &amp; Professional Credentials</p><div className="grid gap-4 sm:grid-cols-2"><input required name="university" className={inputClass} placeholder="University" /><input required name="cgpa" className={inputClass} placeholder="CGPA" /><input required name="yearsOfExperience" className={inputClass} placeholder="Years of Exp" /><input required name="licenseId" className={inputClass} placeholder="License ID" /></div></>}
              {mode === "signup" && <div><p className="mb-2 text-xs font-semibold text-[#45635a]">Upload Documents</p><div className="grid grid-cols-3 gap-2">{([['profilePic','Profile Pic'],['nidFront','NID Front'],...(role === 'vet' ? [['certificate','Certificate']] : [])] as [string,string][]).map(([name, label]) => <label key={name} className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#c8dcd5] text-[9px] text-[#71877f] hover:border-[#063b2b]"><span className="mb-1 text-base">↑</span>{label}<input type="file" name={name} accept="image/*,.pdf" className="sr-only" /></label>)}</div></div>}
              {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">{message}</p>}
              <button disabled={loading} className="w-full rounded-lg bg-[#063b2b] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#063b2b]/15 transition hover:bg-[#0a5240] disabled:cursor-wait disabled:opacity-60">{loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account  ♧"}</button>
            </form>
            <p className="mt-6 text-center text-xs text-[#71877f]">{mode === "login" ? "Don&apos;t have an account?" : "Already have an account?"} <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")} className="font-bold text-[#063b2b] hover:underline">{mode === "login" ? "Create Account" : "Sign In"}</button></p>
          </div>
        </section>
      </div>
    </main>
  );
}
