"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserPlus,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ShieldCheck,
} from "lucide-react";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal zapraszania użytkownika do systemu.
 * Pozwala wpisać adres e-mail i wygenerować link zaproszenia.
 * Wykorzystuje Firebase Auth — zaproszony użytkownik otrzymuje
 * link do rejestracji z dedykowanym tokenem.
 */
/**
 * Zawartość modalu zapraszania użytkownika.
 * Montowana tylko wtedy, gdy modal jest widoczny, co gwarantuje
 * czysty stan początkowy bez potrzeby używania useEffect z setState.
 */
function InviteUserModalContent({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [plan, setPlan] = useState<"free" | "starter" | "pro" | "enterprise">(
    "free"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /** Walidacja i generowanie zaproszenia */
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setInviteLink(null);

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Podaj prawidłowy adres e-mail.");
      return;
    }

    setIsLoading(true);

    try {
      // Symulacja generowania linku zaproszenia
      // W produkcji: wywołanie API / Cloud Function Firebase
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const token = crypto.randomUUID().slice(0, 12);
      const link = `https://finance-tracker.app/invite?token=${token}&email=${encodeURIComponent(email)}&role=${role}&plan=${plan}`;

      setInviteLink(link);
      setSuccess(
        `Zaproszenie dla ${email} zostało przygotowane. Wygeneruj link poniżej.`
      );
    } catch {
      setError("Nie udało się wygenerować zaproszenia. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  /** Kopiowanie linku do schowka */
  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Tło przyciemniające */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Okno dialogowe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-surface-container-high border border-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
            {/* Przycisk zamknięcia */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
              aria-label="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Nagłówek */}
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary mx-auto mb-3 shadow-[0_0_15px_var(--glow-primary)]">
                <UserPlus className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Nowe zaproszenie
              </span>
              <h3
                id="invite-modal-title"
                className="text-xl font-bold text-on-surface mt-1"
              >
                Zaproś użytkownika
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5">
                Wygeneruj link zaproszenia dla nowego użytkownika systemu
                Finance Tracker.
              </p>
            </div>

            {/* Komunikaty */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Formularz */}
            {!inviteLink ? (
              <form onSubmit={handleInvite} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Adres e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="uzytkownik@example.com"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Rola */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Rola w systemie
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === "user"
                          ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_10px_var(--glow-primary)]"
                          : "bg-surface-container-lowest border-border text-on-surface-variant hover:border-primary/20"
                      }`}
                    >
                      👤 Użytkownik
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === "admin"
                          ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_10px_var(--glow-primary)]"
                          : "bg-surface-container-lowest border-border text-on-surface-variant hover:border-primary/20"
                      }`}
                    >
                      👑 Administrator
                    </button>
                  </div>
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Przypisany plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: "free", label: "Free", icon: "🆓" },
                        { key: "starter", label: "Starter", icon: "🚀" },
                        { key: "pro", label: "Pro", icon: "⚡" },
                        { key: "enterprise", label: "Enterprise", icon: "🏢" },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setPlan(p.key)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                          plan === p.key
                            ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_10px_var(--glow-primary)]"
                            : "bg-surface-container-lowest border-border text-on-surface-variant hover:border-primary/20"
                        }`}
                      >
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Przycisk generowania */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Wygeneruj zaproszenie
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Wygenerowany link */
              <div className="space-y-4">
                {/* Podsumowanie zaproszenia */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                      Email
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      {email}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                      Rola
                    </span>
                    <span className="text-xs font-bold text-primary">
                      {role === "admin" ? "👑 Administrator" : "👤 Użytkownik"}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                      Plan
                    </span>
                    <span className="text-xs font-bold text-on-surface capitalize">
                      {plan}
                    </span>
                  </div>
                </div>

                {/* Link zaproszenia */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1.5">
                    Link zaproszenia
                  </label>
                  <div className="flex items-stretch gap-2">
                    <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-[11px] font-mono text-on-surface-variant truncate">
                      {inviteLink}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        copied
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-surface-container-lowest border-border text-on-surface-variant hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copied ? "Skopiowano" : "Kopiuj"}
                    </button>
                  </div>
                </div>

                {/* Przycisk zamknięcia */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-full bg-surface-container-lowest border border-border text-on-surface-variant font-bold text-xs hover:text-on-surface hover:border-primary/30 transition-all cursor-pointer"
                >
                  Zamknij
                </button>
              </div>
            )}

            {/* Stopka bezpieczeństwa */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Zaproszenie wygasa po 7 dniach</span>
            </div>
          </motion.div>
    </div>
  );
}

/**
 * Modal zapraszania użytkownika do systemu.
 * Pozwala wpisać adres e-mail i wygenerować link zaproszenia.
 * Wykorzystuje Firebase Auth — zaproszony użytkownik otrzymuje
 * link do rejestracji z dedykowanym tokenem.
 */
export default function InviteUserModal({
  isOpen,
  onClose,
}: InviteUserModalProps) {
  // Obsługa ESC i blokowanie scrolla
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && <InviteUserModalContent onClose={onClose} />}
    </AnimatePresence>
  );
}

