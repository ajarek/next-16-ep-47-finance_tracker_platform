"use client";

import { Rocket, PlayCircle, ShieldCheck, RefreshCw, Lock } from "lucide-react";

interface HeroSectionProps {
  onOpenAuthModal: () => void;
}

/**
 * Główna sekcja Hero z tytułem gradientowym, przyciskami wezwania do działania oraz informacjami o zaufaniu.
 */
export default function HeroSection({ onOpenAuthModal }: HeroSectionProps) {
  return (
    <section className="w-full pt-32 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative overflow-hidden">
      {/* Dynamiczne poświaty tła */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-[140px] pointer-events-none -z-10" />

      {/* Mikro-odznaka technologiczna */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-border backdrop-blur-xl shadow-md mb-8 hover:border-primary/40 transition-colors">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-xs font-bold tracking-wider uppercase text-primary">
          Wersja 2.4 • Next.js 16 & Firebase
        </span>
        <span className="bg-surface-variant/80 text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-semibold border border-border/50">
          Live Cloud Engine
        </span>
      </div>

      {/* Główny nagłówek strony */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-on-surface max-w-5xl tracking-tight leading-[1.1] mb-6">
        Inteligentne zarządzanie finansami{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary-fixed to-tertiary drop-shadow-[0_2px_15px_var(--glow-primary)]">
          nowej generacji
        </span>
      </h1>

      {/* Podtytuł */}
      <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Przejmij pełną kontrolę nad budżetem, oszczędnościami i inwestycjami z
        synchronizacją w czasie rzeczywistym Firebase. Wypróbuj za darmo przez 7
        dni bez zobowiązań.
      </p>

      {/* Przyciski wezwania do działania (CTAs) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-12 z-10">
        <button
          onClick={onOpenAuthModal}
          type="button"
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-base shadow-[0_0_32px_var(--glow-primary)] hover:shadow-[0_0_42px_var(--glow-primary)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Rocket className="w-5 h-5" />
          <span>Rozpocznij 7-dniowy darmowy okres próbny</span>
        </button>

        <a
          href="#dashboard-mockup"
          className="w-full sm:w-auto px-7 py-4 rounded-full bg-surface-container-high/80 hover:bg-surface-container-high text-on-surface font-semibold text-base border border-border backdrop-blur-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5 text-primary" />
          <span>Zobacz demo na żywo</span>
        </a>
      </div>

      {/* Wskaźniki zaufania i standardów */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Brak konieczności podawania karty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Reakcja Firestore poniżej 45ms</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-primary" />
          <span>Szyfrowanie AES-256</span>
        </div>
      </div>
    </section>
  );
}
