"use client";

import { useState } from "react";
import WebGlPricing from "@/components/pricing/WebGlPricing";
import Navbar from "@/components/Navbar";
import PricingHero from "@/components/pricing/PricingHero";
import PricingCards from "@/components/pricing/PricingCards";
import TrialActivation from "@/components/pricing/TrialActivation";
import PaymentMethod from "@/components/pricing/PaymentMethod";
import PricingFeatures from "@/components/pricing/PricingFeatures";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import TransactionModal from "@/components/TransactionModal";
import type { NavLinkItem } from "@/lib/types";

interface PricingPlan {
  id: string;
  category: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  annualNote: string;
  badge: { top?: string; side?: string } | null;
  ctaLabel: string;
  ctaIcon: string;
  ctaPrimary?: boolean;
  features: {
    text: string;
    icon: string;
    disabled?: boolean;
    highlight?: boolean;
    subtext?: string;
  }[];
}

interface TrialStep {
  number: number;
  label: string;
  price: string;
  description: string;
}

interface SecurityNote {
  icon: string;
  text: string;
}

interface TrialActivationData {
  title: string;
  selectedPlan: string;
  steps: TrialStep[];
  securityNotes: SecurityNote[];
}

interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
}

interface WhyNowFeature {
  icon: string;
  title: string;
  description: string;
  stat: string;
  statIcon: string;
}

interface PricingFeaturesData {
  title: string;
  features: WhyNowFeature[];
}

interface PricingPageContentProps {
  plans: PricingPlan[];
  trialActivation: TrialActivationData;
  paymentMethods: PaymentMethodOption[];
  whyNow: PricingFeaturesData;
  navLinks: NavLinkItem[];
  footerLinks: NavLinkItem[];
}

/**
 * Główny kontener klienta strony cennika łączący wszystkie komponenty,
 * shader WebGL oraz modale.
 */
export default function PricingPageContent({
  plans,
  trialActivation,
  paymentMethods,
  whyNow,
  navLinks,
  footerLinks,
}: PricingPageContentProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary/30 selection:text-primary">
      {/* Tło WebGL z subtelnym gradientem, pływającymi okręgami i spotlightem */}
      <WebGlPricing />

      {/* Pasek nawigacji z aktywnym linkiem cennika */}
      <Navbar
        navLinks={navLinks.map((link) => ({
          ...link,
          active: link.href === "/pricing",
        }))}
        onOpenTransactionModal={() => setIsTransactionModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Główna zawartość strony */}
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Hero z tytułem i przełącznikiem rozliczeń */}
        <PricingHero
          isAnnual={isAnnual}
          onToggleBilling={setIsAnnual}
        />

        {/* Trzy karty planów cenowych */}
        <PricingCards
          plans={plans}
          isAnnual={isAnnual}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Podsumowanie aktywacji okresu próbnego */}
        <TrialActivation data={trialActivation} />

        {/* Wybór metody płatności */}
        <PaymentMethod
          methods={paymentMethods}
          onActivateTrial={() => setIsAuthModalOpen(true)}
        />

        {/* Sekcja "Dlaczego warto" */}
        <PricingFeatures data={whyNow} />
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
        onAddTransaction={() => {}}
      />
    </div>
  );
}
