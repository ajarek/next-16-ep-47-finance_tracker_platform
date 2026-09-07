"use client";

import { useState } from "react";
import { Plus, User, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";
import type { NavLinkItem } from "@/lib/types";

interface NavbarProps {
  navLinks: NavLinkItem[];
  onOpenTransactionModal: () => void;
  onOpenAuthModal: () => void;
}

/**
 * Pasek nawigacyjny z obsługą zmiany motywu, menu mobilnego oraz szybkich akcji.
 */
export default function Navbar({
  navLinks,
  onOpenTransactionModal,
  onOpenAuthModal,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Logo i nazwa platformy */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-3 group">
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
            </a>

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

            {/* Przycisk akcji: Dodaj transakcję */}
            <button
              onClick={onOpenTransactionModal}
              type="button"
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full shadow-[0_0_20px_var(--glow-primary)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Dodaj transakcję</span>
              <span className="xs:hidden">Dodaj</span>
            </button>

            {/* Link logowania */}
            <button
              onClick={onOpenAuthModal}
              type="button"
              className="hidden md:block text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              Logowanie
            </button>

            {/* Avatar użytkownika */}
            <button
              onClick={onOpenAuthModal}
              type="button"
              className="w-9 h-9 rounded-full bg-primary/20 hover:bg-primary/30 border border-primary/30 flex items-center justify-center text-primary transition-all cursor-pointer"
              aria-label="Panel użytkownika"
            >
              <User className="w-4 h-4" />
            </button>

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
