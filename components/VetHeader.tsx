"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getStoredAuth, clearAuth } from "@/lib/api";

interface VetHeaderProps {
  vetName?: string;
  onLogout?: () => void;
}

export default function VetHeader({ vetName = "Dr. Veterinarian", onLogout }: VetHeaderProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Format current date
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    setCurrentDate(now.toLocaleDateString("en-US", options));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear authentication
      clearAuth();
      
      // Call optional callback
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Greeting and Date */}
          <div className="flex-1">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg font-bold text-foreground">
                Welcome back, {vetName}
              </h1>
              <p className="text-sm text-text-muted">
                {currentDate}
              </p>
            </div>
          </div>

          {/* Right side - Logout Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                         text-text-muted hover:text-foreground hover:bg-secondary/50
                         transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
