"use client";

import { Check, X, ArrowRight, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface PricingFeature {
  text: string;
  icon: string;
  disabled?: boolean;
  highlight?: boolean;
  subtext?: string;
}

interface PricingPlan {
  id: string;
  category: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  annualNote: string;
  badge: {
    top?: string;
    side?: string;
  } | null;
  ctaLabel: string;
  ctaIcon: string;
  ctaPrimary?: boolean;
  features: PricingFeature[];
}

interface PricingCardsProps {
  plans: PricingPlan[];
  isAnnual: boolean;
  onOpenAuthModal: () => void;
}

/**
 * Trzy karty planów cenowych: Starter, Pro Cloud (wyróżniony) i Enterprise.
 * Każda karta zawiera listę funkcji, cenę i przycisk CTA.
 */
export default function PricingCards({
  plans,
  isAnnual,
  onOpenAuthModal,
}: PricingCardsProps) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {plans.map((plan, index) => {
          const isPro = plan.id === "pro";
          const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{
                y: -12,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className={`relative rounded-3xl p-8 transition-all duration-300 group ${
                isPro
                  ? "glass-panel shadow-[0_0_40px_var(--glow-primary)] border-primary/40 md:-mt-4 md:mb-[-16px] hover:shadow-[0_8px_60px_var(--glow-primary)] hover:border-primary/60"
                  : "glass-panel hover:shadow-[0_8px_48px_rgba(69,239,197,0.15)] hover:border-primary/30"
              }`}
            >
              {/* Poświata hover na całej karcie */}
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-primary/3 transition-all duration-500 pointer-events-none" />

              {/* Subtelna poświata na górnej krawędzi */}
              <div className="absolute top-0 left-8 right-8 h-px bg-linear-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/40 transition-all duration-500" />

              {/* Badge na górze karty (tylko dla Pro) */}
              {plan.badge?.top && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-extrabold uppercase tracking-wider shadow-[0_0_24px_var(--glow-primary)]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {plan.badge.top}
                  </span>
                </div>
              )}

              {/* Badge z prawej strony */}
              {plan.badge?.side && (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/30">
                    {plan.badge.side}
                  </span>
                </div>
              )}

              {/* Kategoria i ikona */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {plan.category}
                </span>
                {isPro ? (
                  <Sparkles className="w-5 h-5 text-primary" />
                ) : plan.id === "enterprise" ? (
                  <Shield className="w-5 h-5 text-on-surface-variant" />
                ) : (
                  <div className="w-5 h-5 rounded-md bg-on-surface-variant/20 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-on-surface-variant">
                      💰
                    </span>
                  </div>
                )}
              </div>

              {/* Nazwa i opis */}
              <h3 className="text-2xl font-extrabold text-on-surface mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                {plan.description}
              </p>

              {/* Cena z efektem hover */}
              <div className="mb-6 group-hover:translate-x-1 transition-transform duration-300">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-on-surface group-hover:text-primary transition-colors duration-300">
                    {price}
                  </span>
                  <span className="text-lg font-semibold text-on-surface-variant">
                    zł / mc
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  {plan.annualNote}
                </p>
              </div>

              {/* Lista funkcji z efektem hover na pozycjach */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIdx) => (
                  <li
                    key={fIdx}
                    className={`flex items-start gap-3 text-sm ${
                      feature.disabled
                        ? "text-on-surface-variant/50"
                        : "text-on-surface"
                    }`}
                  >
                    {feature.disabled ? (
                      <X className="w-4 h-4 mt-0.5 shrink-0 text-on-surface-variant/40" />
                    ) : (
                      <div
                        className={`w-4 h-4 mt-0.5 shrink-0 rounded-full flex items-center justify-center ${
                          feature.highlight
                            ? "bg-primary/20 text-primary"
                            : "bg-on-surface-variant/20 text-on-surface-variant"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <div className="group-hover:translate-x-0.5 transition-transform duration-200">
                      <span>{feature.text}</span>
                      {feature.subtext && (
                        <span className="block text-xs text-on-surface-variant mt-0.5">
                          {feature.subtext}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Przycisk CTA z efektem hover */}
              <button
                onClick={onOpenAuthModal}
                type="button"
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden ${
                  isPro
                    ? "bg-primary hover:bg-primary-hover text-on-primary shadow-[0_0_24px_var(--glow-primary)] hover:shadow-[0_0_48px_var(--glow-primary)] hover:scale-[1.03] active:scale-95"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-border hover:border-primary/40 hover:shadow-[0_0_24px_var(--glow-primary)] hover:scale-[1.03] active:scale-95"
                }`}
              >
                {plan.ctaIcon === "Check" && (
                  <Check className="w-4 h-4" />
                )}
                {plan.ctaIcon === "ArrowRight" && (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{plan.ctaLabel}</span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
