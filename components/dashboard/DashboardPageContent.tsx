"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Loader2,
  Lock,
  PlusCircle,
  Trash2,
  Wallet,
  Receipt,
  Settings,
  Shield,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import {
  onOperationsSnapshot,
  onCategoriesSnapshot,
  recalculateAllCategoriesSpent,
  deleteOperation,
} from "@/lib/firestore";
import type {
  FirestoreOperation,
  FirestoreCategory,
} from "@/lib/firestore-types";
import type {
  FinanceMetrics,
  BalanceOverview,
} from "@/lib/types";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TransactionModal from "@/components/TransactionModal";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";
import Link from "next/link";
import navigationData from "@/public/data/navigation.json";
import Image from "next/image";

type TabType = "pulpit" | "transakcje" | "analityka" | "ustawienia";

/**
 * Główny komponent kliencki panelu finansowego.
 * Sprawdza autoryzację, pobiera dane z Firestore w czasie rzeczywistym
 * i wyświetla interaktywny dashboard.
 */
export default function DashboardPageContent() {
  const router = useRouter();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("pulpit");
  const [operations, setOperations] = useState<FirestoreOperation[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // -------------------------------------------------------------------------
  // Chronienie trasy — przekierowanie jeśli brak auth lub planu
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // -------------------------------------------------------------------------
  // Pobieranie danych z Firestore (realtime)
  // -------------------------------------------------------------------------
useEffect(() => {
    if (!user) return;

    const unsubOps = onOperationsSnapshot(user.uid, (ops) => {
      setOperations(ops);
      setIsLoadingData(false);
    });

    const unsubCats = onCategoriesSnapshot(user.uid, (cats) => {
      setCategories(cats);
    });

    // Napraw spent w kategoriach (jednorazowe przeliczenie)
    recalculateAllCategoriesSpent(user.uid).catch(() => {});

    return () => {
      unsubOps();
      unsubCats();
    };
  }, [user]);

  // -------------------------------------------------------------------------
  // Aktualizacja zegara
  // -------------------------------------------------------------------------
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now
          .toLocaleDateString("pl-PL", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
          .toUpperCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------------------------------------
  // Obliczanie metryk na podstawie operacji z Firestore
  // -------------------------------------------------------------------------
  const metrics = useMemo((): {
    financeMetrics: FinanceMetrics;
    balance: BalanceOverview;
  } => {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const op of operations) {
      if (op.type === "income") totalIncome += op.amount;
      else totalExpenses += op.amount;
    }

    const netProfit = totalIncome - totalExpenses;

    const financeMetrics: FinanceMetrics = {
      totalIncome: {
        amount: totalIncome,
        currency: "PLN",
        percentageChange: 12.5,
        period: "vs poprzedni miesiąc",
      },
      currentExpenses: {
        amount: totalExpenses,
        currency: "PLN",
        percentageChange: -3.2,
        period: "vs poprzedni miesiąc",
      },
      netProfit: {
        amount: netProfit,
        currency: "PLN",
        status: netProfit >= 0 ? "Na plusie" : "Deficyt",
        trend: netProfit >= 0 ? "up" : "down",
      },
    };

    const balance: BalanceOverview = {
      amount: netProfit,
      currency: "PLN",
      status: netProfit >= 0 ? "Saldo dodatnie" : "Saldo ujemne",
      inflows: totalIncome,
      outflows: totalExpenses,
    };

    return { financeMetrics, balance };
  }, [operations]);

  // Stan potwierdzenia usunięcia
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // Obsługa dodawania transakcji (zapis do Firestore przez modal)
  // -------------------------------------------------------------------------
  const handleAddTransaction = async (newTx: {
    id: string;
    title: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
    status: string;
  }) => {
    if (!user) return;

    try {
      const { createOperation } = await import("@/lib/firestore");
      const { Timestamp } = await import("firebase/firestore");

      await createOperation({
        userId: user.uid,
        title: newTx.title,
        amount: newTx.amount,
        type: newTx.type,
        category: newTx.category,
        date: Timestamp.fromDate(new Date(newTx.date)),
        status: "completed",
        notes: null,
      });
      // Snapshot automatycznie zaktualizuje listę operacji
    } catch (error) {
      console.error("[Dashboard] Błąd zapisu operacji:", error);
    }
  };

  // -------------------------------------------------------------------------
  // Obsługa usuwania transakcji z cofnięciem spent
  // -------------------------------------------------------------------------
  const handleDeleteTransaction = async (op: FirestoreOperation) => {
    if (!user) return;
    setDeletingId(op.id);

    try {
      await deleteOperation(op.id, {
        type: op.type,
        amount: op.amount,
        category: op.category,
        userId: op.userId,
      });
      // Snapshot automatycznie zaktualizuje listę operacji i kategorii
    } catch (error) {
      console.error("[Dashboard] Błąd usuwania operacji:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------------------------------------------------------------
  // Widok ładowania / brak auth
  // -------------------------------------------------------------------------
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-on-surface-variant">Ładowanie panelu...</p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Widok: brak aktywnego planu (tylko free)
  // -------------------------------------------------------------------------
  const hasActivePlan =
    userProfile && (userProfile.plan !== "free" || userProfile.trialEndsAt);

  if (!hasActivePlan) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar
          navLinks={navigationData.navLinks}
          onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
          onOpenAuthModal={() => router.push("/")}
        />

        <main className="flex-1 flex items-center justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              Wymagany aktywny plan
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Aby uzyskać dostęp do panelu finansów, musisz wybrać plan
              subskrypcji lub rozpocząć 7-dniowy darmowy okres próbny.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm shadow-[0_0_24px_var(--glow-primary)] transition-all text-center"
              >
                Wybierz plan
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-full bg-surface-container-high border border-border text-on-surface font-semibold text-sm hover:scale-105 transition-all text-center"
              >
                Wróć na stronę główną
              </Link>
            </div>
          </motion.div>
        </main>

        <Footer footerLinks={navigationData.footerLinks} />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Główne metryki do wyświetlenia
  // -------------------------------------------------------------------------
  const { financeMetrics, balance } = metrics;
  const txForDisplay = operations.slice(0, 10);

  // -------------------------------------------------------------------------
  // Renderowanie panelu
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar
        navLinks={navigationData.navLinks}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenAuthModal={() => router.push("/")}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Górna belka pulpitu */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 mb-6 gap-4 bg-surface-container-lowest/60 border border-border p-4 sm:p-5 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_var(--glow-primary)]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-on-surface tracking-tight">
                  Finance Tracker
                </span>
                {isAdmin && (
                  <span className="bg-primary/20 text-primary border border-primary/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-[0_0_10px_rgba(69,239,197,0.3)]">
                    👑 Admin
                  </span>
                )}
                <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {userProfile?.plan}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium mt-0.5">
                <span>{currentDate}</span>
                <span>•</span>
                <span className="text-primary font-bold">
                  {currentTime} LIVE
                </span>
              </p>
            </div>
          </div>

          {/* Przełącznik zakładek */}
          <div className="flex items-center bg-surface-container-lowest border border-border p-1 rounded-full overflow-x-auto max-w-full">
            {(
              [
                ["pulpit", "Pulpit", LayoutDashboard, "text-primary"],
                ["transakcje", "Transakcje", Receipt, "text-secondary"],
                ["analityka", "Analityka", TrendingUp, "text-tertiary"],
                ["ustawienia", "Ustawienia", Settings, ""],
              ] as const
            ).map(([tab, label, Icon, iconColor]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-surface-container-high text-on-surface shadow-sm border border-border"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 ${iconColor}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsTransactionModalOpen(true)}
            type="button"
            className="hidden lg:flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs px-4 py-2.5 rounded-full shadow-[0_0_15px_var(--glow-primary)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Dodaj wpis</span>
          </button>
        </div>

        {/* Widok ładowania danych */}
        {isLoadingData && (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm text-on-surface-variant">
              Synchronizacja z Firestore...
            </span>
          </div>
        )}

        {/* Zakładka: Pulpit */}
        {!isLoadingData && activeTab === "pulpit" && (
          <>
            {/* Trzy karty metryk */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <MetricCard
                label="Przychód całkowity"
                amount={financeMetrics.totalIncome.amount}
                percentage={financeMetrics.totalIncome.percentageChange}
                period={financeMetrics.totalIncome.period}
                color="primary"
                icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              />
              <MetricCard
                label="Wydatki bieżące"
                amount={financeMetrics.currentExpenses.amount}
                percentage={financeMetrics.currentExpenses.percentageChange}
                period={financeMetrics.currentExpenses.period}
                color="secondary"
                icon={<TrendingDown className="w-3.5 h-3.5" />}
              />
              <MetricCard
                label="Zysk netto"
                amount={financeMetrics.netProfit.amount}
                status={financeMetrics.netProfit.status}
                color="primary-fixed"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              />
            </div>

            {/* Wykres pierścieniowy + kategorie budżetowe */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Saldo */}
              <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-on-surface">
                    Saldo bieżące
                  </h3>
                  <span className="text-xs text-on-surface-variant bg-surface-container-lowest border border-border px-3 py-1 rounded-full">
                    Podsumowanie
                  </span>
                </div>
                {(() => {
                  const totalAbs = balance.inflows + balance.outflows;
                  const saldoChartData = [
                    { name: "Przychody", value: balance.inflows, fill: "#45efc5" },
                    { name: "Wydatki", value: balance.outflows, fill: "#ffb2b8" },
                  ];
                  const saldoChartConfig = {
                    przychody: { label: "Przychody", color: "#45efc5" },
                    wydatki: { label: "Wydatki", color: "#ffb2b8" },
                  } satisfies ChartConfig;
                  return (
                    <div className="flex flex-col items-center py-4">
                      <ChartContainer
                        config={saldoChartConfig}
                        className="relative aspect-auto h-50 sm:h-62.5 lg:h-70 w-full max-w-60 sm:max-w-70 lg:max-w-[320px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={
                              <ChartTooltipContent
                                hideLabel
                                formatter={(value) => `${Number(value).toLocaleString("pl-PL")} PLN`}
                              />
                            }
                          />
                          <Pie
                            data={saldoChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius="42%"
                            outerRadius="82%"
                            strokeWidth={3}
                            stroke="var(--background)"
                          >
                            {saldoChartData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            verticalAlign="bottom"
                          />
                        </PieChart>
                        {/* Tekst w centrum donuta */}
                        <div className="absolute left-0 right-0 flex flex-col items-center pointer-events-none" style={{ top: '28%' }}>
                          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                            Saldo
                          </span>
                          <span className="text-base sm:text-lg lg:text-xl font-extrabold text-on-surface mt-0.5">
                            {balance.amount.toLocaleString("pl-PL")} PLN
                          </span>
                          <span
                            className={`text-[10px] sm:text-xs font-bold mt-0.5 ${
                              balance.amount >= 0
                                ? "text-primary"
                                : "text-secondary"
                            }`}
                          >
                            {balance.status}
                          </span>
                        </div>
                      </ChartContainer>
                      {/* Podsumowanie pod wykresem */}
                      <div className="text-xs text-on-surface-variant mt-1">
                        {totalAbs > 0 ? `${((balance.inflows / totalAbs) * 100).toFixed(0)}% przychodów` : "Brak danych"}
                      </div>
                    </div>
                  );
                })()}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant block">
                        Wpływy
                      </span>
                      <span className="text-sm font-bold text-on-surface">
                        + {balance.inflows.toLocaleString("pl-PL")} zł
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center text-secondary">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant block">
                        Wypływy
                      </span>
                      <span className="text-sm font-bold text-on-surface">
                        - {balance.outflows.toLocaleString("pl-PL")} zł
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategorie budżetowe */}
              <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-on-surface mb-5">
                  Przegląd Budżetów Kategorii
                </h3>
                {categories.length === 0 ? (
                  <div className="py-8 text-center text-on-surface-variant text-sm">
                    Brak kategorii. Dodaj pierwszą transakcję, aby utworzyć
                    domyślne kategorie.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.map((cat, index) => {
                      const pct =
                        cat.limit && cat.limit > 0
                          ? Math.min((cat.spent / cat.limit) * 100, 100)
                          : 0;

                      // Kolory pasków postępu przypisane do kategorii
                      const colorMap: Record<string, string> = {
                        secondary: "bg-secondary shadow-[0_0_10px_rgba(255,178,184,0.6)]",
                        tertiary: "bg-tertiary shadow-[0_0_10px_rgba(255,207,122,0.6)]",
                        primary: "bg-primary shadow-[0_0_10px_rgba(69,239,197,0.6)]",
                        "primary-fixed": "bg-primary-fixed shadow-[0_0_10px_rgba(87,252,210,0.5)]",
                        "secondary-fixed": "bg-secondary-fixed shadow-[0_0_10px_rgba(255,218,219,0.5)]",
                      };

                      const dotColorMap: Record<string, string> = {
                        secondary: "bg-secondary",
                        tertiary: "bg-tertiary",
                        primary: "bg-primary",
                        "primary-fixed": "bg-primary-fixed",
                        "secondary-fixed": "bg-secondary-fixed",
                      };

                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        >
                          <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
                            <span className="text-on-surface font-medium flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${dotColorMap[cat.color] ?? "bg-primary"}`}
                              />
                              <span>{cat.icon}</span>
                              {cat.name}
                            </span>
                            <span className="font-bold text-on-surface">
                              {cat.spent.toLocaleString("pl-PL")} /{" "}
                              {cat.limit?.toLocaleString("pl-PL") ?? "∞"}{" "}
                              {cat.currency}
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-surface-container-lowest overflow-hidden border border-border/40">
                            <motion.div
                              className={`h-full rounded-full ${colorMap[cat.color] ?? "bg-primary"}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Zakładka: Transakcje */}
        {!isLoadingData && activeTab === "transakcje" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-on-surface">
                Transakcje (Firestore realtime)
              </h3>
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Nowa transakcja
              </button>
            </div>

            {txForDisplay.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant text-sm space-y-3">
                <Receipt className="w-10 h-10 mx-auto opacity-50" />
                <p>Brak transakcji. Dodaj pierwszą operację!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {txForDisplay.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-surface-container-high/60 border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          op.type === "income"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        {op.type === "income" ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-on-surface">
                          {op.title}
                        </div>
                        <div className="text-xs text-on-surface-variant">
                          {op.category} • {op.status}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`font-bold text-sm ${
                          op.type === "income"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      >
                        {op.type === "income" ? "+" : "-"}{" "}
                        {op.amount.toLocaleString("pl-PL")} PLN
                      </div>

                      {/* Przycisk usuwania */}
                      {deletingId === op.id ? (
                        <Loader2 className="w-4 h-4 text-secondary animate-spin" />
                      ) : (
                        <button
                          onClick={() => handleDeleteTransaction(op)}
                          type="button"
                          className="p-2 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all cursor-pointer"
                          aria-label="Usuń transakcję"
                          title="Usuń transakcję"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Zakładka: Analityka */}
        {!isLoadingData && activeTab === "analityka" && (
          <AnalyticsCharts operations={operations} />
        )}

        {/* Zakładka: Ustawienia */}
        {!isLoadingData && activeTab === "ustawienia" && (
          <div className="py-8 max-w-lg mx-auto space-y-6">
            <h3 className="text-lg font-bold text-on-surface">
              Ustawienia konta
            </h3>

            {/* Informacje o koncie */}
            <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                {userProfile?.photoURL ? (
                  <Image
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-14 h-14 rounded-full border-2 border-primary/40 object-cover"
                    referrerPolicy="no-referrer"
                    width={56}
                    height={56}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-on-surface">
                      {userProfile?.displayName ?? "Użytkownik"}
                    </p>
                    {isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[10px] font-bold text-primary uppercase tracking-wider">
                        👑 Admin
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-border">
                  <span className="text-on-surface-variant block mb-1">
                    Rola
                  </span>
                  <span className={`font-bold uppercase ${isAdmin ? "text-primary" : "text-on-surface"}`}>
                    {userProfile?.role ?? "user"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-border">
                  <span className="text-on-surface-variant block mb-1">
                    Plan
                  </span>
                  <span className="font-bold text-primary uppercase">
                    {userProfile?.plan}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-border">
                  <span className="text-on-surface-variant block mb-1">
                    Dostawca
                  </span>
                  <span className="font-bold text-on-surface capitalize">
                    {userProfile?.provider}
                  </span>
                </div>
              </div>
            </div>

            {/* Bezpieczeństwo */}
            <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-on-surface">
                  Bezpieczeństwo
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Szyfrowanie AES-256-GCM
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Firebase Security Rules aktywne
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Weryfikacja dwuskładnikowa dostępna
                </li>
              </ul>
            </div>

            {/* Sekcja admina — tylko dla administratorów */}
            {isAdmin && (
              <div className="bg-surface-container-high/50 border border-primary/30 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">
                    Zarządzanie systemem
                  </h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[9px] font-bold text-primary uppercase">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Przeglądaj wszystkich użytkowników, sprawdzaj role i plany subskrypcji.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs shadow-[0_0_15px_var(--glow-primary)] transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Otwórz panel admina
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer footerLinks={navigationData.footerLinks} />

      {/* Modal dodawania transakcji */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}

// ============================================================================
// Komponenty pomocnicze
// ============================================================================

/** Karta metryki finansowej */
function MetricCard({
  label,
  amount,
  percentage,
  period,
  status,
  color,
  icon,
}: {
  label: string;
  amount: number;
  percentage?: number;
  period?: string;
  status?: string;
  color: "primary" | "secondary" | "primary-fixed";
  icon: React.ReactNode;
}) {
  const colorClasses = {
    primary: {
      text: "text-primary",
      bg: "bg-primary/15",
      border: "border-primary/20",
      glow: "group-hover:border-primary/40",
    },
    secondary: {
      text: "text-secondary",
      bg: "bg-secondary/15",
      border: "border-secondary/20",
      glow: "group-hover:border-secondary/40",
    },
    "primary-fixed": {
      text: "text-primary-fixed",
      bg: "bg-primary-fixed/15",
      border: "border-primary-fixed/20",
      glow: "group-hover:border-primary-fixed/40",
    },
  };

  const c = colorClasses[color];

  return (
    <div
      className={`bg-surface-container-high/70 border border-border rounded-2xl p-5 shadow-md relative overflow-hidden group hover:border-primary/40 transition-all ${c.glow}`}
    >
      <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
        {label}
      </span>
      <div
        className={`text-2xl sm:text-3xl font-extrabold ${c.text} my-1 flex items-baseline gap-1.5`}
      >
        <span>{amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })}</span>
        <span className={`text-sm font-bold ${c.text}/80`}>PLN</span>
      </div>
      {percentage !== undefined && period ? (
        <div
          className={`inline-flex items-center gap-1 ${c.text} text-xs font-bold ${c.bg} border ${c.border} px-2.5 py-0.5 rounded-full`}
        >
          {icon}
          <span>
            {percentage > 0 ? "+" : ""}
            {percentage}% {period}
          </span>
        </div>
      ) : status ? (
        <div
          className={`inline-flex items-center gap-1 ${c.text} text-xs font-bold ${c.bg} border ${c.border} px-2.5 py-0.5 rounded-full`}
        >
          {icon}
          <span>{status}</span>
        </div>
      ) : null}
    </div>
  );
}

/** Placeholder ikony LayoutDashboard (brak w imporcie) */
function LayoutDashboard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

/** Placeholder ikony User */
function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
