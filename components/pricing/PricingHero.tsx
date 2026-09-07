"use client";

import { Calendar, Zap } from "lucide-react";

interface PricingHeroProps {
  isAnnual: boolean;
  onToggleBilling: (annual: boolean) => void;
}

/**
 * Sekcja hero strony cennika z gradientowym tytułem,
 * informacją o darmowym okresie próbnym oraz przełącznikiem
 * rozliczeń miesięcznych / rocznych.
 */
export default function PricingHero({
  isAnnual,
  onToggleBilling,
}: PricingHeroProps) {
  return (
    <section className="w-full pt-32 sm:pt-36 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center relative overflow-hidden">
      {/* Dynamiczne poświaty tła */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-[140px] pointer-events-none -z-10" />

      {/* Mikro-odznaka */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/80 border border-border backdrop-blur-xl shadow-md mb-8 hover:border-primary/40 transition-colors">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-xs font-bold tracking-wider uppercase text-primary">
          BEZ RYZYKA • BEZ NATYCHMIASTOWYCH OPŁAT
        </span>
      </div>

      {/* Główny nagłówek */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-on-surface max-w-5xl tracking-tight leading-[1.1] mb-6">
        Wybierz swój plan i zacznij{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-primary-fixed to-tertiary drop-shadow-[0_2px_15px_var(--glow-primary)]">
          7-dniowy darmowy
        </span>{" "}
        okres próbny
      </h1>

      {/* Podtytuł */}
      <p className="text-base sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Uzyskaj pełną kontrolę nad budżetem, wgląd w czasie rzeczywistym dzięki
        Firebase Cloud i inteligentne analizy przepływów pieniężnych.
      </p>

      {/* Przełącznik miesięczny / roczny */}
      <div className="flex items-center gap-3 p-1.5 rounded-full bg-surface-container-high/80 border border-border backdrop-blur-xl shadow-lg">
        <button
          onClick={() => onToggleBilling(false)}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
            !isAnnual
              ? "bg-surface-container-highest text-on-surface shadow-md"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Rozliczenie miesięczne</span>
        </button>
        <button
          onClick={() => onToggleBilling(true)}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer relative ${
            isAnnual
              ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_20px_var(--glow-primary)]"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Rocznie (-20%)</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-primary text-on-primary">
            2 MC GRATIS
          </span>
        </button>
      </div>
    </section>
  );
}
