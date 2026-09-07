"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

/**
 * Przełącznik motywu ciemny/jasny odporny na błędy hydratacji SSR.
 */
export default function ThemeToggle() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      if (typeof document !== "undefined") {
        return !document.documentElement.classList.contains("light");
      }
      return true;
    },
    () => true
  );

  const toggleTheme = () => {
    const isCurrentlyLight = document.documentElement.classList.contains("light");
    if (isCurrentlyLight) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high border border-border text-on-surface-variant hover:text-on-surface transition-all duration-300 shadow-sm cursor-pointer"
      aria-label={isDark ? "Przełącz na tryb jasny" : "Przełącz na tryb ciemny"}
      title={isDark ? "Tryb jasny" : "Tryb ciemny"}
    >
      {!isMounted ? (
        <span className="w-4 h-4" />
      ) : isDark ? (
        <Sun className="w-4 h-4 text-primary transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-primary transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
