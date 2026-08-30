/**
 * ROLE PROTECTION HOOK
 * Validates user role and redirects to appropriate dashboard if access is unauthorized.
 * Includes fallback to fetch profile if role is missing/invalid.
 */

import { useEffect, useState } from "react";
import { getStoredAuth, normalizeRole, decodeJwt, fetchUserProfile } from "@/lib/api";

type AllowedRole = "farmer" | "vet";

/**
 * Hook to protect dashboard routes by role
 * @param requiredRole - The required role to access this page (e.g., "farmer", "vet")
 * @example
 * // In farmer dashboard
 * useRoleProtection("farmer");
 * 
 * // In vet dashboard
 * useRoleProtection("vet");
 */
export function useRoleProtection(requiredRole: AllowedRole): void {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function validateRole() {
      try {
        const auth = getStoredAuth();
        console.log("[useRoleProtection] Auth state:", {
          hasAccess: !!auth?.access,
          storedRole: auth?.role,
          requiredRole,
        });

        // No auth - redirect to login
        if (!auth?.access) {
          console.warn("[useRoleProtection] No auth token found, redirecting to /auth");
          if (typeof window !== "undefined") {
            window.location.assign("/auth");
          }
          return;
        }

        // Get role from stored auth
        let userRole = normalizeRole(auth.role);
        console.log("[useRoleProtection] Normalized stored role:", userRole);

        // Fallback 1: Decode JWT to extract role if stored role is missing
        if (!auth.role) {
          console.log("[useRoleProtection] No stored role, attempting JWT decode...");
          const decoded = decodeJwt(auth.access);
          const jwtRole = decoded?.role;
          console.log("[useRoleProtection] JWT decoded role:", jwtRole);

          if (jwtRole) {
            userRole = normalizeRole(jwtRole);
            console.log("[useRoleProtection] Using JWT role:", userRole);
          }
        }

        // Fallback 2: Fetch fresh profile from backend if role is still missing
        if (!auth.role && !userRole) {
          console.log("[useRoleProtection] Fetching fresh profile from backend...");
          const profile = await fetchUserProfile();
          if (profile?.role) {
            userRole = normalizeRole(profile.role);
            console.log("[useRoleProtection] Using profile role:", userRole);
          }
        }

        console.log("[useRoleProtection] Final user role:", userRole, "Required:", requiredRole);

        // Check if user has the required role
        if (userRole !== requiredRole) {
          // Wrong role - redirect to their correct dashboard
          const correctDashboard =
            userRole === "vet" ? "/vet/dashboard" : "/farmer/dashboard";
          console.warn(
            `[useRoleProtection] Role mismatch! User is ${userRole}, requires ${requiredRole}. Redirecting to ${correctDashboard}`
          );
          if (typeof window !== "undefined") {
            window.location.assign(correctDashboard);
          }
        } else {
          console.log("[useRoleProtection] ✓ Access granted");
        }
      } catch (error) {
        console.error("[useRoleProtection] Error during role validation:", error);
      } finally {
        setChecking(false);
      }
    }

    validateRole();
  }, [requiredRole]);

  return;
}

