"use client";

import { useState } from "react";
import { CreditCard, Smartphone, Wallet, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethodOption {
  id: string;
  name: string;
  description: string;
}

interface PaymentMethodProps {
  methods: PaymentMethodOption[];
  onActivateTrial: () => void;
}

/**
 * Komponent wyboru metody autoryzacji płatności z opcjami
 * BLIK, Karta oraz Google/Apple Pay, a także uproszczonym
 * formularzem wprowadzania danych karty.
 */
export default function PaymentMethod({
  methods,
  onActivateTrial,
}: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState("blik");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case "blik":
        return <Smartphone className="w-5 h-5" />;
      case "card":
        return <CreditCard className="w-5 h-5" />;
      case "wallet":
        return <Wallet className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl p-8 sm:p-10 shadow-xl"
        >
          {/* Nagłówek */}
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">
            WYBIERZ METODĘ AUTORYZACJI:
          </h3>

          {/* Wybór metody */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                type="button"
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedMethod === method.id
                    ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_var(--glow-primary)]"
                    : "bg-surface-container-high/50 border-border text-on-surface-variant hover:border-primary/20 hover:text-on-surface"
                }`}
              >
                {getMethodIcon(method.id)}
                <span className="text-sm font-bold">{method.name}</span>
                {method.description && (
                  <span className="text-[10px] font-semibold opacity-70">
                    {method.description}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Formularz karty (wyświetlany zawsze, ale z interactiveness dla karty) */}
          <div className="space-y-4 mb-8">
            {/* Numer karty */}
            <div className="relative">
              <input
                type="text"
                placeholder="Numer karty lub kod BLIK"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-surface-container-high/60 border border-border text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium focus:outline-none focus:border-primary/50 focus:shadow-[0_0_16px_var(--glow-primary)] transition-all"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
            </div>

            {/* MM/RR i CVV */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM / RR"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="px-5 py-3.5 rounded-2xl bg-surface-container-high/60 border border-border text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium focus:outline-none focus:border-primary/50 focus:shadow-[0_0_16px_var(--glow-primary)] transition-all"
              />
              <input
                type="text"
                placeholder="CVV / CVC"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="px-5 py-3.5 rounded-2xl bg-surface-container-high/60 border border-border text-on-surface placeholder:text-on-surface-variant/50 text-sm font-medium focus:outline-none focus:border-primary/50 focus:shadow-[0_0_16px_var(--glow-primary)] transition-all"
              />
            </div>
          </div>

          {/* Przycisk aktywacji */}
          <button
            onClick={onActivateTrial}
            type="button"
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-on-primary font-extrabold text-base shadow-[0_0_32px_var(--glow-primary)] hover:shadow-[0_0_48px_var(--glow-primary)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span className="text-lg">🚀</span>
            <span>Aktywuj okres próbny (0 zł)</span>
          </button>

          {/* Notatka prawna */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-4 leading-relaxed">
            Klikając przycisk, akceptujesz{" "}
            <span className="text-primary font-semibold cursor-pointer hover:underline">
              Regulamin
            </span>{" "}
            i potwierdzasz autoryzację zerową kwotą.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
