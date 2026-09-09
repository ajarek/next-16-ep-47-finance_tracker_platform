"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, PlusCircle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (transaction: {
    id: string
    title: string
    amount: number
    type: "income" | "expense"
    category: string
    date: string
    status: string
  }) => void
}

/**
 * Modal dodawania nowej transakcji z synchronizacją Firebase Firestore.
 * Wymaga zalogowania — zapisuje dane do kolekcji operations.
 */
export default function TransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
}: TransactionModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("Jedzenie & Restauracje")
  const [notes, setNotes] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
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

  const handleClose = () => {
    setIsSuccess(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError("Musisz być zalogowany, aby dodać transakcję.")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !title.trim()) {
      setError("Wypełnij poprawnie wszystkie pola.")
      return
    }

    setIsSaving(true)

    const newTx = {
      id: `tx-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: new Date().toISOString(),
      status: "Zrealizowano",
    }

    try {
      // Przekaż transakcję do zapisu w Firestore (obsługiwane przez rodzica)
      onAddTransaction(newTx)
      setIsSuccess(true)
      setTimeout(() => {
        setTitle("")
        setAmount("")
        setNotes("")
        setIsSuccess(false)
        onClose()
      }, 1200)
    } catch {
      setError("Nie udało się zapisać transakcji. Spróbuj ponownie.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface-container-high border border-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tx-modal-title"
          >
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors"
              aria-label="Zamknij okno"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Baza Google Firestore
              </span>
              <h3
                id="tx-modal-title"
                className="text-xl sm:text-2xl font-bold text-on-surface mt-1"
              >
                Dodaj nową transakcję
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Wpis zostanie natychmiast zsynchronizowany ze wszystkimi
                Twoimi urządzeniami.
              </p>
            </div>

            {/* Błąd */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-secondary/15 border border-secondary/30 text-secondary text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Brak auth */}
            {!user && !error && (
              <div className="py-6 text-center text-on-surface-variant text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <p>Musisz być zalogowany, aby dodać transakcję.</p>
              </div>
            )}

            {isSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-primary mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-on-surface">
                  Zapisano w Firestore!
                </h4>
                <p className="text-xs text-on-surface-variant">
                  Zaktualizowano wskaźniki budżetu w czasie rzeczywistym.
                </p>
              </div>
            ) : user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Wybór typu transakcji */}
                <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-surface-container-lowest border border-border">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      type === "expense"
                        ? "bg-secondary/20 text-secondary border border-secondary/30 shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Wydatek (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      type === "income"
                        ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Przychód (+)
                  </button>
                </div>

                {/* Tytuł wpisu */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Tytuł transakcji
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="np. Biedronka, Paliwo, Przelew B2B"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>

                {/* Kwota i Kategoria */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Kwota (PLN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Kategoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="Jedzenie & Restauracje">
                        🍽️ Jedzenie & Restauracje
                      </option>
                      <option value="Media & Mieszkanie">
                        🏠 Media & Mieszkanie
                      </option>
                      <option value="Transport & Podróże">
                        🚗 Transport & Podróże
                      </option>
                      <option value="Rozrywka, AI & Streaming">
                        🎬 Rozrywka, AI & Streaming
                      </option>
                      <option value="Zdrowie & Apteka">💊 Zdrowie & Apteka</option>
                      <option value="Inne Wydatki">📦 Inne Wydatki</option>
                      <option value="Przychody">💰 Przychody ogólne</option>
                    </select>
                  </div>
                </div>

                {/* Notatki (opcjonalne) */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Notatki <span className="text-on-surface-variant font-normal">(opcjonalne)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Dodatkowe informacje o transakcji..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_20px_var(--glow-primary)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  <span>Zapisz w Firebase Firestore</span>
                </button>
              </form>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
