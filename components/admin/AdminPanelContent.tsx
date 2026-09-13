"use client";

import { useState, useEffect, useMemo } from "react";
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
  Download,
  UserPlus,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { getAllUsers } from "@/lib/firestore";
import type { FirestoreUser } from "@/lib/firestore-types";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InviteUserModal from "@/components/admin/InviteUserModal";
import Link from "next/link";
import navigationData from "@/public/data/navigation.json";
import Image from "next/image";

// ============================================================================
// Typy pomocnicze
// ============================================================================

/** Filtry na górze listy */
type FilterTab = "all" | "admin" | "pro" | "trial" | "blocked";

/** Rozszerzony profil użytkownika z danymi symulowanymi */
interface ExtendedUser extends FirestoreUser {
  /** Symulowany bilans konta w PLN */
  balance: number;
  /** Ostatnia aktywność (opis) */
  lastActivity: string;
  /** Czas od ostatniej aktywności */
  lastActivityTime: string;
}

// ============================================================================
// Stałe i funkcje pomocnicze
// ============================================================================

/** Etykiety kart filtrów */
const FILTER_TABS: { key: FilterTab; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "Wszyscy", icon: <Users className="w-3.5 h-3.5" /> },
  { key: "admin", label: "Admin", icon: <Crown className="w-3.5 h-3.5" /> },
  { key: "pro", label: "Pro", icon: <Zap className="w-3.5 h-3.5" /> },
  { key: "trial", label: "Trial", icon: <Clock className="w-3.5 h-3.5" /> },
  { key: "blocked", label: "Zablokowani", icon: <Ban className="w-3.5 h-3.5" /> },
];

/** Generuje deterministyczny bilans na podstawie UID użytkownika */
function generateBalance(uid: string): number {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = ((hash << 5) - hash + uid.charCodeAt(i)) | 0;
  }
  const absHash = Math.abs(hash);
  // 30% użytkowników ma zerowy bilans (zablokowani / nieaktywni)
  if (absHash % 10 < 3) return 0;
  return (absHash % 250000) + (absHash % 5000) - 2500;
}

/** Generuje symulowaną ostatnią aktywność */
function generateActivity(
  createdAt: { toDate?: () => Date } | null
): { description: string; time: string } {
  const now = Date.now();
  const created = createdAt?.toDate?.()?.getTime?.() ?? now - 86400000 * 30;
  const elapsed = now - created;

  const activities = [
    "Zapis (Firestore)",
    "Odczyt budżetu",
    "Eksport CSV do banku",
    "Aktualizacja profilu",
    "Logowanie OAuth",
    "Odczyt kategorii",
    "Generowanie raportu",
  ];

  const times = [
    { threshold: 3600000, label: "Teraz" },
    { threshold: 7200000, label: "18 minut temu" },
    { threshold: 21600000, label: "2 godziny temu" },
    { threshold: 86400000, label: "12 dni temu" },
    { threshold: 604800000, label: "3 dni temu" },
    { threshold: 2592000000, label: "2 tygodnie temu" },
    { threshold: Infinity, label: "Miesiąc temu" },
  ];

  const activityIdx = Math.abs(elapsed) % activities.length;
  const timeIdx = times.findIndex((t) => elapsed < t.threshold);

  return {
    description: activities[activityIdx],
    time: times[timeIdx >= 0 ? timeIdx : times.length - 1].label,
  };
}

/** Formatuje liczbę jako walutę PLN */
function formatPLN(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Główny komponent panelu administracyjnego.
 * Wyświetla listę użytkowników w formie zaawansowanej tabeli
 * z filtrami, wyszukiwaniem i detalami.
 */
export default function AdminPanelContent() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin]);

  // Rozszerzenie użytkowników o zasymulowane dane
  const extendedUsers: ExtendedUser[] = useMemo(
    () =>
      users.map((u) => ({
        ...u,
        balance: generateBalance(u.id),
        lastActivity: generateActivity(u.updatedAt).description,
        lastActivityTime: generateActivity(u.updatedAt).time,
      })),
    [users]
  );

  // Liczby dla kart filtrów
  const filterCounts = useMemo(
    () => ({
      all: extendedUsers.length,
      admin: extendedUsers.filter((u) => u.role === "admin").length,
      pro: extendedUsers.filter((u) => u.plan === "pro" || u.plan === "enterprise").length,
      trial: extendedUsers.filter((u) => u.trialEndsAt !== null).length,
      blocked: 0, // Brak pola "blocked" w modelu — zawsze 0
    }),
    [extendedUsers]
  );

  // Filtrowanie użytkowników
  const filteredUsers = useMemo(() => {
    let result = extendedUsers;

    // Filtr kartami
    switch (activeFilter) {
      case "admin":
        result = result.filter((u) => u.role === "admin");
        break;
      case "pro":
        result = result.filter((u) => u.plan === "pro" || u.plan === "enterprise");
        break;
      case "trial":
        result = result.filter((u) => u.trialEndsAt !== null);
        break;
      case "blocked":
        result = []; // Brak pola "blocked" w modelu
        break;
    }

    // Wyszukiwanie tekstowe
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.plan.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    return result;
  }, [extendedUsers, activeFilter, searchQuery]);

  // Statystyki
  const stats = useMemo(
    () => ({
      total: extendedUsers.length,
      admins: extendedUsers.filter((u) => u.role === "admin").length,
      pro: extendedUsers.filter((u) => u.plan === "pro" || u.plan === "enterprise").length,
      trial: extendedUsers.filter((u) => u.trialEndsAt !== null).length,
      blocked: 0,
    }),
    [extendedUsers]
  );

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
  function formatDate(
    timestamp: { toDate?: () => Date } | null | undefined
  ): string {
    if (!timestamp?.toDate) return "—";
    return timestamp.toDate().toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Eksport JSON
  function handleExportJSON() {
    const data = filteredUsers.map((u) => ({
      id: u.id,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      plan: u.plan,
      provider: u.provider,
      createdAt: u.createdAt?.toDate?.()?.toISOString() ?? null,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Renderowanie
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar
        navLinks={navigationData.navLinks}
        onOpenTransactionModal={() => {}}
        onOpenAuthModal={() => router.push("/")}
      />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
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

        {/* Karty filtrów + przyciski akcji */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Filtry */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_TABS.map((tab) => {
              const count = filterCounts[tab.key];
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-on-primary shadow-[0_0_12px_var(--glow-primary)]"
                      : "bg-surface-container-high border border-border text-on-surface-variant hover:text-on-surface hover:border-primary/30"
                  }`}
                >
                  {tab.icon}
                  <span>
                    {tab.label} ({count})
                  </span>
                </button>
              );
            })}

            {/* Przycisk wyszukiwania */}
            <div className="relative ml-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-9 pr-3 py-1.5 rounded-full bg-surface-container-high/60 border border-border text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high border border-border text-xs font-bold text-on-surface-variant hover:text-on-surface hover:border-primary/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Eksportuj JSON
            </button>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold shadow-[0_0_12px_var(--glow-primary)] hover:bg-primary-hover transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Zaproś Użytkownika
            </button>
          </div>
        </div>

        {/* Kolumny nagłówkowe */}
        <div className="hidden lg:grid grid-cols-[1.4fr_0.9fr_1fr_1fr_0.8fr] gap-4 px-4 py-3 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
            Tożsamość / Firebase UID
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
            Rola systemowa
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
            Subskrypcja plan
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
            Aktywność Firestore
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70 text-right">
            Bilans konta
          </span>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-px bg-border mb-1" />

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
          <div>
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(index * 0.02, 0.3),
                      ease: "easeOut",
                    }}
                  >
                    <UserRow
                      user={u}
                      isExpanded={expandedUserId === u.id}
                      onToggle={() =>
                        setExpandedUserId(
                          expandedUserId === u.id ? null : u.id
                        )
                      }
                      formatDate={formatDate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </main>

      <Footer footerLinks={navigationData.footerLinks} />

      {/* Modal zapraszania użytkownika */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}

// ============================================================================
// Wiersz użytkownika
// ============================================================================

function UserRow({
  user,
  isExpanded,
  onToggle,
  formatDate,
}: {
  user: ExtendedUser;
  isExpanded: boolean;
  onToggle: () => void;
  formatDate: (ts: { toDate?: () => Date } | null | undefined) => string;
}) {
  return (
    <div
      className={`border-b border-border/50 transition-colors ${
        isExpanded ? "bg-surface-container-high/30" : "hover:bg-surface-container-high/15"
      }`}
    >
      {/* Główny wiersz */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr_1fr_1fr_0.8fr] gap-3 lg:gap-4 items-center px-4 py-4 text-left cursor-pointer"
      >
        {/* Tożsamość */}
        <div className="flex items-center gap-3 min-w-0">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName}
              className="w-10 h-10 rounded-full border border-primary/20 object-cover shrink-0"
              referrerPolicy="no-referrer"
              width={40}
              height={40}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center text-primary shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-on-surface truncate">
                {user.displayName}
              </span>
              {user.role === "admin" && (
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              )}
            </div>
            <span className="text-[11px] text-on-surface-variant/70 truncate block font-mono">
              {user.email}
            </span>
            <span className="text-[10px] text-on-surface-variant/40 truncate block font-mono">
              uid: {user.id.slice(0, 8)}…{user.id.slice(-3)}
            </span>
          </div>
        </div>

        {/* Rola */}
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
        </div>

        {/* Subskrypcja */}
        <PlanBadge
          plan={user.plan}
          trialEndsAt={user.trialEndsAt}
          planActivatedAt={user.planActivatedAt}
        />

        {/* Aktywność Firestore */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-on-surface">
            {user.lastActivityTime}
          </span>
          <span className="text-[11px] text-on-surface-variant/60">
            {user.lastActivity}
          </span>
        </div>

        {/* Bilans */}
        <div className="flex items-center justify-end gap-2">
          <div className="text-right">
            <div
              className={`text-sm font-extrabold tabular-nums ${
                user.balance > 0
                  ? "text-primary"
                  : user.balance < 0
                    ? "text-secondary"
                    : "text-on-surface-variant/50"
              }`}
            >
              {user.balance > 0 ? "+" : ""}
              {formatPLN(user.balance)} PLN
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-on-surface-variant/40 transition-transform shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </button>

      {/* Rozwinięte szczegóły */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <DetailCard
                  icon={<Shield className="w-3.5 h-3.5" />}
                  label="Rola"
                  value={user.role}
                  highlight={user.role === "admin"}
                />
                <DetailCard
                  icon={<CreditCard className="w-3.5 h-3.5" />}
                  label="Plan"
                  value={user.plan}
                />
                <DetailCard
                  icon={<Mail className="w-3.5 h-3.5" />}
                  label="Dostawca"
                  value={user.provider}
                />
                <DetailCard
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Rejestracja"
                  value={formatDate(user.createdAt)}
                />
                <DetailCard
                  icon={<Clock className="w-3.5 h-3.5" />}
                  label="Ostatnia aktualizacja"
                  value={formatDate(user.updatedAt)}
                />
              </div>
              <div className="mt-2 text-[10px] text-on-surface-variant/40 font-mono">
                Firebase UID: {user.id}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Podkomponenty
// ============================================================================

/** Badge roli użytkownika */
function RoleBadge({ role }: { role: string }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-bold text-primary">
        <Crown className="w-3 h-3" />
        Admin Główny
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest border border-border text-[11px] font-bold text-on-surface-variant">
      <UserIcon className="w-3 h-3" />
      Użytkownik
    </span>
  );
}

/** Badge planu subskrypcji */
function PlanBadge({
  plan,
  trialEndsAt,
  planActivatedAt,
}: {
  plan: string;
  trialEndsAt: { toDate?: () => Date } | null;
  planActivatedAt: { toDate?: () => Date } | null;
}) {
  // Oblicz postęp trialu
  const trialProgress = useMemo(() => {
    if (!trialEndsAt?.toDate) return null;
    const ends = trialEndsAt.toDate().getTime();
    const now = Date.now();
    const start = planActivatedAt?.toDate
      ? planActivatedAt.toDate().getTime()
      : ends - 7 * 86400000;
    const total = ends - start;
    const elapsed = now - start;
    return Math.min(Math.max(elapsed / total, 0), 1);
  }, [trialEndsAt, planActivatedAt]);

  const trialDaysLeft = useMemo(() => {
    if (!trialEndsAt?.toDate) return null;
    const ends = trialEndsAt.toDate().getTime();
    const now = Date.now();
    const days = Math.ceil((ends - now) / 86400000);
    return Math.max(days, 0);
  }, [trialEndsAt]);

  // Enterprise
  if (plan === "enterprise") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-bold text-primary">
          <Zap className="w-3 h-3" />
          Pro Enterprise
        </span>
        <span className="text-[10px] text-primary/70 ml-1">
          Dożywotni Dostęp
        </span>
      </div>
    );
  }

  // Pro
  if (plan === "pro") {
    const renewalDate = planActivatedAt?.toDate
      ? new Date(planActivatedAt.toDate().getTime() + 30 * 86400000)
      : null;
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-[11px] font-bold text-primary">
          <Zap className="w-3 h-3" />
          Aktywny Pro
        </span>
        {renewalDate && (
          <span className="text-[10px] text-primary/70 ml-1">
            Odnowa się:{" "}
            {renewalDate.toLocaleDateString("pl-PL", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    );
  }

  // Trial
  if (trialEndsAt && trialDaysLeft !== null && trialDaysLeft > 0) {
    const dayNumber = 7 - trialDaysLeft;
    return (
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-[11px] font-bold text-tertiary">
          <Clock className="w-3 h-3" />
          Okres Próbny
        </span>
        <div className="flex items-center gap-2 ml-1">
          <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-tertiary transition-all"
              style={{ width: `${(1 - (trialProgress ?? 0)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-on-surface-variant/60 whitespace-nowrap">
            Dzień {dayNumber} / 7
          </span>
        </div>
      </div>
    );
  }

  // Free / Wygasły
  if (trialEndsAt && trialDaysLeft !== null && trialDaysLeft <= 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-[11px] font-bold text-secondary">
          <AlertTriangle className="w-3 h-3" />
          Wygasła Subskrypcja
        </span>
        <span className="text-[10px] text-secondary/60 ml-1">
          Błąd obciążenia karty
        </span>
      </div>
    );
  }

  // Free
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest border border-border text-[11px] font-bold text-on-surface-variant/60">
      <UserIcon className="w-3 h-3" />
      Free
    </span>
  );
}

/** Karta szczegółów w rozwinięciu */
function DetailCard({
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
