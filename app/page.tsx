import LandingPageContent from "@/components/LandingPageContent"
import mockFinances from "@/public/data/mock-finances.json"
import featuresData from "@/public/data/features.json"
import navigationData from "@/public/data/navigation.json"
import type {
  FinanceMetrics,
  BalanceOverview,
  BudgetCategory,
  Transaction,
  FeatureCardData,
} from "@/lib/types"

/**
 * Główna strona aplikacji (Komponent serwerowy Next.js 16 App Router).
 * Pobiera dane początkowe z przygotowanych zestawów danych w public/data/
 * i przekazuje je do wyspecjalizowanych komponentów prezentacyjnych.
 */
export default function Home() {
  const initialMetrics = mockFinances.metrics as FinanceMetrics
  const initialBalance = mockFinances.currentBalance as BalanceOverview
  const initialCategories = mockFinances.categories as BudgetCategory[]
  const initialTransactions = mockFinances.recentTransactions as Transaction[]
  const features = featuresData as FeatureCardData[]
  const navLinks = navigationData.navLinks
  const footerLinks = navigationData.footerLinks

  return (
    <LandingPageContent
      initialMetrics={initialMetrics}
      initialBalance={initialBalance}
      initialCategories={initialCategories}
      initialTransactions={initialTransactions}
      features={features}
      navLinks={navLinks}
      footerLinks={footerLinks}
    />
  )
}
