"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Plus, ArrowRight, Shield, Zap } from "lucide-react";
import type { NavLinkItem } from "@/lib/types";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLinkItem[];
  onOpenTransactionModal: () => void;
  onOpenAuthModal: () => void;
}

/**
 * Płynnie wysuwane menu boczne dla urządzeń mobilnych z lewej strony ekranu.
 */
export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  onOpenTransactionModal,
  onOpenAuthModal,
}: MobileMenuProps) {
  // Blokowanie przewijania strony przy otwartym menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Tło przyciemniające (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />

          {/* Panel boczny wysuwany z lewej strony */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-sm bg-surface-container-low border-r border-border p-6 flex flex-col justify-between shadow-2xl lg:hidden overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Nawigacja mobilna"
          >
            <div>
              {/* Górna belka z logo i przyciskiem zamknięcia */}
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-lg text-on-surface tracking-tight block">
                      Finance Tracker
                    </span>
                    <span className="text-[11px] text-primary font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Firebase Live Engine
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                  aria-label="Zamknij menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Lista linków nawigacyjnych */}
              <nav className="py-6 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      link.active
                        ? "bg-primary/15 text-primary border border-primary/25"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </a>
                ))}
              </nav>

              {/* Płytka statusu połączenia */}
              <div className="p-4 rounded-xl bg-surface-container-high/60 border border-border text-xs space-y-2">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Opóźnienie Firestore:
                  </span>
                  <span className="text-primary font-bold">~38 ms</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    Szyfrowanie:
                  </span>
                  <span className="font-semibold text-on-surface">AES-256</span>
                </div>
              </div>
            </div>

            {/* Przyciski akcji na dole panelu */}
            <div className="pt-6 border-t border-border space-y-3">
              <button
                onClick={() => {
                  onClose();
                  onOpenTransactionModal();
                }}
                className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Dodaj transakcję</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full py-3 px-4 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-sm transition-all"
              >
                Logowanie / Rejestracja
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
