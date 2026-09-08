"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, User, Menu, LogOut, ChevronDown, Loader2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import { useAuth } from "@/lib/auth-context";
import type { NavLinkItem } from "@/lib/types";
import Link from "next/link";

interface NavbarProps {
  navLinks: NavLinkItem[];
  onOpenTransactionModal: () => void;
  onOpenAuthModal: () => void;
}

/**
 * Pasek nawigacyjny z obsługą zmiany motywu, menu mobilnego, stanu logowania Firebase
 * oraz szybkich akcji.
 */
export default function Navbar({
  navLinks,
  onOpenTransactionModal,
  onOpenAuthModal,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, loading, signOutUser } = useAuth();

  // Zamknij menu profilowe po kliknięciu poza nim
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo i nazwa platformy */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/30 to-primary-container/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="14" x="2" y="5" rx="3" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                  <circle cx="16" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-on-surface">
                Finance Tracker
              </span>
            </Link>

            {/* Nawigacja desktopowa */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    link.active
                      ? "text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Prawa strona: status Firebase, przycisk transakcji, zmiana motywu, profil, hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Wskaźnik stanu Firebase Live */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 border border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant">
                Firebase Live
              </span>
            </div>

            {/* Przycisk zmiany motywu jasny / ciemny */}
            <ThemeToggle />

            {/* Przycisk akcji: Dodaj transakcję — tylko dla zalogowanych */}
            {user && (
              <button
                onClick={onOpenTransactionModal}
                type="button"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-[0_0_20px_var(--glow-primary)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Dodaj transakcję</span>
                <span className="xs:hidden">Dodaj</span>
              </button>
            )}

            {/* ========== Sekcja autoryzacji ========== */}
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
              </div>
            ) : user ? (
              /* -------- Zalogowany: avatar + menu profilowe -------- */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  type="button"
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                  aria-label="Menu użytkownika"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-9 h-9 rounded-full border-2 border-primary/40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center text-primary">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-on-surface-variant transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown menu profilowe */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-high border border-border rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {/* Informacje o użytkowniku */}
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.displayName}
                          className="w-10 h-10 rounded-full border border-primary/30 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {userProfile?.displayName ?? "Użytkownik"}
                        </p>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Status planu */}
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Plan
                      </span>
                      <span className="text-xs font-bold text-primary uppercase">
                        {userProfile?.plan ?? "Free"}
                      </span>
                    </div>

                    {/* Link do panelu */}
                    <Link
                      href="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="block w-full py-2 px-3 rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-lowest transition-colors text-left"
                    >
                      📊 Panel finansów
                    </Link>

                    {/* Wylogowanie */}
                    <button
                      onClick={() => {
                        signOutUser();
                        setIsProfileOpen(false);
                      }}
                      type="button"
                      className="flex items-center gap-2 w-full py-2 px-3 rounded-xl text-sm font-semibold text-secondary hover:bg-secondary/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Wyloguj się</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* -------- Niezalogowany: przycisk logowania -------- */
              <>
                <button
                  onClick={onOpenAuthModal}
                  type="button"
                  className="hidden md:block text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Logowanie
                </button>
                <button
                  onClick={onOpenAuthModal}
                  type="button"
                  className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center text-primary transition-all cursor-pointer"
                  aria-label="Panel użytkownika"
                >
                  <User className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Hamburger menu dla ekranów mobilnych */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
              className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Otwórz menu mobilne"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Komponent mobilnego menu wysuwanego z lewej strony */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        onOpenTransactionModal={onOpenTransactionModal}
        onOpenAuthModal={onOpenAuthModal}
      />
    </>
  );
}
