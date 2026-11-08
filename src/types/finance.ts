export type TransactionType = 'revenue' | 'expense';

export type ExpenseCategory = 'driver' | 'fuel' | 'maintenance' | 'other';

export interface BaseTransaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number;
  description?: string;
  createdAt: number;
  isPaid?: boolean; // true = pago / recebido, false = pendente
  paidAt?: string; // Data de liquidação/pagamento
}

export interface RevenueTransaction extends BaseTransaction {
  type: 'revenue';
  tripsCount?: number;
}

export interface ExpenseTransaction extends BaseTransaction {
  type: 'expense';
  category: ExpenseCategory;
  // Specific for driver category:
  driverBaseAmount?: number;
  driverBonusAmount?: number;
  // Optional extras:
  liters?: number;
  km?: number;
  // Installments (Manutenção & Outros):
  isInstallment?: boolean;
  installmentGroupId?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
  totalInstallmentAmount?: number;
}

export type Transaction = RevenueTransaction | ExpenseTransaction;

export interface VehicleConfig {
  model: string;
  plate: string;
  driverName: string;
  defaultDriverDailyRate: number;
}

export interface AuthCredentials {
  username: string;
  password: string;
}


export interface MonthlySummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenueCount: number;
  expenseCount: number;
  expensesByCategory: {
    driver: number;
    fuel: number;
    maintenance: number;
    other: number;
  };
  workingDays: number;
  dailyAverageRevenue: number;
  dailyAverageProfit: number;
  // Paid vs Pending metrics:
  totalExpensesPaid: number;
  totalExpensesPending: number;
  totalRevenueReceived: number;
  totalRevenuePending: number;
  pendingCount: number;
}

export type PeriodFilterMode = 'all' | 'week-1' | 'week-2' | 'week-3' | 'week-4' | 'week-5' | 'custom';

export interface PeriodFilter {
  mode: PeriodFilterMode;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}


