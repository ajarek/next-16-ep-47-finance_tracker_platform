# Finance Tracker Platform

Nowoczesna platforma do inteligentnego zarządzania finansami osobistymi, budżetem i inwestycjami z synchronizacją w czasie rzeczywistym Firebase.

## Stos technologiczny

- **Framework**: Next.js 16.3.4 (App Router, Turbopack)
- **UI / Biblioteka**: React 19, Tailwind CSS v4
- **Typowanie**: TypeScript (strict mode)
- **Animacje**: Framer Motion
- **Ikony**: Lucide React
- **Efekty wizualne**: WebGL Shader (gradienty, siatka proceduralna, spotlight śledzący kursor)
- **Baza danych i uwierzytelnianie**: Firebase (Firestore & Firebase Auth)

## Architektura i struktura projektu

```
├── app/
│   ├── globals.css           # Zmienne semantyczne motywu (jasny / ciemny) i style bazowe Tailwind v4
│   ├── layout.tsx            # Główny layout z fontem Plus Jakarta Sans i metadanymi SEO
│   └── page.tsx              # Server Component zasilający stronę główną danymi z public/data
├── components/
│   ├── AuthModal.tsx         # Modal rejestracji i darmowego 7-dniowego okresu próbnego
│   ├── AuthSection.tsx       # Sekcja szybkiej rejestracji z logowaniem społecznościowym
│   ├── DashboardMockup.tsx   # Szklany panel pulpitu finansowego (statystyki na żywo, wykres pierścieniowy, paski budżetu)
│   ├── FeaturesSection.tsx   # Sekcja kart funkcji platformy i gotowości na skalowanie
│   ├── Footer.tsx            # Stopka z certyfikatami i linkami prawnymi
│   ├── HeroSection.tsx       # Sekcja powitalna z nagłówkiem gradientowym i przyciskami CTA
│   ├── LandingPageContent.tsx# Główny kontener kliencki zarządzający stanem modali i transakcji
│   ├── MobileMenu.tsx        # Płynne menu wysuwane z lewej krawędzi ekranu
│   ├── Navbar.tsx            # Pasek nawigacyjny z logo, statusem Firebase Live i przełącznikiem motywu
│   ├── ThemeToggle.tsx       # Przełącznik motywu ciemny / jasny (odporny na błędy hydratacji)
│   ├── TransactionModal.tsx  # Modal dodawania nowej transakcji z natychmiastową synchronizacją
│   └── WebGlBackground.tsx   # Interaktywny shader WebGL w tle
├── lib/
│   ├── types.ts              # Interfejsy TypeScript modeli danych
│   └── utils.ts              # Narzędzia pomocnicze (formatowanie walut, łączenie klas cn)
└── public/
    └── data/
        ├── features.json      # Dane sekcji funkcji
        ├── mock-finances.json # Przykładowe metryki, kategorie i transakcje
        └── navigation.json    # Dane linków nawigacyjnych
```

## Uruchomienie lokalne

```bash
# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev

# Sprawdzanie typów TypeScript
npx tsc --noEmit

# Linting kodu
npm run lint

# Budowanie wersji produkcyjnej
npm run build
```
