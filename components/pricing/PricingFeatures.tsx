"use client";

import { Cloud, PieChart, Brain, Timer, TrendingDown, Target } from "lucide-react";
import { motion } from "framer-motion";

interface WhyNowFeature {
  icon: string;
  title: string;
  description: string;
  stat: string;
  statIcon: string;
}

interface PricingFeaturesData {
  title: string;
  features: WhyNowFeature[];
}

interface PricingFeaturesProps {
  data: PricingFeaturesData;
}

/**
 * Sekcja "Dlaczego warto zacząć już dziś?" prezentująca trzy kluczowe
 * narzędzia platformy: Firebase Cloud, Wizualny Budżet Neon oraz Autopilot AI.
 */
export default function PricingFeatures({ data }: PricingFeaturesProps) {
  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case "Cloud":
        return <Cloud className="w-7 h-7 text-primary" />;
      case "PieChart":
        return <PieChart className="w-7 h-7 text-tertiary" />;
      case "Brain":
        return <Brain className="w-7 h-7 text-secondary" />;
      default:
        return <Cloud className="w-7 h-7 text-primary" />;
    }
  };

  const getStatIcon = (iconName: string) => {
    switch (iconName) {
      case "Timer":
        return <Timer className="w-3.5 h-3.5" />;
      case "TrendingDown":
        return <TrendingDown className="w-3.5 h-3.5" />;
      case "Target":
        return <Target className="w-3.5 h-3.5" />;
      default:
        return <Timer className="w-3.5 h-3.5" />;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case "Cloud":
        return "bg-primary/20 border-primary/30 text-primary shadow-[0_0_20px_var(--glow-primary)]";
      case "PieChart":
        return "bg-tertiary/20 border-tertiary/30 text-tertiary shadow-[0_0_20px_rgba(255,207,122,0.3)]";
      case "Brain":
        return "bg-secondary/20 border-secondary/30 text-secondary shadow-[0_0_20px_rgba(255,178,184,0.3)]";
      default:
        return "bg-primary/20 border-primary/30 text-primary";
    }
  };

  const getStatColor = (iconName: string) => {
    switch (iconName) {
      case "Timer":
        return "text-primary";
      case "TrendingDown":
        return "text-tertiary";
      case "Target":
        return "text-secondary";
      default:
        return "text-primary";
    }
  };

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-low/40 relative border-t border-b border-border/40">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          DLACZEGO WARTO ZACZĄĆ JUŻ DZI?
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-on-surface tracking-tight mt-3">
          {data.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {data.features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="glass-panel rounded-3xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group cursor-default"
          >
            {/* Ikona */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border group-hover:scale-110 transition-transform ${getIconBg(feature.icon)}`}
            >
              {getFeatureIcon(feature.icon)}
            </div>

            {/* Tytuł i opis */}
            <h3 className="text-xl font-bold text-on-surface mb-3">
              {feature.title}
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              {feature.description}
            </p>

            {/* Statystyka */}
            <div
              className={`flex items-center gap-2 text-xs font-bold ${getStatColor(feature.statIcon)}`}
            >
              {getStatIcon(feature.statIcon)}
              <span>{feature.stat}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
