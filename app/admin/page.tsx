import type { Metadata } from "next";
import AdminPanelContent from "@/components/admin/AdminPanelContent";

export const metadata: Metadata = {
  title: "Panel administracyjny • Finance Tracker",
  description:
    "Zarządzanie użytkownikami systemu — przeglądaj profile, role i plany subskrypcji.",
  openGraph: {
    title: "Panel administracyjny • Finance Tracker",
    description: "Panel zarządzania użytkownikami Finance Tracker.",
    type: "website",
    locale: "pl_PL",
  },
};

/**
 * Strona panelu administracyjnego (App Router).
 * Chroniona — wymaga zalogowania i roli "admin".
 * Dane pobierane z Firestore w komponencie klienckim.
 */
export default function AdminPage() {
  return <AdminPanelContent />;
}
