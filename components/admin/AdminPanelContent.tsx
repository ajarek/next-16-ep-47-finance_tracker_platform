"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Shield,
  Users,
  Crown,
  User as UserIcon,
  Mail,
  Calendar,
  CreditCard,
  Search,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { getAllUsers } from "@/lib/firestore";
import type { FirestoreUser } from "@/lib/firestore-types";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import navigationData from "@/public/data/navigation.json";
import Image from "next/image";

/**
 * Główny komponent panelu administracyjnego.
 * Wyświetla listę wszystkich użytkowników z danymi profilowymi.
 * Dostępny tylko dla użytkowników z rolą "admin".
 */
export default function AdminPanelContent() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Chronienie trasy — przekierowanie jeśli brak auth lub brak admina
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [authLoading, user, isAdmin, router]);

  // Pobieranie wszystkich użytkowników z Firestore
  useEffect(() => {
    if (!user || !isAdmin) return;

    let cancelled = false;

    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        if (!cancelled) {
          setUsers(allUsers);
        }
      } catch (error) {
        console.error("[Admin] Błąd pobierania użytkowników:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();
    return () => { cancelled = true; };
  }, [user, isAdmin]);

  // Filtrowanie użytkowników
  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // Statystyki
  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    users: users.filter((u) => u.role === "user").length,
    plans: {
      free: users.filter((u) => u.plan === "free").length,
      starter: users.filter((u) => u.plan === "starter").length,
      pro: users.filter((u) => u.plan === "pro").length,
      enterprise: users.filter((u) => u.plan === "enterprise").length,
    },
  };

  // Widok ładowania / brak auth / brak admina
  if (authLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-on-surface-variant">
          {!isAdmin ? "Brak dostępu — wymagana rola admina" : "Ładowanie panelu..."}
        </p>
      </div>
    );
  }

  // Formatowanie daty
  function formatDate(timestamp: { toDate?: () => Date } | null | undefined): string {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Renderowanie
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar
        navLinks={navigationData.navLinks}
        onOpenTransactionModal={() => {}}
        onOpenAuthModal={() => router.push("/")}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Nagłówek */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_var(--glow-primary)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Panel Administracyjny
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Zarządzanie użytkownikami systemu
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-border text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do panelu
          </Link>
        </div>

        {/* Karty statystyk */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Wszyscy"
            value={stats.total}
            icon={<Users className="w-4 h-4" />}
            color="primary"
          />
          <StatCard
            label="Admini"
            value={stats.admins}
            icon={<Crown className="w-4 h-4" />}
            color="primary"
          />
          <StatCard
            label="Użytkownicy"
            value={stats.users}
            icon={<UserIcon className="w-4 h-4" />}
            color="secondary"
          />
          <StatCard
            label="Aktywne plany"
            value={stats.total - stats.plans.free}
            icon={<CreditCard className="w-4 h-4" />}
            color="primary-fixed"
          />
        </div>

        {/* Pasek wyszukiwania */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Szukaj użytkownika po nazwie, emailu lub roli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container-high/60 border border-border text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Widok ładowania */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-sm text-on-surface-variant">
              Pobieranie użytkowników...
            </span>
          </div>
        )}

        {/* Lista użytkowników */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant text-sm space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-50" />
                <p>
                  {searchQuery
                    ? "Brak wyników dla podanego zapytania."
                    : "Brak użytkowników w systemie."}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredUsers.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
                    className="bg-surface-container-high/50 border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all"
                  >
                    {/* Główny wiersz */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() =>
                        setExpandedUserId(expandedUserId === u.id ? null : u.id)
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        {u.photoURL ? (
                          <Image
                            src={u.photoURL}
                            alt={u.displayName}
                            className="w-10 h-10 rounded-full border border-primary/30 object-cover shrink-0"
                            referrerPolicy="no-referrer"
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                            <UserIcon className="w-5 h-5" />
                          </div>
                        )}

                        {/* Dane główne */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-on-surface truncate">
                              {u.displayName}
                            </span>
                            {u.role === "admin" && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-[9px] font-bold text-primary uppercase">
                                👑 Admin
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-on-surface-variant truncate block">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Plan */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            u.plan === "free"
                              ? "bg-surface-container-lowest text-on-surface-variant border-border"
                              : "bg-primary/15 text-primary border-primary/30"
                          }`}
                        >
                          {u.plan}
                        </span>

                        {/* Rozwiń/Zwiń */}
                        {expandedUserId === u.id ? (
                          <EyeOff className="w-4 h-4 text-on-surface-variant" />
                        ) : (
                          <Eye className="w-4 h-4 text-on-surface-variant" />
                        )}
                      </div>
                    </div>

                    {/* Rozwinięte szczegóły */}
                    <AnimatePresence>
                      {expandedUserId === u.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-border">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <DetailItem
                                icon={<Shield className="w-3.5 h-3.5" />}
                                label="Rola"
                                value={u.role}
                                highlight={u.role === "admin"}
                              />
                              <DetailItem
                                icon={<CreditCard className="w-3.5 h-3.5" />}
                                label="Plan"
                                value={u.plan}
                              />
                              <DetailItem
                                icon={<Mail className="w-3.5 h-3.5" />}
                                label="Dostawca"
                                value={u.provider}
                              />
                              <DetailItem
                                icon={<Calendar className="w-3.5 h-3.5" />}
                                label="Rejestracja"
                                value={formatDate(u.createdAt)}
                              />
                            </div>
                            <div className="mt-3 text-[11px] text-on-surface-variant/60 font-mono">
                              UID: {u.id}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </main>

      <Footer footerLinks={navigationData.footerLinks} />
    </div>
  );
}

// ============================================================================
// Komponenty pomocnicze
// ============================================================================

/** Karta statystyki */
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "primary-fixed";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/15 border-primary/20",
    secondary: "text-secondary bg-secondary/15 border-secondary/20",
    "primary-fixed": "text-primary-fixed bg-primary-fixed/15 border-primary-fixed/20",
  };

  return (
    <div className="bg-surface-container-high/70 border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-on-surface-variant">
          {label}
        </span>
      </div>
      <span className="text-2xl font-extrabold text-on-surface">{value}</span>
    </div>
  );
}

/** Element szczegółów użytkownika */
function DetailItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-on-surface-variant">{icon}</span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
          {label}
        </span>
      </div>
      <span
        className={`text-xs font-bold capitalize ${
          highlight ? "text-primary" : "text-on-surface"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
