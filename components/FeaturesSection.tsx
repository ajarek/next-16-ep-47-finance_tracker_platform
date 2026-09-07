"use client";

import { Zap, Brain, ShieldCheck, ArrowRight, Gauge } from "lucide-react";
import type { FeatureCardData } from "@/lib/types";

interface FeaturesSectionProps {
  features: FeatureCardData[];
  onOpenAuthModal: () => void;
}

/**
 * Sekcja prezentująca główne możliwości i atuty platformy Finance Tracker.
 */
export default function FeaturesSection({
  features,
  onOpenAuthModal,
}: FeaturesSectionProps) {
  // Mapowanie ikon z lucide-react
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-8 h-8 text-primary" />;
      case "Brain":
        return <Brain className="w-8 h-8 text-tertiary" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-8 h-8 text-secondary" />;
      default:
        return <Zap className="w-8 h-8 text-primary" />;
    }
  };

  const getCardThemeClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          iconBg: "bg-primary/20 border border-primary/30 text-primary shadow-[0_0_20px_var(--glow-primary)]",
          glowHover: "hover:border-primary/50 hover:shadow-[0_16px_40px_rgba(69,239,197,0.2)]",
          linkText: "text-primary hover:text-primary-hover",
        };
      case "tertiary":
        return {
          iconBg: "bg-tertiary/20 border border-tertiary/30 text-tertiary shadow-[0_0_20px_rgba(255,207,122,0.3)]",
          glowHover: "hover:border-tertiary/50 hover:shadow-[0_16px_40px_rgba(255,207,122,0.2)]",
          linkText: "text-tertiary hover:opacity-90",
        };
      case "secondary":
        return {
          iconBg: "bg-secondary/20 border border-secondary/30 text-secondary shadow-[0_0_20px_rgba(255,178,184,0.3)]",
          glowHover: "hover:border-secondary/50 hover:shadow-[0_16px_40px_rgba(255,178,184,0.2)]",
          linkText: "text-secondary hover:opacity-90",
        };
      default:
        return {
          iconBg: "bg-primary/20 border border-primary/30 text-primary",
          glowHover: "hover:border-primary/50",
          linkText: "text-primary",
        };
    }
  };

  return (
    <section
      id="funkcje"
      className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low/40 relative border-t border-b border-border/40 scroll-mt-24"
    >
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Dlaczego Finance Tracker
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-3">
          Potęga chmury i algorytmów w Twoim portfelu
        </h2>
        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mt-4 font-normal">
          Stworzony w oparciu o architekturę serverless Next.js 16 oraz Firebase,
          zapewniający niezrównaną płynność analiz.
        </p>
      </div>

      {/* Siatka 3 kart funkcyjnych */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((feature) => {
          const theme = getCardThemeClasses(feature.color);

          return (
            <div
              key={feature.id}
              className={`rounded-3xl glass-panel p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group cursor-default ${theme.glowHover}`}
            >
              {/* Ikona w zaokrąglonym pojemniku */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${theme.iconBg}`}
              >
                {getFeatureIcon(feature.icon)}
              </div>

              {/* Tytuł i opis */}
              <h3 className="text-xl font-bold text-on-surface mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>

              {/* Link CTA karty */}
              <div
                onClick={onOpenAuthModal}
                className={`mt-8 pt-2 flex items-center gap-2 text-xs font-bold cursor-pointer ${theme.linkText}`}
              >
                <span>{feature.cta}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pasek interaktywny / dowód skalowania (Editorial strip) */}
      <div className="max-w-6xl mx-auto mt-12 rounded-2xl bg-surface-container-lowest/80 border border-border p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-[0_0_15px_var(--glow-primary)]">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-on-surface">
              Gotowy na natychmiastowe skalowanie?
            </h4>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Next.js 16 Turbopack i Edge Runtime zapewniają błyskawiczne renderowanie każdego widoku.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          type="button"
          className="px-6 py-3 rounded-full bg-surface-container-high hover:bg-surface-bright border border-border text-primary font-bold text-sm transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
        >
          Przetestuj za darmo →
        </button>
      </div>
    </section>
  );
}
