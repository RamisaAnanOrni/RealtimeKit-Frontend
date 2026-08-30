/**
 * AUTHENTICATION FLOW EXAMPLE COMPONENT
 * 
 * ✅ CORRECT PATTERN:
 * - Use 'use client' directive
 * - Import from lib/auth-api.ts (NOT next.js api routes)
 * - Call Django backend directly from client component
 * - Store JWT in localStorage
 * - Handle errors gracefully
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userLogin, userSignup } from "@/lib/auth-api";
import { getErrorMessage } from "@/lib/api";

export default function AuthPanelExample() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"farmer" | "vet">("farmer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ DIRECT CALL TO DJANGO API
      const response = await userLogin({
        username: phone,
        password,
      });

      if (response.access) {
        // Token saved automatically by userLogin()
        // Navigate to appropriate dashboard
        const dashboard = response.role === "vet" ? "/vet/dashboard" : "/farmer/dashboard";
        router.push(dashboard);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ✅ DIRECT CALL TO DJANGO API
      const response = await userSignup({
        phone,
        full_name: fullName,
        password,
        role,
      });

      if (response.access) {
        // Token saved automatically by userSignup()
        const dashboard = role === "vet" ? "/vet/dashboard" : "/farmer/dashboard";
        router.push(dashboard);
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={isLogin ? handleLogin : handleSignup}>
        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value as "farmer" | "vet")}>
              <option value="farmer">Farmer</option>
              <option value="vet">Veterinarian</option>
            </select>
          </>
        )}

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} type="button">
        {isLogin ? "Need an account?" : "Already have an account?"}
      </button>
    </div>
  );
}
