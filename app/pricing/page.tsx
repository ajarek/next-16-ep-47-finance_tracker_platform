import PricingPageContent from "@/components/pricing/PricingPageContent";
import pricingData from "@/public/data/pricing.json";
import navigationData from "@/public/data/navigation.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cennik i okres próbny • Finance Tracker",
  description:
    "Wybierz plan Finance Tracker dopasowany do Twoich potrzeb. Rozpocznij 7-dniowy darmowy okres próbny z pełnym dostępem do funkcji Pro.",
  openGraph: {
    title: "Cennik • Finance Tracker",
    description:
      "Porównaj plany Finance Tracker i rozpocznij darmowy okres próbny.",
    type: "website",
    locale: "pl_PL",
  },
};

/**
 * Serwerowa strona cennika (App Router).
 * Pobiera dane planów cenowych i przekazuje je do komponentów prezentacyjnych.
 */
export default function PricingPage() {
  return (
    <PricingPageContent
      plans={pricingData.plans}
      trialActivation={pricingData.trialActivation}
      paymentMethods={pricingData.paymentMethods}
      whyNow={pricingData.whyNow}
      navLinks={navigationData.navLinks}
      footerLinks={navigationData.footerLinks}
    />
  );
}
