/**
 * Serwis Firebase Firestore — operacje CRUD na kolekcjach:
 * - users    (profile użytkowników)
 * - operations (operacje finansowe)
 * - categories (kategorie budżetowe)
 *
 * Wszystkie funkcje są asynchroniczne i zwracają obietnice.
 * Błędy są łagodzone i logowane — nie przerywają działania aplikacji.
 */
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirebaseFirestore } from "@/lib/firebase";
import type {
  FirestoreUser,
  FirestoreOperation,
  FirestoreCategory,
  CreateOperationParams,
  UpdateOperationParams,
  CreateCategoryParams,
  UpdateCategoryParams,
  UserPlan,
} from "@/lib/firestore-types";

// Re-export typów dla wygody importujących
export type {
  FirestoreUser,
  FirestoreOperation,
  FirestoreCategory,
  CreateOperationParams,
  UpdateOperationParams,
  CreateCategoryParams,
  UpdateCategoryParams,
  UserPlan,
} from "@/lib/firestore-types";

// ============================================================================
// Narzędzia pomocnicze
// ============================================================================

/** Zwraca aktualną instancję Firestore */
function db() {
  return getFirebaseFirestore();
}

/** Opakowanie błędu Firestore w czytelny komunikat */
function handleFirestoreError(operation: string, error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Firestore] Błąd podczas ${operation}:`, message);
  throw new Error(`Nie udało się wykonać operacji: ${operation}`);
}

// ============================================================================
// Kolekcja: users
// ============================================================================

/** Domyślne kategorie przypisywane nowemu użytkownikowi */
const DEFAULT_CATEGORIES: CreateCategoryParams[] = [
  { userId: "", name: "Jedzenie & Restauracje", icon: "🍽️", color: "primary", limit: 2000, currency: "PLN", order: 0 },
  { userId: "", name: "Media & Mieszkanie", icon: "🏠", color: "secondary", limit: 3000, currency: "PLN", order: 1 },
  { userId: "", name: "Transport & Podróże", icon: "🚗", color: "tertiary", limit: 1500, currency: "PLN", order: 2 },
  { userId: "", name: "Rozrywka, AI & Streaming", icon: "🎬", color: "primary-fixed", limit: 500, currency: "PLN", order: 3 },
  { userId: "", name: "Zdrowie & Apteka", icon: "💊", color: "secondary-fixed", limit: 800, currency: "PLN", order: 4 },
  { userId: "", name: "Inne Wydatki", icon: "📦", color: "tertiary", limit: 1000, currency: "PLN", order: 5 },
  { userId: "", name: "Przychody", icon: "💰", color: "primary", limit: null, currency: "PLN", order: 6 },
];

/**
 * Tworzy profil użytkownika w Firestore po pierwszym logowaniu.
 * Automatycznie dodaje domyślne kategorie budżetowe.
 */
export async function createUserProfile(
  userId: string,
  data: {
    displayName: string;
    email: string;
    photoURL: string | null;
    provider: "google" | "github" | "email";
  }
): Promise<void> {
  const now = serverTimestamp();
  const userRef = doc(db(), "users", userId);

  // Sprawdź czy profil już istnieje (np. wielokrotne logowanie)
  const existing = await getDoc(userRef);
  if (existing.exists()) {
    // Aktualizuj tylko dane, które mogły się zmienić (np. avatar)
    await updateDoc(userRef, {
      displayName: data.displayName,
      photoURL: data.photoURL,
      updatedAt: now,
    });
    return;
  }

  // Trial 7 dni od teraz
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 7);

  // Utwórz profil użytkownika
  const userData: Record<string, unknown> = {
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    provider: data.provider,
    plan: "free" as UserPlan,
    planActivatedAt: null,
    trialEndsAt: Timestamp.fromDate(trialEndsAt),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(userRef, userData);

  // Utwórz domyślne kategorie budżetowe
  await ensureDefaultCategories(userId);
}

/** Pobiera profil użytkownika z Firestore */
export async function getUserProfile(
  userId: string
): Promise<FirestoreUser | null> {
  const userRef = doc(db(), "users", userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as FirestoreUser;
}

/** Aktualizuje plan użytkownika (subskrypcja / trial) */
export async function updateUserPlan(
  userId: string,
  plan: UserPlan,
  activatedAt?: Date
): Promise<void> {
  const userRef = doc(db(), "users", userId);
  const updateData: Record<string, unknown> = {
    plan,
    updatedAt: serverTimestamp(),
  };

  if (activatedAt) {
    updateData.planActivatedAt = Timestamp.fromDate(activatedAt);

    // Dla planupłatnego: dodaj 30 dni trial
    if (plan !== "free") {
      const trialEnd = new Date(activatedAt);
      trialEnd.setDate(trialEnd.getDate() + 7);
      updateData.trialEndsAt = Timestamp.fromDate(trialEnd);
    }
  }

  await updateDoc(userRef, updateData);
}

/** Nasłuchuje zmian profilu użytkownika w czasie rzeczywistym */
export function onUserSnapshot(
  userId: string,
  callback: (user: FirestoreUser | null) => void
): Unsubscribe {
  const userRef = doc(db(), "users", userId);
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as FirestoreUser);
    } else {
      callback(null);
    }
  });
}

// ============================================================================
// Kolekcja: operations
// ============================================================================

/** Dodaje nową operację finansową do Firestore i aktualizuje spent w kategorii */
export async function createOperation(
  params: CreateOperationParams
): Promise<string> {
  try {
    const opRef = doc(collection(db(), "operations"));
    await setDoc(opRef, {
      userId: params.userId,
      title: params.title,
      amount: params.amount,
      type: params.type,
      category: params.category,
      date: params.date,
      status: params.status,
      notes: params.notes ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Aktualizuj spent w kategorii (zarówno dla wydatków jak i przychodów)
    await adjustCategorySpent(params.userId, params.category, params.amount);

    return opRef.id;
  } catch (error) {
    handleFirestoreError("tworzenia operacji", error);
  }
}

/** Aktualizuje istniejącą operację finansową */
export async function updateOperation(
  operationId: string,
  data: UpdateOperationParams
): Promise<void> {
  try {
    const opRef = doc(db(), "operations", operationId);
    await updateDoc(opRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError("aktualizacji operacji", error);
  }
}

/** Usuwa operację finansową i cofa spent w kategorii */
export async function deleteOperation(
  operationId: string,
  operation?: { type: string; amount: number; category: string; userId: string }
): Promise<void> {
  try {
    const opRef = doc(db(), "operations", operationId);
    await deleteDoc(opRef);

    // Cofnij spent w kategorii jeśli podano dane operacji
    if (operation) {
      await adjustCategorySpent(
        operation.userId,
        operation.category,
        -operation.amount
      );
    }
  } catch (error) {
    handleFirestoreError("usuwania operacji", error);
  }
}

/** Pobiera operacje użytkownika (ostatnie N, domyślnie 50) */
export async function getUserOperations(
  userId: string,
  maxResults = 50
): Promise<FirestoreOperation[]> {
  try {
    const opsRef = collection(db(), "operations");
    const q = query(
      opsRef,
      where("userId", "==", userId),
      orderBy("date", "desc"),
      firestoreLimit(maxResults)
    );

    // Pobranie danych (używamy snapshot.docs zamiast getDocs)
    const { getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FirestoreOperation)
    );
  } catch (error) {
    handleFirestoreError("pobierania operacji", error);
  }
}

/** Nasłuchuje zmian operacji użytkownika w czasie rzeczywistym */
export function onOperationsSnapshot(
  userId: string,
  callback: (operations: FirestoreOperation[]) => void,
  maxResults = 50
): Unsubscribe {
  const opsRef = collection(db(), "operations");
  const q = query(
    opsRef,
    where("userId", "==", userId),
    orderBy("date", "desc"),
    firestoreLimit(maxResults)
  );

  return onSnapshot(q, (snapshot) => {
    const operations = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FirestoreOperation)
    );
    callback(operations);
  });
}

// ============================================================================
// Kolekcja: categories
// ============================================================================

/** Dodaje nową kategorię budżetową */
export async function createCategory(
  userId: string,
  params: CreateCategoryParams
): Promise<string> {
  try {
    const catRef = doc(collection(db(), "categories"));
    await setDoc(catRef, {
      userId,
      name: params.name,
      icon: params.icon,
      color: params.color,
      limit: params.limit ?? null,
      spent: 0,
      currency: params.currency,
      order: params.order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return catRef.id;
  } catch (error) {
    handleFirestoreError("tworzenia kategorii", error);
  }
}

/** Aktualizuje kategorię budżetową */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryParams
): Promise<void> {
  try {
    const catRef = doc(db(), "categories", categoryId);
    await updateDoc(catRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError("aktualizacji kategorii", error);
  }
}

/** Usuwa kategorię budżetową */
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const catRef = doc(db(), "categories", categoryId);
    await deleteDoc(catRef);
  } catch (error) {
    handleFirestoreError("usuwania kategorii", error);
  }
}

/** Pobiera kategorie użytkownika (posortowane wg pola order) */
export async function getUserCategories(
  userId: string
): Promise<FirestoreCategory[]> {
  try {
    const catsRef = collection(db(), "categories");
    const q = query(
      catsRef,
      where("userId", "==", userId),
      orderBy("order", "asc")
    );

    const { getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FirestoreCategory)
    );
  } catch (error) {
    handleFirestoreError("pobierania kategorii", error);
  }
}

/**
 * Aktualizuje pole `spent` w kategorii budżetowej.
 * delta: dodatnie = zwiększ, ujemne = zmniejsz.
 */
async function adjustCategorySpent(
  userId: string,
  categoryName: string,
  delta: number
): Promise<void> {
  try {
    const catsRef = collection(db(), "categories");
    const q = query(
      catsRef,
      where("userId", "==", userId),
      where("name", "==", categoryName),
      firestoreLimit(1)
    );

    const { getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const catDoc = snapshot.docs[0];
      await updateDoc(catDoc.ref, {
        spent: increment(delta),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("[Firestore] Błąd aktualizacji spent w kategorii:", error);
  }
}

/**
 * Przelicza pole `spent` w kategorii na podstawie istniejących operacji.
 * Przydatne do naprawy danych po zmianie logiki.
 */
export async function recalculateCategorySpent(
  userId: string,
  categoryName: string
): Promise<void> {
  try {
    // 1. Pobierz ID kategorii
    const catsRef = collection(db(), "categories");
    const catQuery = query(
      catsRef,
      where("userId", "==", userId),
      where("name", "==", categoryName),
      firestoreLimit(1)
    );

    const { getDocs } = await import("firebase/firestore");
    const catSnapshot = await getDocs(catQuery);

    if (catSnapshot.empty) return;

    const catDoc = catSnapshot.docs[0];

    // 2. Pobierz wszystkie operacje w tej kategorii (zarówno wydatki jak i przychody)
    const opsRef = collection(db(), "operations");
    const opsQuery = query(
      opsRef,
      where("userId", "==", userId),
      where("category", "==", categoryName)
    );

    const opsSnapshot = await getDocs(opsQuery);

    // 3. Sumuj kwoty
    let totalSpent = 0;
    for (const opDoc of opsSnapshot.docs) {
      const data = opDoc.data() as { amount?: number };
      totalSpent += data.amount ?? 0;
    }

    // 4. Aktualizuj kategorię
    await updateDoc(catDoc.ref, {
      spent: totalSpent,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[Firestore] Błąd przeliczania spent:", error);
  }
}

/**
 * Prelicza `spent` dla WSZYSTKICH kategorii użytkownika.
 */
export async function recalculateAllCategoriesSpent(
  userId: string
): Promise<void> {
  try {
    const catsRef = collection(db(), "categories");
    const catQuery = query(
      catsRef,
      where("userId", "==", userId)
    );

    const { getDocs } = await import("firebase/firestore");
    const catSnapshot = await getDocs(catQuery);

    for (const catDoc of catSnapshot.docs) {
      const catData = catDoc.data() as { name: string };
      await recalculateCategorySpent(userId, catData.name);
    }
  } catch (error) {
    console.error("[Firestore] Błąd przeliczania wszystkich kategorii:", error);
  }
}

/**
 * Sprawdza czy użytkownik ma wszystkie domyślne kategorie budżetowe.
 * Brakujące kategorie zostają utworzone (migration dla istniejących użytkowników).
 */
export async function ensureDefaultCategories(
  userId: string
): Promise<void> {
  try {
    const catsRef = collection(db(), "categories");
    const q = query(
      catsRef,
      where("userId", "==", userId)
    );

    const { getDocs } = await import("firebase/firestore");
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Brak kategorii — utwórz wszystkie domyślne
      const batchCategories = DEFAULT_CATEGORIES.map((cat) =>
        createCategory(userId, { ...cat, userId })
      );
      await Promise.all(batchCategories);
      return;
    }

    // Istnieją jakieś kategorie — sprawdź czy brakuje nowych
    const existingNames = new Set(
      snapshot.docs.map((d) => (d.data() as { name: string }).name)
    );

    const missingCategories = DEFAULT_CATEGORIES.filter(
      (cat) => !existingNames.has(cat.name)
    );

    if (missingCategories.length > 0) {
      const batchMissing = missingCategories.map((cat) =>
        createCategory(userId, { ...cat, userId })
      );
      await Promise.all(batchMissing);
    }
  } catch (error) {
    console.error("[Firestore] Błąd sprawdzania kategorii:", error);
  }
}

/** Nasłuchuje zmian kategorii użytkownika w czasie rzeczywistym */
export function onCategoriesSnapshot(
  userId: string,
  callback: (categories: FirestoreCategory[]) => void
): Unsubscribe {
  const catsRef = collection(db(), "categories");
  const q = query(
    catsRef,
    where("userId", "==", userId),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FirestoreCategory)
    );
    callback(categories);
  });
}
