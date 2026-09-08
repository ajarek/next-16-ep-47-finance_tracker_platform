"use client"

import { useState } from "react"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  UserPlus,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

/**
 * Sekcja szybkiej rejestracji zintegrowana z Firebase Auth.
 * Użytkownik może wpisać dane bezpośrednio na stronie głównej.
 */
export default function AuthSection() {
  const { registerWithEmail, loading } = useAuth()

  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!displayName || !email || !password) {
      setError("Wszystkie pola są wymagane.")
      return
    }
    if (password.length < 8) {
      setError("Hasło musi zawierać co najmniej 8 znaków.")
      return
    }

    setIsLoading(true)
    try {
      await registerWithEmail(email, password, displayName)
      setSubmitted(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Wystąpił błąd rejestracji."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading && !submitted) return null

  return (
    <section
      id="cennik"
      className="w-full py-24 px-4 sm:px-6 lg:px-8 flex justify-center relative scroll-mt-24"
    >
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-border">
        {/* Subtelna poświata w tle */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Rozpocznij teraz
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface mt-2">
            Stwórz darmowe konto
          </h3>
          <p className="text-sm text-on-surface-variant mt-2">
            7 dni za darmo, następnie 19 zł/msc lub anuluj jednym kliknięciem.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-primary/10 border border-primary/30 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-primary mx-auto" />
            <h4 className="text-lg font-bold text-on-surface">
              Konto próbne zostało aktywowane!
            </h4>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Wysłaliśmy link weryfikacyjny na adres{" "}
              <span className="font-semibold text-primary">{email}</span>.
              Możesz od razu przejść do panelu głównego.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setDisplayName("")
                setEmail("")
                setPassword("")
              }}
              className="text-xs text-primary font-bold hover:underline pt-2"
            >
              Utwórz kolejne konto testowe
            </button>
          </div>
        ) : (
          <>
            {/* Błąd walidacji */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Formularz rejestracji */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Imię / Nazwa użytkownika
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="np. Jan Kowalski"
                    required
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1.5">
                  Adres e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.pl"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
                  />
                </div>
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm sm:text-base shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_36px_var(--glow-primary)] hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Zarejestruj się i aktywuj 7 dni gratis"
                )}
              </button>
            </form>

            <p className="text-[11px] text-on-surface-variant text-center mt-4">
              Rejestrując się akceptujesz Regulamin i Politykę Prywatności. Brak
              ukrytych opłat.
            </p>
          </>
        )}
      </div>
    </section>
  )
}
