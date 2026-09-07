"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Reusable back navigation button for sub-views and forms.
 * Defaults to `router.back()`; falls back to `href` (or the root page) when
 * there is no browser history to go back to.
 */
export default function BackButton({
  href,
  label = "Back",
  onClick,
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else if (href) {
      router.replace(href);
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
                   text-text-muted hover:text-foreground hover:bg-secondary/50
                   transition-colors duration-200 ${className}`}
      title={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
