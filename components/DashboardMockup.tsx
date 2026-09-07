"use client"

import { useState, useEffect } from "react"
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  TrendingUp,
  Settings,
  Plus,
  ArrowUpRight,
  TrendingDown,
  CheckCircle2,
  ArrowDownLeft,
  ChevronRight,
  Activity,
} from "lucide-react"
import type {
  FinanceMetrics,
  BalanceOverview,
  BudgetCategory,
  Transaction,
} from "@/lib/types"

interface DashboardMockupProps {
  metrics: FinanceMetrics
  balanceOverview: BalanceOverview
  categories: BudgetCategory[]
  transactions: Transaction[]
  onOpenTransactionModal: () => void
}

type TabType = "pulpit" | "transakcje" | "analityka" | "ustawienia"

/**
 * Interaktywny szklany panel pulpitu finansowego.
 * Prezentuje wskaźniki na żywo, interaktywne zakładki, wykres pierścieniowy oraz postęp budżetów.
 */
export default function DashboardMockup({
  metrics,
  balanceOverview,
  categories,
  transactions,
  onOpenTransactionModal,
}: DashboardMockupProps) {
  const [activeTab, setActiveTab] = useState<TabType>("pulpit")
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")

  // Aktualizacja zegara czasu rzeczywistego
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeStr = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      const dateStr = now
        .toLocaleDateString("pl-PL", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        .toUpperCase()

      setCurrentTime(timeStr)
      setCurrentDate(dateStr)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      id='dashboard-mockup'
      className='w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-28'
    >
      <div className='rounded-3xl glass-panel p-4 sm:p-6 lg:p-8 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.7)] relative transition-all duration-500 hover:shadow-[0_28px_70px_var(--glow-primary)]'>
        {/* Pasek kontrolny okna pulpitu */}
        <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 mb-6 gap-4 bg-surface-container-lowest/60 border border-border p-4 sm:p-5 rounded-2xl backdrop-blur-md'>
          {/* Logo i status live */}
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_var(--glow-primary)]'>
              <Wallet className='w-6 h-6' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-lg sm:text-xl font-extrabold text-on-surface tracking-tight'>
                  Finance Tracker
                </span>
                <span className='bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full'>
                  PRO
                </span>
              </div>
              <p className='text-xs text-on-surface-variant flex items-center gap-1.5 font-medium mt-0.5'>
                <span>{currentDate || "CZW, 24 PAŹ 2025"}</span>
                <span>•</span>
                <span className='text-primary font-bold'>
                  {currentTime || "09:38:27"} LIVE
                </span>
              </p>
            </div>
          </div>

          {/* Przełącznik zakładek (Segment Tabs) */}
          <div className='flex items-center bg-surface-container-lowest border border-border p-1 rounded-full overflow-x-auto max-w-full'>
            <button
              onClick={() => setActiveTab("pulpit")}
              type='button'
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "pulpit"
                  ? "bg-surface-container-high text-on-surface shadow-sm border border-border"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <LayoutDashboard className='w-4 h-4 text-primary' />
              <span>Pulpit</span>
            </button>

            <button
              onClick={() => setActiveTab("transakcje")}
              type='button'
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "transakcje"
                  ? "bg-surface-container-high text-on-surface shadow-sm border border-border"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Receipt className='w-4 h-4 text-secondary' />
              <span>Transakcje</span>
            </button>

            <button
              onClick={() => setActiveTab("analityka")}
              type='button'
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "analityka"
                  ? "bg-surface-container-high text-on-surface shadow-sm border border-border"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <TrendingUp className='w-4 h-4 text-tertiary' />
              <span>Analityka</span>
            </button>

            <button
              onClick={() => setActiveTab("ustawienia")}
              type='button'
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "ustawienia"
                  ? "bg-surface-container-high text-on-surface shadow-sm border border-border"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Settings className='w-4 h-4' />
              <span>Ustawienia</span>
            </button>
          </div>

          {/* Przycisk dodawania wpisu w oknie mockupa */}
          <button
            onClick={onOpenTransactionModal}
            type='button'
            className='hidden lg:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs px-4 py-2.5 rounded-full shadow-[0_0_15px_var(--glow-primary)] transition-all cursor-pointer'
          >
            <Plus className='w-4 h-4' />
            <span>Dodaj wpis</span>
          </button>
        </div>

        {/* Widok w zależności od wybranej zakładki */}
        {activeTab === "pulpit" && (
          <>
            {/* Siatka 3 głównych kart metryk finansowych */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              {/* Karta: Przychód całkowity */}
              <div className='bg-surface-container-high/70 border border-border rounded-2xl p-5 shadow-md relative overflow-hidden group hover:border-primary/40 transition-all'>
                <div className='absolute -right-8 -top-8 w-24 h-24 bg-primary/15 rounded-full blur-xl group-hover:bg-primary/25 transition-all pointer-events-none' />
                <span className='text-xs text-on-surface-variant uppercase tracking-wider font-semibold'>
                  Przychód całkowity
                </span>
                <div className='text-2xl sm:text-3xl font-extrabold text-primary my-1 flex items-baseline gap-1.5'>
                  <span>8 920,80</span>
                  <span className='text-sm font-bold text-primary/80'>PLN</span>
                </div>
                <div className='inline-flex items-center gap-1 text-primary text-xs font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full'>
                  <ArrowUpRight className='w-3.5 h-3.5' />
                  <span>
                    +{metrics.totalIncome.percentageChange}%{" "}
                    {metrics.totalIncome.period}
                  </span>
                </div>
              </div>

              {/* Karta: Wydatki bieżące */}
              <div className='bg-surface-container-high/70 border border-border rounded-2xl p-5 shadow-md relative overflow-hidden group hover:border-secondary/40 transition-all'>
                <div className='absolute -right-8 -top-8 w-24 h-24 bg-secondary/15 rounded-full blur-xl group-hover:bg-secondary/25 transition-all pointer-events-none' />
                <span className='text-xs text-on-surface-variant uppercase tracking-wider font-semibold'>
                  Wydatki bieżące
                </span>
                <div className='text-2xl sm:text-3xl font-extrabold text-secondary my-1 flex items-baseline gap-1.5'>
                  <span>1 010,95</span>
                  <span className='text-sm font-bold text-secondary/80'>
                    PLN
                  </span>
                </div>
                <div className='inline-flex items-center gap-1 text-secondary text-xs font-bold bg-secondary/10 border border-secondary/20 px-2.5 py-0.5 rounded-full'>
                  <TrendingDown className='w-3.5 h-3.5' />
                  <span>
                    {metrics.currentExpenses.percentageChange}%{" "}
                    {metrics.currentExpenses.period}
                  </span>
                </div>
              </div>

              {/* Karta: Zysk netto / Oszczędności */}
              <div className='bg-surface-container-high/70 border border-border rounded-2xl p-5 shadow-md relative overflow-hidden group hover:border-primary-fixed/40 transition-all'>
                <div className='absolute -right-8 -top-8 w-24 h-24 bg-primary-fixed/15 rounded-full blur-xl group-hover:bg-primary-fixed/25 transition-all pointer-events-none' />
                <span className='text-xs text-on-surface-variant uppercase tracking-wider font-semibold'>
                  Zysk netto / Oszczędności
                </span>
                <div className='text-2xl sm:text-3xl font-extrabold text-primary-fixed my-1 flex items-baseline gap-1.5'>
                  <span>7 493,52</span>
                  <span className='text-sm font-bold text-primary-fixed/80'>
                    PLN
                  </span>
                </div>
                <div className='inline-flex items-center gap-1 text-primary-fixed text-xs font-bold bg-primary-fixed/10 border border-primary-fixed/20 px-2.5 py-0.5 rounded-full'>
                  <CheckCircle2 className='w-3.5 h-3.5' />
                  <span>{metrics.netProfit.status}</span>
                </div>
              </div>
            </div>

            {/* Podział na dwie główne sekcje analityczne */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
              {/* Lewa kolumna: Wykres pierścieniowy dochody vs wydatki */}
              <div className='lg:col-span-6 bg-surface-container-high/50 border border-border rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-bold text-on-surface'>
                    Przychody vs Wydatki
                  </h3>
                  <span className='text-xs text-on-surface-variant bg-surface-container-lowest border border-border px-3 py-1 rounded-full'>
                    Październik 2025
                  </span>
                </div>

                {/* Środek: Wykres pierścieniowy SVG */}
                <div className='flex flex-col items-center justify-center my-6 relative'>
                  <div className='relative w-56 h-56 flex items-center justify-center'>
                    <svg
                      className='w-full h-full transform -rotate-90 drop-shadow-[0_0_20px_var(--glow-primary)]'
                      viewBox='0 0 160 160'
                    >
                      {/* Pętla bazowa */}
                      <circle
                        cx='80'
                        cy='80'
                        r='64'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='12'
                        className='text-surface-variant/40'
                      />
                      {/* Segment 1: Przychody - Turkus */}
                      <circle
                        cx='80'
                        cy='80'
                        r='64'
                        fill='none'
                        stroke='#45efc5'
                        strokeWidth='12'
                        strokeDasharray='402'
                        strokeDashoffset='140'
                        strokeLinecap='round'
                      />
                      {/* Segment 2: Wydatki stałe - Koral */}
                      <circle
                        cx='80'
                        cy='80'
                        r='64'
                        fill='none'
                        stroke='#ffb2b8'
                        strokeWidth='12'
                        strokeDasharray='402'
                        strokeDashoffset='310'
                        strokeLinecap='round'
                      />
                      {/* Segment 3: Rachunki - Bursztyn */}
                      <circle
                        cx='80'
                        cy='80'
                        r='64'
                        fill='none'
                        stroke='#ffcf7a'
                        strokeWidth='12'
                        strokeDasharray='402'
                        strokeDashoffset='365'
                        strokeLinecap='round'
                      />
                      {/* Segment 4: Inwestycje - Fiolet */}
                      <circle
                        cx='80'
                        cy='80'
                        r='64'
                        fill='none'
                        stroke='#a78bfa'
                        strokeWidth='12'
                        strokeDasharray='402'
                        strokeDashoffset='390'
                        strokeLinecap='round'
                      />
                    </svg>

                    {/* Dane wewnątrz pierścienia */}
                    <div className='absolute inset-0 flex flex-col items-center justify-center text-center'>
                      <span className='text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold'>
                        Saldo Bieżące
                      </span>
                      <span className='text-3xl font-extrabold text-on-surface mt-0.5'>
                        {balanceOverview.amount.toLocaleString("pl-PL")}{" "}
                        {balanceOverview.currency}
                      </span>
                      <span className='text-xs text-primary font-bold mt-1 flex items-center gap-1'>
                        <TrendingUp className='w-3.5 h-3.5' />
                        {balanceOverview.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dolne wskaźniki przepływów (Wpływy vs Wypływy) */}
                <div className='grid grid-cols-2 gap-4 pt-4 border-t border-border'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary'>
                      <ArrowDownLeft className='w-4 h-4' />
                    </div>
                    <div>
                      <span className='text-xs text-on-surface-variant block'>
                        Wpływy
                      </span>
                      <span className='text-sm sm:text-base font-bold text-on-surface'>
                        +{" "}
                        {balanceOverview.inflows.toLocaleString("pl-PL", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        zł
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary'>
                      <ArrowUpRight className='w-4 h-4' />
                    </div>
                    <div>
                      <span className='text-xs text-on-surface-variant block'>
                        Wypływy
                      </span>
                      <span className='text-sm sm:text-base font-bold text-on-surface'>
                        -{" "}
                        {balanceOverview.outflows.toLocaleString("pl-PL", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        zł
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prawa kolumna: Paski postępu budżetów kategorii */}
              <div className='lg:col-span-6 bg-surface-container-high/50 border border-border rounded-2xl p-6 flex flex-col justify-between backdrop-blur-xl'>
                <div>
                  <div className='flex items-center justify-between mb-5'>
                    <div>
                      <h3 className='text-lg font-bold text-on-surface'>
                        Przegląd Budżetów Kategorii
                      </h3>
                      <p className='text-xs text-on-surface-variant'>
                        Maksymalny limit zdefiniowany w Firestore
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("analityka")}
                      type='button'
                      className='text-primary hover:text-primary-hover text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer'
                    >
                      <span>Zarządzaj</span>
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>

                  {/* Lista kategorii z paskami postępu */}
                  <div className='space-y-4'>
                    {categories.map((cat) => {
                      // Kolory dla pasków postępu
                      const colorMap = {
                        secondary:
                          "bg-secondary shadow-[0_0_10px_rgba(255,178,184,0.6)]",
                        tertiary:
                          "bg-tertiary shadow-[0_0_10px_rgba(255,207,122,0.6)]",
                        primary:
                          "bg-primary shadow-[0_0_10px_rgba(69,239,197,0.6)]",
                        "primary-fixed":
                          "bg-primary-fixed shadow-[0_0_10px_rgba(87,252,210,0.5)]",
                        "secondary-fixed":
                          "bg-secondary-fixed shadow-[0_0_10px_rgba(255,218,219,0.5)]",
                      }

                      const dotColorMap = {
                        secondary: "bg-secondary",
                        tertiary: "bg-tertiary",
                        primary: "bg-primary",
                        "primary-fixed": "bg-primary-fixed",
                        "secondary-fixed": "bg-secondary-fixed",
                      }

                      return (
                        <div key={cat.id}>
                          <div className='flex justify-between items-center mb-1.5 text-xs sm:text-sm'>
                            <span className='text-on-surface font-medium flex items-center gap-2'>
                              <span
                                className={`w-2 h-2 rounded-full ${dotColorMap[cat.color]}`}
                              />
                              {cat.name}
                            </span>
                            <span className='font-bold text-on-surface'>
                              {cat.amount.toLocaleString("pl-PL", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              {cat.currency}
                            </span>
                          </div>
                          <div className='w-full h-2.5 rounded-full bg-surface-container-lowest overflow-hidden border border-border/40'>
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${colorMap[cat.color]}`}
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Pasek statusu synchronizacji Firestore */}
                <div className='mt-6 p-3 rounded-xl bg-surface-container-lowest/70 border border-border flex items-center justify-between'>
                  <div className='flex items-center gap-2 text-xs text-on-surface'>
                    <span className='relative flex h-2 w-2'>
                      <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75' />
                      <span className='relative inline-flex rounded-full h-2 w-2 bg-primary' />
                    </span>
                    <span>
                      Firestore Snapshot: Ostatnia aktualizacja 2 sekundy temu
                    </span>
                  </div>
                  <span className='text-xs text-primary font-bold'>
                    100% Spójności
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Zakładka Transakcje */}
        {activeTab === "transakcje" && (
          <div className='py-6 space-y-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='text-lg font-bold text-on-surface'>
                Ostatnie transakcje zsynchronizowane z Firebase
              </h3>
              <button
                onClick={onOpenTransactionModal}
                className='text-xs font-bold text-primary hover:underline'
              >
                + Nowa transakcja
              </button>
            </div>
            <div className='space-y-2.5'>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className='flex items-center justify-between p-4 rounded-xl bg-surface-container-high/60 border border-border hover:border-primary/30 transition-all'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        tx.type === "income"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/20 text-secondary"
                      }`}
                    >
                      {tx.type === "income" ? (
                        <ArrowDownLeft className='w-4 h-4' />
                      ) : (
                        <ArrowUpRight className='w-4 h-4' />
                      )}
                    </div>
                    <div>
                      <div className='font-semibold text-sm text-on-surface'>
                        {tx.title}
                      </div>
                      <div className='text-xs text-on-surface-variant'>
                        {tx.category} • {tx.status}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      tx.type === "income" ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}{" "}
                    {tx.amount.toLocaleString("pl-PL", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    PLN
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zakładka Analityka */}
        {activeTab === "analityka" && (
          <div className='py-8 text-center space-y-4'>
            <Activity className='w-12 h-12 text-primary mx-auto animate-pulse' />
            <h3 className='text-lg font-bold text-on-surface'>
              Prognozy uczenia maszynowego AI
            </h3>
            <p className='text-sm text-on-surface-variant max-w-lg mx-auto'>
              Silnik sztucznej inteligencji przewiduje oszczędność na poziomie
              14.8% przy obecnym trendzie wydatków na zakupy spożywcze i
              subskrypcje cyfrowe.
            </p>
            <div className='inline-block px-4 py-2 rounded-full bg-primary/15 border border-primary/30 text-xs font-bold text-primary'>
              Model analityczny: Vertex AI + Firestore Realtime Stream
            </div>
          </div>
        )}

        {/* Zakładka Ustawienia */}
        {activeTab === "ustawienia" && (
          <div className='py-8 text-center space-y-3'>
            <Settings className='w-10 h-10 text-on-surface-variant mx-auto' />
            <h3 className='text-lg font-bold text-on-surface'>
              Ustawienia konta i reguł bezpieczeństwa
            </h3>
            <p className='text-sm text-on-surface-variant max-w-md mx-auto'>
              Zarządzaj szyfrowaniem kluczy prywatnych, limitami webhooków
              Firebase oraz powiadomieniami push.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
