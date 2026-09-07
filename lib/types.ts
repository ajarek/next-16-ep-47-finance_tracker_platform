/**
 * Typy danych wykorzystywane w module finansowym Finance Tracker.
 */

export interface MetricItem {
  amount: number;
  currency: string;
  percentageChange?: number;
  period?: string;
  status?: string;
  trend?: "up" | "down" | "stable";
}

export interface FinanceMetrics {
  totalIncome: MetricItem;
  currentExpenses: MetricItem;
  netProfit: MetricItem;
}

export interface BalanceOverview {
  amount: number;
  currency: string;
  status: string;
  inflows: number;
  outflows: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  currency: string;
  percentage: number;
  color: "primary" | "secondary" | "tertiary" | "primary-fixed" | "secondary-fixed";
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  status: string;
}

export interface FeatureCardData {
  id: string;
  icon: string;
  color: string;
  title: string;
  description: string;
  cta: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
  active?: boolean;
}
