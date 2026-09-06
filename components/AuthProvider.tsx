"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  decodeJwt,
  fetchUserProfile,
  getStoredAuth,
  normalizeRole,
  saveAuth,
} from "@/lib/api";

type AuthUser = {
  role?: "farmer" | "vet";
  username?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authLoading: true,
});

/**
 * AuthProvider resolves the current user once on mount and exposes an
 * `authLoading` flag so route guards never redirect while the stored JWT /
 * role is still being re-verified after a page refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const resolveAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      const stored = getStoredAuth();
      if (!stored?.access) {
        setUser(null);
        return;
      }

      let role = stored.role;
      if (!role) {
        const decoded = decodeJwt(stored.access);
        role = decoded?.role as string | undefined;
      }

      if (!role) {
        const profile = await fetchUserProfile();
        if (profile?.role) {
          role = profile.role;
          saveAuth({ ...stored, role: normalizeRole(role) });
        }
      }

      setUser({
        role: role ? normalizeRole(role) : undefined,
        username: stored.username,
      });
    } catch {
      // Invalid/corrupt session - treat as unauthenticated.
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial resolution after a page load / refresh. Guards block on
    // `authLoading`, so no premature role-based redirects can happen here.
    void Promise.resolve().then(() => resolveAuth());

    // Re-resolve whenever the stored auth record changes (login, logout, or a
    // different VET/FARMER account in another tab) so React state never keeps
    // a stale role/token between test accounts.
    const handleAuthChanged = () => void resolveAuth();
    window.addEventListener("agrivet-auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);
    return () => {
      window.removeEventListener("agrivet-auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, [resolveAuth]);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}