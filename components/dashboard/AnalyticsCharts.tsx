"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart"
import type { FirestoreOperation } from "@/lib/firestore-types"

interface AnalyticsChartsProps {
  operations: FirestoreOperation[]
}

// Paleta kolorów dla kategorii
const CATEGORY_COLORS: Record<string, string> = {
  "Jedzenie & Restauracje": "#45efc5",
  "Media & Mieszkanie": "#ffb2b8",
  "Transport & Podróże": "#ffcf7a",
  "Rozrywka, AI & Streaming": "#a78bfa",
  "Zdrowie & Apteka": "#fda4af",
  "Inne Wydatki": "#67e8f9",
  "Przychody": "#4ade80",
}

const FALLBACK_COLORS = ["#45efc5", "#ffb2b8", "#ffcf7a", "#a78bfa", "#fda4af", "#67e8f9", "#4ade80", "#c084fc"]

// Nazwy miesięcy po polsku
const MONTH_NAMES = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"]

/**
 * Komponent wykresów analitycznych.
 * Generuje 4 wykresy na podstawie operacji z Firestore:
 * 1. Wydatki wg kategorii (kołowy)
 * 2. Przychody vs Wydatki miesięcznie (słupkowy)
 * 3. Podsumowanie roczne ( słupkowy)
 * 4. Trend salda (area)
 */
export default function AnalyticsCharts({ operations }: AnalyticsChartsProps) {
  // ==========================================================================
  // 1. Wydatki wg kategorii — dane do wykresu kołowego
  // ==========================================================================
  const expenseByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const op of operations) {
      if (op.type === "expense") {
        map.set(op.category, (map.get(op.category) ?? 0) + op.amount)
      }
    }
    return Array.from(map.entries())
      .map(([name, value], i) => ({
        name,
        value: Math.round(value * 100) / 100,
        fill: CATEGORY_COLORS[name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
  }, [operations])

  const expensePieConfig: ChartConfig = Object.fromEntries(
    expenseByCategory.map((item) => [
      item.name,
      { label: item.name, color: item.fill },
    ])
  )

  // ==========================================================================
  // 2. Przychody vs Wydatki miesięcznie — dane do wykresu słupkowego
  // ==========================================================================
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const op of operations) {
      const date = op.date?.toDate?.() ?? new Date(op.date as unknown as string)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const entry = map.get(key) ?? { income: 0, expense: 0 }
      if (op.type === "income") entry.income += op.amount
      else entry.expense += op.amount
      map.set(key, entry)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Ostatnie 12 miesięcy
      .map(([key, data]) => {
        const [year, month] = key.split("-")
        return {
          month: `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year.slice(2)}`,
          przychody: Math.round(data.income * 100) / 100,
          wydatki: Math.round(data.expense * 100) / 100,
        }
      })
  }, [operations])

  const monthlyBarConfig: ChartConfig = {
    przychody: { label: "Przychody", color: "#45efc5" },
    wydatki: { label: "Wydatki", color: "#ffb2b8" },
  }

  // ==========================================================================
  // 3. Podsumowanie roczne — dane do wykresu słupkowego
  // ==========================================================================
  const yearlyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>()
    for (const op of operations) {
      const date = op.date?.toDate?.() ?? new Date(op.date as unknown as string)
      const year = String(date.getFullYear())
      const entry = map.get(year) ?? { income: 0, expense: 0 }
      if (op.type === "income") entry.income += op.amount
      else entry.expense += op.amount
      map.set(year, entry)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-5) // Ostatnie 5 lat
      .map(([year, data]) => ({
        rok: year,
        przychody: Math.round(data.income * 100) / 100,
        wydatki: Math.round(data.expense * 100) / 100,
        zysk: Math.round((data.income - data.expense) * 100) / 100,
      }))
  }, [operations])

  const yearlyBarConfig: ChartConfig = {
    przychody: { label: "Przychody", color: "#45efc5" },
    wydatki: { label: "Wydatki", color: "#ffb2b8" },
    zysk: { label: "Zysk netto", color: "#a78bfa" },
  }

  // ==========================================================================
  // 4. Trend salda — dane do wykresu liniowego (kumulatywne saldo)
  // ==========================================================================
  const balanceTrendData = useMemo(() => {
    const sorted = [...operations].sort((a, b) => {
      const da = a.date?.toDate?.() ?? new Date(a.date as unknown as string)
      const db = b.date?.toDate?.() ?? new Date(b.date as unknown as string)
      return da.getTime() - db.getTime()
    })

    // Buduj kumulatywne saldo za pomocą reduce
    return sorted.reduce<{ saldo: number; result: { data: string; saldo: number; przychody: number; wydatki: number }[] }>(
      (acc, op) => {
        const date = op.date?.toDate?.() ?? new Date(op.date as unknown as string)
        const delta = op.type === "income" ? op.amount : -op.amount
        const newSaldo = acc.saldo + delta
        acc.result.push({
          data: `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`,
          saldo: Math.round(newSaldo * 100) / 100,
          przychody: op.type === "income" ? op.amount : 0,
          wydatki: op.type === "expense" ? op.amount : 0,
        })
        return { saldo: newSaldo, result: acc.result }
      },
      { saldo: 0, result: [] }
    ).result
  }, [operations])

  const balanceTrendConfig: ChartConfig = {
    saldo: { label: "Saldo", color: "#45efc5" },
  }

  // Brak danych
  if (operations.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <BarChart3Placeholder className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
        <h3 className="text-lg font-bold text-on-surface">Brak danych do analizy</h3>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Dodaj kilka transakcji, aby zobaczyć wykresy analityczne generowane
          w czasie rzeczywistym z danych Firestore.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek sekcji */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Analityka finansowa</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Dane z {operations.length} operacji • Aktualizacja w czasie rzeczywistym
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Wiersz 1: Wykres kołowy wydatków + Trend salda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wykres kołowy: Wydatki wg kategorii */}
        <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-sm font-bold text-on-surface mb-1">Wydatki wg kategorii</h4>
          <p className="text-xs text-on-surface-variant mb-4">Rozkład wydatków na kategorie budżetowe</p>
          <ChartContainer config={expensePieConfig} className="h-70 w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString("pl-PL")} PLN`}
                  />
                }
              />
              <Pie
                data={expenseByCategory}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                strokeWidth={2}
                stroke="hsl(var(--background))"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ChartContainer>
        </div>

        {/* Wykres liniowy: Trend salda */}
        <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-sm font-bold text-on-surface mb-1">Trend salda</h4>
          <p className="text-xs text-on-surface-variant mb-4">Kumulatywne saldo na przestrzeni czasu</p>
          <ChartContainer config={balanceTrendConfig} className="h-70 w-full">
            <AreaChart data={balanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="data"
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toLocaleString("pl-PL")}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString("pl-PL")} PLN`}
                  />
                }
              />
              <defs>
                <linearGradient id="saldoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#45efc5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#45efc5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#45efc5"
                strokeWidth={2}
                fill="url(#saldoGradient)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>

      {/* Wiersz 2: Słupkowy miesięczny + Roczny */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wykres słupkowy: Przychody vs Wydatki miesięcznie */}
        <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-sm font-bold text-on-surface mb-1">Przychody vs Wydatki</h4>
          <p className="text-xs text-on-surface-variant mb-4">Porównanie miesięczne (ostatnie 12 mies.)</p>
          <ChartContainer config={monthlyBarConfig} className="h-70 w-full">
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toLocaleString("pl-PL")}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString("pl-PL")} PLN`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="przychody" fill="#45efc5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wydatki" fill="#ffb2b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Wykres słupkowy: Podsumowanie roczne */}
        <div className="bg-surface-container-high/50 border border-border rounded-2xl p-6 backdrop-blur-xl">
          <h4 className="text-sm font-bold text-on-surface mb-1">Podsumowanie roczne</h4>
          <p className="text-xs text-on-surface-variant mb-4">Przychody, wydatki i zysk netto wg lat</p>
          <ChartContainer config={yearlyBarConfig} className="h-70 w-full">
            <BarChart data={yearlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="rok"
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--on-surface-variant)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toLocaleString("pl-PL")}`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString("pl-PL")} PLN`}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="przychody" fill="#45efc5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wydatki" fill="#ffb2b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="zysk" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Wiersz 3: Podsumowanie statystyczne */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const totalIncome = operations.filter((o) => o.type === "income").reduce((s, o) => s + o.amount, 0)
          const totalExpense = operations.filter((o) => o.type === "expense").reduce((s, o) => s + o.amount, 0)
          const avgMonthlyExpense = monthlyData.length > 0
            ? monthlyData.reduce((s, m) => s + m.wydatki, 0) / monthlyData.length
            : 0
          const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

          const stats = [
            { label: "Łączne przychody", value: totalIncome, color: "text-primary" },
            { label: "Łączne wydatki", value: totalExpense, color: "text-secondary" },
            { label: "Śr. mies. wydatki", value: avgMonthlyExpense, color: "text-tertiary" },
            { label: "Stopa oszczędności", value: null, displayValue: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 0 ? "text-primary" : "text-secondary" },
          ]

          return stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-container-high/50 border border-border rounded-2xl p-4 backdrop-blur-xl"
            >
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                {stat.label}
              </span>
              <p className={`text-xl font-extrabold mt-1 ${stat.color}`}>
                {stat.displayValue ?? `${stat.value?.toLocaleString("pl-PL")} PLN`}
              </p>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

/** Placeholder ikony BarChart3 */
function BarChart3Placeholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}
