"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, PlusCircle, CheckCircle2 } from "lucide-react"
import type { Transaction } from "@/lib/types"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (transaction: Transaction) => void
}

/**
 * Modal dodawania nowej transakcji z natychmiastową synchronizacją.
 */
export default function TransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
}: TransactionModalProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("Jedzenie & Restauracje")
  const [isSuccess, setIsSuccess] = useState(false)

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
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !title.trim()) return

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date: new Date().toISOString(),
      status: "Zrealizowano",
    }

    onAddTransaction(newTx)
    setIsSuccess(true)
    setTimeout(() => {
      setTitle("")
      setAmount("")
      setIsSuccess(false)
      onClose()
    }, 1200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className='fixed inset-0 bg-black/75 backdrop-blur-md'
            aria-hidden='true'
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className='relative w-full max-w-lg bg-surface-container-high border border-border rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden'
            role='dialog'
            aria-modal='true'
            aria-labelledby='tx-modal-title'
          >
            <button
              onClick={handleClose}
              className='absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest transition-colors'
              aria-label='Zamknij okno'
            >
              <X className='w-5 h-5' />
            </button>

            <div className='mb-6'>
              <span className='text-[11px] font-bold uppercase tracking-wider text-primary'>
                Baza Google Firestore
              </span>
              <h3
                id='tx-modal-title'
                className='text-xl sm:text-2xl font-bold text-on-surface mt-1'
              >
                Dodaj nową transakcję
              </h3>
              <p className='text-xs sm:text-sm text-on-surface-variant mt-1'>
                Wpis zostanie natychmiast zsynchronizowany ze wszystkimi Twoimi
                urządzeniami.
              </p>
            </div>

            {isSuccess ? (
              <div className='py-8 text-center space-y-3'>
                <CheckCircle2 className='w-12 h-12 text-primary mx-auto animate-bounce' />
                <h4 className='text-lg font-bold text-on-surface'>
                  Zapisano w Firestore!
                </h4>
                <p className='text-xs text-on-surface-variant'>
                  Zaktualizowano wskaźniki budżetu w czasie rzeczywistym.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                {/* Wybór typu transakcji */}
                <div className='grid grid-cols-2 gap-3 p-1 rounded-2xl bg-surface-container-lowest border border-border'>
                  <button
                    type='button'
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
                    type='button'
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
                  <label className='block text-xs font-semibold text-on-surface mb-1'>
                    Tytuł transakcji
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='np. Biedronka, Paliwo, Przelew B2B'
                    required
                    className='w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm'
                  />
                </div>

                {/* Kwota i Kategoria w jednym wierszu */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-on-surface mb-1'>
                      Kwota (PLN)
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      min='0.01'
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder='0.00'
                      required
                      className='w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-bold'
                    />
                  </div>

                  <div>
                    <label className='block text-xs font-semibold text-on-surface mb-1'>
                      Kategoria
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className='w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm'
                    >
                      <option value='Jedzenie & Restauracje'>
                        Jedzenie & Restauracje
                      </option>
                      <option value='Media & Mieszkanie'>
                        Media & Mieszkanie
                      </option>
                      <option value='Transport & Podróże'>
                        Transport & Podróże
                      </option>
                      <option value='Rozrywka, AI & Streaming'>
                        Rozrywka, AI & Streaming
                      </option>
                      <option value='Zdrowie & Apteka'>Zdrowie & Apteka</option>
                      <option value='Przychody'>Przychody ogólne</option>
                    </select>
                  </div>
                </div>

                <button
                  type='submit'
                  className='w-full py-3 px-4 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_20px_var(--glow-primary)] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2'
                >
                  <PlusCircle className='w-4 h-4' />
                  <span>Zapisz w Firebase Firestore</span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
