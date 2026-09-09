"use client";

import { useState, useEffect } from "react";
import WebGlBackground from "@/components/WebGlBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DashboardMockup from "@/components/DashboardMockup";
import FeaturesSection from "@/components/FeaturesSection";
import AuthSection from "@/components/AuthSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TransactionModal from "@/components/TransactionModal";
import { useAuth } from "@/lib/auth-context";
import { createOperation, onOperationsSnapshot, onCategoriesSnapshot, recalculateAllCategoriesSpent } from "@/lib/firestore";
import type { FirestoreOperation } from "@/lib/firestore-types";
import type {
  FinanceMetrics,
  BalanceOverview,
  BudgetCategory,
  Transaction,
  FeatureCardData,
  NavLinkItem,
} from "@/lib/types";

interface LandingPageContentProps {
  initialMetrics: FinanceMetrics;
  initialBalance: BalanceOverview;
  initialCategories: BudgetCategory[];
  initialTransactions: Transaction[];
  features: FeatureCardData[];
  navLinks: NavLinkItem[];
  footerLinks: NavLinkItem[];
}

/**
 * Główny interaktywny kontener strony łączący komponenty, shader WebGL oraz modale.
 */
export default function LandingPageContent({
  initialMetrics,
  initialBalance,
  initialCategories,
  initialTransactions,
  features,
  navLinks,
  footerLinks,
}: LandingPageContentProps) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<FinanceMetrics>(initialMetrics);
  const [balance, setBalance] = useState<BalanceOverview>(initialBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Stany otwarcia modali
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Nasłuchiwanie zmian operacji i kategorii z Firestore w czasie rzeczywistym
  useEffect(() => {
    if (!user) return;

    const unsubOps = onOperationsSnapshot(user.uid, (ops: FirestoreOperation[]) => {
      const mapped: Transaction[] = ops.map((op) => ({
        id: op.id,
        title: op.title,
        category: op.category,
        amount: op.amount,
        type: op.type,
        date: typeof op.date?.toDate === "function"
          ? op.date.toDate().toISOString()
          : String(op.date),
        status: op.status,
      }));
      setTransactions(mapped);

      // Przelicz metryki na podstawie operacji z Firestore
      let totalIncome = 0;
      let totalExpenses = 0;
      for (const op of ops) {
        if (op.type === "income") totalIncome += op.amount;
        else totalExpenses += op.amount;
      }
      const netProfit = totalIncome - totalExpenses;

      setBalance({
        amount: netProfit,
        currency: "PLN",
        status: netProfit >= 0 ? "Saldo dodatnie" : "Saldo ujemne",
        inflows: totalIncome,
        outflows: totalExpenses,
      });
      setMetrics({
        totalIncome: { ...initialMetrics.totalIncome, amount: totalIncome },
        currentExpenses: { ...initialMetrics.currentExpenses, amount: totalExpenses },
        netProfit: { ...initialMetrics.netProfit, amount: netProfit },
      });
    });

    const unsubCats = onCategoriesSnapshot(user.uid, () => {
      // Kategorie zaktualizują się automatycznie
    });

    recalculateAllCategoriesSpent(user.uid).catch(() => {});

    return () => {
      unsubOps();
      unsubCats();
    };
  }, [user, initialMetrics]);

  // Dodanie nowej transakcji: zapis do Firestore + aktualizacja lokalnego stanu
  const handleAddTransaction = async (newTx: Transaction) => {
    // Zapis do Firestore (jeśli zalogowany)
    if (user) {
      try {
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
        return;
      } catch (error) {
        console.error("[Landing] Błąd zapisu operacji do Firestore:", error);
      }
    }

    // Fallback: aktualizacja lokalnego stanu (niezalogowany lub błąd zapisu)
    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.type === "income") {
      setBalance((prev) => ({
        ...prev,
        amount: prev.amount + newTx.amount,
        inflows: prev.inflows + newTx.amount,
      }));
      setMetrics((prev) => ({
        ...prev,
        totalIncome: {
          ...prev.totalIncome,
          amount: prev.totalIncome.amount + newTx.amount,
        },
        netProfit: {
          ...prev.netProfit,
          amount: prev.netProfit.amount + newTx.amount,
        },
      }));
    } else {
      setBalance((prev) => ({
        ...prev,
        amount: prev.amount - newTx.amount,
        outflows: prev.outflows + newTx.amount,
      }));
      setMetrics((prev) => ({
        ...prev,
        currentExpenses: {
          ...prev.currentExpenses,
          amount: prev.currentExpenses.amount + newTx.amount,
        },
        netProfit: {
          ...prev.netProfit,
          amount: prev.netProfit.amount - newTx.amount,
        },
      }));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Tło WebGL z subtelnym gradientem, siatką i interaktywnym spotlightem */}
      <WebGlBackground />

      {/* Pasek nawigacji górnej */}
      <Navbar
        navLinks={navLinks}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Główna zawartość strony */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Sekcja Hero z nagłówkiem i wezwaniem do działania */}
        <HeroSection onOpenAuthModal={() => setIsAuthModalOpen(true)} />

        {/* Interaktywny szklany panel pulpitu finansowego */}
        <DashboardMockup
          metrics={metrics}
          balanceOverview={balance}
          categories={initialCategories}
          transactions={transactions}
          onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        />

        {/* Sekcja możliwości platformy */}
        <FeaturesSection
          features={features}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Sekcja rejestracji i darmowego okresu próbnego */}
        <AuthSection />
      </main>

      {/* Stopka serwisu */}
      <Footer footerLinks={footerLinks} />

      {/* Modale dialogowe */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
