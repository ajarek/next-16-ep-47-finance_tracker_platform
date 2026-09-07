"use client";

import { Shield, Bell, PhoneOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface TrialStep {
  number: number;
  label: string;
  price: string;
  description: string;
}

interface SecurityNote {
  icon: string;
  text: string;
}

interface TrialActivationData {
  title: string;
  selectedPlan: string;
  steps: TrialStep[];
  securityNotes: SecurityNote[];
}

interface TrialActivationProps {
  data: TrialActivationData;
}

/**
 * Podsumowanie aktywacji okresu próbnego z wizualną osią czasu,
 * dwoma etapami (dziś + po 7 dniach) oraz informacjami o bezpieczeństwie.
 */
export default function TrialActivation({ data }: TrialActivationProps) {
  const getSecurityIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield":
        return <Shield className="w-3.5 h-3.5 text-primary" />;
      case "Bell":
        return <Bell className="w-3.5 h-3.5 text-primary" />;
      case "PhoneOff":
        return <PhoneOff className="w-3.5 h-3.5 text-primary" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-primary" />;
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl p-8 sm:p-10 shadow-xl"
        >
          {/* Nagłówek sekcji */}
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
              {data.title}
            </h2>
          </div>

          {/* Wybrany pakiet */}
          <p className="text-sm text-on-surface-variant mb-8">
            Wybrany pakiet:{" "}
            <span className="text-primary font-bold">{data.selectedPlan}</span>
          </p>

          {/* Oś czasu z dwoma etapami */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8">
            {data.steps.map((step, idx) => (
              <div
                key={step.number}
                className={`flex-1 rounded-2xl p-6 border transition-all duration-300 ${
                  idx === 0
                    ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_var(--glow-primary)]"
                    : "bg-surface-container-high/50 border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      idx === 0
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {step.label}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-extrabold text-on-surface">
                    {step.price}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Notatki bezpieczeństwa */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-on-surface-variant">
            {data.securityNotes.map((note, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {getSecurityIcon(note.icon)}
                <span>{note.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
