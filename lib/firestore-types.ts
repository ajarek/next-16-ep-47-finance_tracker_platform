/**
 * Typy danych dla kolekcji Firebase Firestore.
 *
 * Struktura kolekcji:
 *
 * users/{userId}
 *   ├── displayName: string
 *   ├── email: string
 *   ├── photoURL: string | null
 *   ├── provider: "google" | "github" | "email"
 *   ├── plan: UserPlan
 *   ├── planActivatedAt: Timestamp | null
 *   ├── trialEndsAt: Timestamp | null
 *   ├── createdAt: Timestamp
 *   └── updatedAt: Timestamp
 *
 * operations/{operationId}
 *   ├── userId: string
 *   ├── title: string
 *   ├── amount: number
 *   ├── type: "income" | "expense"
 *   ├── category: string
 *   ├── date: Timestamp
 *   ├── status: "pending" | "completed" | "cancelled"
 *   ├── notes: string | null
 *   ├── createdAt: Timestamp
 *   └── updatedAt: Timestamp
 *
 * categories/{categoryId}
 *   ├── userId: string
 *   ├── name: string
 *   ├── icon: string
 *   ├── color: string
 *   ├── limit: number | null
 *   ├── spent: number
 *   ├── currency: string
 *   ├── order: number
 *   ├── createdAt: Timestamp
 *   └── updatedAt: Timestamp
 */

import { type Timestamp } from "firebase/firestore";

/** Dostępne plany użytkownika */
export type UserPlan = "free" | "starter" | "pro" | "enterprise";

/** Typ statusu operacji finansowej */
export type OperationStatus = "pending" | "completed" | "cancelled";

/** Typ operacji finansowej */
export type OperationType = "income" | "expense";

/** Dokument użytkownika w Firestore */
export interface FirestoreUser {
  /** Jednoznaczny identyfikator Firebase Auth */
  id: string;
  /** Wyświetlana nazwa użytkownika */
  displayName: string;
  /** Adres e-mail */
  email: string;
  /** URL avatara (z dostawcy OAuth lub domyślny) */
  photoURL: string | null;
  /** Dostawca uwierzytelniania */
  provider: "google" | "github" | "email";
  /** Aktualny plan subskrypcji */
  plan: UserPlan;
  /** Data aktywacji planu (null dla planu free) */
  planActivatedAt: Timestamp | null;
  /** Data końca okresu próbnego */
  trialEndsAt: Timestamp | null;
  /** Data utworzenia konta */
  createdAt: Timestamp;
  /** Data ostatniej aktualizacji */
  updatedAt: Timestamp;
}

/** Dokument operacji finansowej w Firestore */
export interface FirestoreOperation {
  /** Jednoznaczny identyfikator dokumentu */
  id: string;
  /** ID użytkownika właściciela operacji */
  userId: string;
  /** Tytuł/opis operacji */
  title: string;
  /** Kwota w PLN */
  amount: number;
  /** Typ: przychód lub wydatek */
  type: OperationType;
  /** Kategoria operacji */
  category: string;
  /** Data operacji */
  date: Timestamp;
  /** Status realizacji */
  status: OperationStatus;
  /** Opcjonalne notatki */
  notes: string | null;
  /** Data utworzenia */
  createdAt: Timestamp;
  /** Data ostatniej aktualizacji */
  updatedAt: Timestamp;
}

/** Dokument kategorii budżetowej w Firestore */
export interface FirestoreCategory {
  /** Jednoznaczny identyfikator dokumentu */
  id: string;
  /** ID użytkownika właściciela kategorii */
  userId: string;
  /** Nazwa kategorii */
  name: string;
  /** Ikona kategorii (emoji lub nazwa ikony Lucide) */
  icon: string;
  /** Kolor kategorii */
  color: string;
  /** Miesięczny limit budżetowy (null = brak limitu) */
  limit: number | null;
  /** Wydana kwota w bieżącym miesiącu */
  spent: number;
  /** Waluta */
  currency: string;
  /** Kolejność wyświetlania */
  order: number;
  /** Data utworzenia */
  createdAt: Timestamp;
  /** Data ostatniej aktualizacji */
  updatedAt: Timestamp;
}

/** Parametry tworzenia nowej operacji (bez pól generowanych automatycznie) */
export type CreateOperationParams = Omit<
  FirestoreOperation,
  "id" | "createdAt" | "updatedAt"
>;

/** Parametry aktualizacji operacji */
export type UpdateOperationParams = Partial<
  Omit<FirestoreOperation, "id" | "userId" | "createdAt">
>;

/** Parametry tworzenia nowej kategorii */
export type CreateCategoryParams = Omit<
  FirestoreCategory,
  "id" | "spent" | "createdAt" | "updatedAt"
>;

/** Parametry aktualizacji kategorii */
export type UpdateCategoryParams = Partial<
  Omit<FirestoreCategory, "id" | "userId" | "createdAt">
>;
