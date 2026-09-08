"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

/** Typ widoku w modalu autoryzacji */
type AuthView = "menu" | "login" | "register" | "reset-password"

/**
 * Modal autoryzacji i rejestracji zintegrowany z Firebase Auth.
 * Obsługuje logowanie przez Google, GitHub, e-mail + hasło
 * oraz rejestrację i reset hasła.
 */
export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    user,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
  } = useAuth()

  const [view, setView] = useState<AuthView>("menu")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /** Reset stanu formularza */
  const resetForm = useCallback(() => {
    setView("menu")
    setEmail("")
    setPassword("")
    setDisplayName("")
    setShowPassword(false)
    setError(null)
    setSuccess(null)
    setIsLoading(false)
  }, [])

  // Zamknij modal po pomyślnym zalogowaniu
  useEffect(() => {
    if (user && isOpen) {
      const timer = setTimeout(() => {
        onClose()
        resetForm()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [user, isOpen, onClose, resetForm])

  // Obsługa ESC i blokowanie scrolla
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  /** Zamknij i zresetuj */
  const handleClose = () => {
    resetForm()
    onClose()
  }

  /** Logowanie przez Google */
  const handleGoogle = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  /** Logowanie przez GitHub */
  const handleGitHub = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await signInWithGitHub()
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  /** Logowanie e-mailem */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!email || !password) {
      setError("Wypełnij wszystkie pola.")
      return
    }
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  /** Rejestracja e-mailem */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!displayName || !email || !password) {
      setError("Wypełnij wszystkie pola.")
      return
    }
    if (password.length < 8) {
      setError("Hasło musi zawierać co najmniej 8 znaków.")
      return
    }
    setIsLoading(true)
    try {
      await registerWithEmail(email, password, displayName)
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  /** Reset hasła */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email) {
      setError("Podaj adres e-mail.")
      return
    }
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSuccess("Wysłaliśmy link do resetowania hasła na podany adres e-mail.")
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Tło przyciemniające */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
            aria-labelledby="modal-title"
          >
            {/* Przycisk zamknięcia */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
              aria-label="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Przycisk powrotu (dla widoków podrzędnych) */}
            {view !== "menu" && (
              <button
                onClick={() => {
                  setError(null)
                  setSuccess(null)
                  setView("menu")
                }}
                className="absolute top-5 left-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
                aria-label="Powrót"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            {/* Nagłówek */}
            <div className="mb-6 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {view === "menu" && "Dostęp do wersji PRO"}
                {view === "login" && "Logowanie"}
                {view === "register" && "Nowe konto"}
                {view === "reset-password" && "Reset hasła"}
              </span>
              <h3
                id="modal-title"
                className="text-xl sm:text-2xl font-bold text-on-surface mt-1"
              >
                {view === "menu" && "Rozpocznij 7-dniowy okres próbny"}
                {view === "login" && "Zaloguj się do konta"}
                {view === "register" && "Stwórz darmowe konto"}
                {view === "reset-password" && "Przypomnij hasło"}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
                {view === "menu" &&
                  "Uzyskaj natychmiastowy dostęp do wszystkich funkcji analizy budżetu i synchronizacji Firebase."}
                {view === "login" &&
                  "Wprowadź dane logowania, aby uzyskać dostęp do pulpitu."}
                {view === "register" &&
                  "7 dni za darmo, następnie 19 zł/msc lub anuluj jednym kliknięciem."}
                {view === "reset-password" &&
                  "Podaj adres e-mail powiązany z kontem."}
              </p>
            </div>

            {/* Komunikaty o błędzie/sukcesie */}
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

            {/* ===== Widok: MENU ===== */}
            {view === "menu" && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-border text-on-surface font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Kontynuuj przez Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGitHub}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-border text-on-surface font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <span>Kontynuuj przez GitHub</span>
                </button>

                {/* Rozdzielacz */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-border" />
                  <span className="absolute bg-surface-container-high px-3 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold rounded-full">
                    lub e-mail
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="w-full py-3 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container border border-border text-on-surface font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Zaloguj się e-mailem</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView("register")}
                  className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Zarejestruj się i aktywuj 7 dni gratis
                </button>
              </div>
            )}

            {/* ===== Widok: LOGOWANIE ===== */}
            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Wprowadź hasło"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setSuccess(null)
                      setView("reset-password")
                    }}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Zapomniałeś hasła?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zaloguj się"}
                </button>

                <p className="text-[11px] text-on-surface-variant text-center">
                  Nie masz konta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setView("register")
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Zarejestruj się
                  </button>
                </p>
              </form>
            )}

            {/* ===== Widok: REJESTRACJA ===== */}
            {view === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Imię / Nazwa użytkownika
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="np. Jan Kowalski"
                    required
                    autoComplete="name"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Hasło
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 znaków"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                      aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Zarejestruj się i aktywuj 7 dni gratis"
                  )}
                </button>

                <p className="text-[11px] text-on-surface-variant text-center">
                  Rejestrując się akceptujesz Regulamin i Politykę Prywatności.
                  Brak ukrytych opłat.
                </p>

                <p className="text-[11px] text-on-surface-variant text-center">
                  Masz już konto?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setView("login")
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Zaloguj się
                  </button>
                </p>
              </form>
            )}

            {/* ===== Widok: RESET HASŁA ===== */}
            {view === "reset-password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Wyślij link resetujący"
                  )}
                </button>

                <p className="text-[11px] text-on-surface-variant text-center">
                  Pamiętasz hasło?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setSuccess(null)
                      setView("login")
                    }}
                    className="text-primary font-bold hover:underline"
                  >
                    Wróć do logowania
                  </button>
                </p>
              </form>
            )}

            {/* Stopka zaufania */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-on-surface-variant">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Bezpieczne szyfrowanie Firebase Auth 256-bit</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** Mapuje błędy Firebase Auth na czytelne komunikaty po polsku */
function mapAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : ""

  switch (code) {
    case "auth/user-not-found":
      return "Nie znaleziono użytkownika z tym adresem e-mail."
    case "auth/wrong-password":
      return "Nieprawidłowe hasło."
    case "auth/email-already-in-use":
      return "Konto z tym adresem e-mail już istnieje."
    case "auth/invalid-email":
      return "Nieprawidłowy format adresu e-mail."
    case "auth/weak-password":
      return "Hasło jest zbyt słabe. Użyj co najmniej 8 znaków."
    case "auth/too-many-requests":
      return "Zbyt wiele prób logowania. Spróbuj ponownie za chwilę."
    case "auth/popup-closed-by-user":
      return "Okno logowania zostało zamknięte."
    case "auth/popup-blocked":
      return "Przeglądarka zablokowała okno popup. Spróbuj ponownie."
    case "auth/network-request-failed":
      return "Błąd połączenia z siecią. Sprawdź połączenie internetowe."
    case "auth/invalid-credential":
      return "Nieprawidłowe dane logowania. Sprawdź e-mail i hasło."
    default:
      return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie."
  }
}
