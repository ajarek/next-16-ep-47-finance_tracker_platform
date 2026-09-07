<!# Next.js: ZAWSZE czytaj dokumentację przed kodowaniem

Zanim zaczniesz pracę z Next.js, znajdź i przeczytaj odpowiednią dokumentację w `node_modules/next/dist/docs/`.
Twoje dane treningowe są nieaktualne — dokumentacja jest źródłem prawdy.

<!-- END:nextjs-agent-rules -->

# Zasady projektu

## Stos

* Next.js 16.3.4 App Router
* React 19
* TypeScript strict mode
* Tailwind CSS v4
* Baza danych i autoryzacja: Firebase

## Styl kodu

* Domyślnie preferuj komponenty serwerowe.
* Używaj komponentów klienckich tylko wtedy, gdy wymagane są API przeglądarki lub interaktywność.
* Używaj akcji serwera zamiast tras API, gdy to możliwe.
* Unikaj `any`.
* Preferuj Zod do walidacji.
* Preferuj shadcn/ui do stylizowania komponentów.
* Preferuj lucide-react do ikon.
* Do animacji i przejść używaj Framer Motion, ale rób to umiejętnie, nie przesadzaj.
* **Ograniczenie języka**: Cały kod, komentarze i opisy muszą być w języku polskim, z wyjątkiem: nazw zmiennych, nazw funkcji, nazw klas i nazw komponentów.
* Zastosuj zmianę trybu ciemnego na jasny w komponencie Navbar.
* Dla widoku mobile zastosuj płynne wysuwane menu z lewej strony ekranu.
* Zastosuj shader WebGL, który generuje subtelne gradienty, siatkę (grid) oraz interaktywny efekt „spotlight” podążający za kursorem.

## Architektura

* Utrzymuj logikę biznesową poza komponentami React.
* Używaj ponownie istniejących komponentów interfejsu użytkownika przed tworzeniem nowych.
* Zachowaj istniejącą strukturę folderów.
* Nie wprowadzaj nowych zależności bez uzasadnienia.
* Twórz przykładowe dane dla każdego typu obiektów w folderze `public/data/`.
* Wygenerowane obrazy umieszczaj w folderze `public/images/`.
* Jeśli usuwasz plik, usuń go fizycznie z dysku. Nie zostawiaj pustych folderów.Usuwaj nieużywane imports w plikach.

# Kontrole jakości

Przed wykonaniem jakiegokolwiek zadania:

1. Uruchom sprawdzanie typów.
2. Uruchom linting.
3. Sprawdź, czy nie występują problemy z hydratacją.
4. Zweryfikuj konwencje App Router.

## Dokumentacja

Podczas modyfikacji architektury:

* Zaktualizuj plik README.md.
* Zaktualizuj plik AGENTS.md, jeśli konwencje projektu ulegną zmianie.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
