"use client";

import { useState } from "react";
import WebGlBackground from "@/components/WebGlBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DashboardMockup from "@/components/DashboardMockup";
import FeaturesSection from "@/components/FeaturesSection";
import AuthSection from "@/components/AuthSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TransactionModal from "@/components/TransactionModal";
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
  const [metrics, setMetrics] = useState<FinanceMetrics>(initialMetrics);
  const [balance, setBalance] = useState<BalanceOverview>(initialBalance);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  // Stany otwarcia modali
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Dodanie nowej transakcji i dynamiczne przeliczenie salda oraz metryk
  const handleAddTransaction = (newTx: Transaction) => {
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
