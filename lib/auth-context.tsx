"use client";

/**
 * Kontekst autoryzacji Firebase — zarządza stanem zalogowania,
 * profilem użytkownika i operacjami logowania/wylogowania.
 *
 * Udostępnia:
 * - user        (Firebase Auth User lub null)
 * - userProfile (dane profilu z Firestore lub null)
 * - loading     (stan ładowania sesji)
 * - signInWithGoogle()    — logowanie przez Google
 * - signInWithGitHub()    — logowanie przez GitHub
 * - signInWithEmail()     — logowanie e-mailem i hasłem
 * - registerWithEmail()   — rejestracja e-mailem i hasłem
 * - resetPassword()       — reset hasła e-mailem
 * - signOutUser()         — wylogowanie
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from "firebase/auth";

import {
  getFirebaseAuth,
  googleProvider,
  githubProvider,
} from "@/lib/firebase";
import {
  createUserProfile,
  getUserProfile,
  ensureDefaultCategories,
  ensureUserRole,
  type FirestoreUser,
} from "@/lib/firestore";

// ============================================================================
// Typy kontekstu
// ============================================================================

interface AuthContextValue {
  /** Aktualny użytkownik Firebase Auth */
  user: User | null;
  /** Profil użytkownika z Firestore */
  userProfile: FirestoreUser | null;
  /** Czy użytkownik jest administratorem */
  isAdmin: boolean;
  /** Czy trwa ładowanie sesji / profilu */
  loading: boolean;
  /** Logowanie przez Google */
  signInWithGoogle: () => Promise<void>;
  /** Logowanie przez GitHub */
  signInWithGitHub: () => Promise<void>;
  /** Logowanie e-mailem i hasłem */
  signInWithEmail: (email: string, password: string) => Promise<void>;
  /** Rejestracja e-mailem i hasłem */
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  /** Reset hasła (wysyłka e-maila) */
  resetPassword: (email: string) => Promise<void>;
  /** Wylogowanie */
  signOutUser: () => Promise<void>;
}

// ============================================================================
// Kontekst
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Hook do korzystania z kontekstu autoryzacji */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth musi być używane wewnątrz <AuthProvider>");
  }
  return ctx;
}

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // -------------------------------------------------------------------------
  // Nasłuchiwanie zmian stanu auth
  // -------------------------------------------------------------------------
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Użytkownik zalogowany — pobierz lub utwórz profil
        try {
          let profile = await getUserProfile(firebaseUser.uid);

          if (!profile) {
            // Pierwsze logowanie — utwórz profil
            const providerId = firebaseUser.providerData[0]?.providerId ?? "";
            let provider: "google" | "github" | "email" = "email";
            if (providerId.includes("google")) provider = "google";
            else if (providerId.includes("github")) provider = "github";

            await createUserProfile(firebaseUser.uid, {
              displayName:
                firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "Użytkownik",
              email: firebaseUser.email ?? "",
              photoURL: firebaseUser.photoURL,
              provider,
            });

            // Pobierz świeżo utworzony profil
            profile = await getUserProfile(firebaseUser.uid);
          }

          // Upewnij się, że kategorie istnieją (dla istniejących użytkowników)
          await ensureDefaultCategories(firebaseUser.uid);

          // Migruj rolę użytkownika (dla kont bez pola role)
          await ensureUserRole(firebaseUser.uid, firebaseUser.email ?? "");

          setUserProfile(profile);
        } catch (error) {
          console.error("[Auth] Błąd pobierania profilu:", error);
          setUserProfile(null);
        }
      } else {
        // Wylogowany — wyczyść profil
        setUserProfile(null);
      }

      setProfileLoaded(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // Akcje autoryzacyjne
  // -------------------------------------------------------------------------

  /** Logowanie / rejestracja przez Google */
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("[Auth] Błąd logowania Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Logowanie / rejestracja przez GitHub */
  const signInWithGitHub = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, githubProvider);
    } catch (error) {
      console.error("[Auth] Błąd logowania GitHub:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Logowanie e-mailem i hasłem */
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const auth = getFirebaseAuth();
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("[Auth] Błąd logowania e-mail:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Rejestracja e-mailem i hasłem */
  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setLoading(true);
      try {
        const auth = getFirebaseAuth();
        const credential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Firebase Auth nie pozwala ustawić displayName przy rejestracji
        // — robimy to ręcznie
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(credential.user, { displayName });

        // Profil zostanie utworzony automatycznie w onAuthStateChanged
      } catch (error) {
        console.error("[Auth] Błąd rejestracji e-mail:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /** Reset hasła (wysyłka e-maila z linkiem) */
  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  }, []);

  /** Wylogowanie */
  const signOutUser = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("[Auth] Błąd wylogowania:", error);
      throw error;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Wartość kontekstu
  // -------------------------------------------------------------------------

  const value: AuthContextValue = {
    user,
    userProfile,
    isAdmin: userProfile?.role === "admin",
    loading: loading || !profileLoaded,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
