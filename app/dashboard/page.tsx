import type { Metadata } from "next";
import DashboardPageContent from "@/components/dashboard/DashboardPageContent";

export const metadata: Metadata = {
  title: "Panel finansów • Finance Tracker",
  description:
    "Zarządzaj swoimi finansami, śledź wydatki i przychody w czasie rzeczywistym z Firebase Firestore.",
  openGraph: {
    title: "Panel finansów • Finance Tracker",
    description: "Twój osobisty panel do zarządzania finansami.",
    type: "website",
    locale: "pl_PL",
  },
};

/**
 * Strona panelu finansowego (App Router).
 * Chroniona — wymaga zalogowania i aktywnego planu.
 * Dane pobierane z Firestore w komponencie klienckim.
 */
export default function DashboardPage() {
  return <DashboardPageContent />;
}
