import React, { useState, useMemo, useEffect } from 'react';
import { 
  Transaction, 
  VehicleConfig, 
  MonthlySummary, 
  RevenueTransaction, 
  ExpenseTransaction,
  PeriodFilter,
  AuthCredentials 
} from './types/finance';
import { 
  loadTransactions, 
  saveTransactions, 
  loadVehicleConfig, 
  saveVehicleConfig, 
  getInitialTransactions,
  getInstallmentDate,
  loadAuthCredentials,
  saveAuthCredentials
} from './utils/storage';
import {
  fetchTransactions,
  upsertTransactionsSupabase,
  deleteTransactionSupabase,
  deleteTransactionGroupSupabase,
  fetchVehicleConfig,
  saveVehicleConfigSupabase,
  fetchAuthCredentials,
  saveAuthCredentialsSupabase,
} from './lib/dataService';
import { isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { PeriodFilterBar } from './components/PeriodFilterBar';
import { MetricCards } from './components/MetricCard';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionsList } from './components/TransactionsList';
import { RevenueModal } from './components/RevenueModal';
import { ExpenseModal } from './components/ExpenseModal';
import { VehicleSettingsModal } from './components/VehicleSettingsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { LoginScreen } from './components/LoginScreen';
import { Car, Cloud, HardDrive, RefreshCw } from 'lucide-react';

const STORAGE_KEY_AUTH = 'autogestao_auth_session';

export default function App() {
  // Configured login credentials (stored in localStorage/Supabase, default Arthur / Arthurfiorino)
  const [credentials, setCredentials] = useState<AuthCredentials>(() => loadAuthCredentials());

  // Authentication state (persisted in sessionStorage for security per browser session)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  // Current selected month & year (default to current calendar month)
  const [currentYear, setCurrentYear] = useState<number>(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => new Date().getMonth() + 1);

  // Period filter within the month (all | week-1..5 | custom date range)
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({ mode: 'all' });

  // Transactions & Config state
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig>(() => loadVehicleConfig());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modal visibility and editing states
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const [editingRevenue, setEditingRevenue] = useState<RevenueTransaction | null>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseTransaction | null>(null);

  // Load from Supabase on component mount
  useEffect(() => {
    let isMounted = true;
    async function initSupabaseData() {
      setIsSyncing(true);
      try {
        const [cloudCreds, cloudConfig, cloudTransactions] = await Promise.all([
          fetchAuthCredentials(),
          fetchVehicleConfig(),
          fetchTransactions(),
        ]);
        if (isMounted) {
          setCredentials(cloudCreds);
          setVehicleConfig(cloudConfig);
          setTransactions(cloudTransactions);
        }
      } catch (err) {
        console.error('Erro na inicialização de dados:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }
    initSupabaseData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync transactions to localStorage on update as fallback
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Sync vehicleConfig to localStorage on update as fallback
  useEffect(() => {
    saveVehicleConfig(vehicleConfig);
  }, [vehicleConfig]);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
  };

  const handleSaveCredentials = async (newCreds: AuthCredentials) => {
    setCredentials(newCreds);
    saveAuthCredentials(newCreds);
    await saveAuthCredentialsSupabase(newCreds);
  };

  const handleSaveConfig = async (newConfig: VehicleConfig) => {
    setVehicleConfig(newConfig);
    saveVehicleConfig(newConfig);
    await saveVehicleConfigSupabase(newConfig);
  };

  // Filter transactions for current selected month & year
  const monthTransactions = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(monthPrefix));
  }, [transactions, currentYear, currentMonth]);

  // Filter within month by week or custom period
  const displayTransactions = useMemo(() => {
    if (periodFilter.mode === 'all') {
      return monthTransactions;
    }
    const { startDate, endDate } = periodFilter;
    if (!startDate || !endDate) {
      return monthTransactions;
    }
    return monthTransactions.filter((t) => t.date >= startDate && t.date <= endDate);
  }, [monthTransactions, periodFilter]);

  // Compute summary based on the active period (full month or filtered week/period)
  const summary: MonthlySummary = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let revenueCount = 0;
    let expenseCount = 0;
    let totalExpensesPaid = 0;
    let totalExpensesPending = 0;
    let totalRevenueReceived = 0;
    let totalRevenuePending = 0;
    let pendingCount = 0;
    const workingDaysSet = new Set<string>();

    const expensesByCategory = {
      driver: 0,
      fuel: 0,
      maintenance: 0,
      other: 0,
    };

    displayTransactions.forEach((t) => {
      const isPaid = t.isPaid !== false; // Default true if undefined
      if (t.type === 'revenue') {
        totalRevenue += t.amount;
        revenueCount += 1;
        if (isPaid) {
          totalRevenueReceived += t.amount;
        } else {
          totalRevenuePending += t.amount;
          pendingCount += 1;
        }
        workingDaysSet.add(t.date);
      } else {
        totalExpenses += t.amount;
        expenseCount += 1;
        if (isPaid) {
          totalExpensesPaid += t.amount;
        } else {
          totalExpensesPending += t.amount;
          pendingCount += 1;
        }
        if (t.category in expensesByCategory) {
          expensesByCategory[t.category] += t.amount;
        }
        if (t.category === 'driver') {
          workingDaysSet.add(t.date);
        }
      }
    });

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const workingDays = workingDaysSet.size;
    const dailyAverageRevenue = workingDays > 0 ? totalRevenue / workingDays : 0;
    const dailyAverageProfit = workingDays > 0 ? netProfit / workingDays : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      revenueCount,
      expenseCount,
      expensesByCategory,
      workingDays,
      dailyAverageRevenue,
      dailyAverageProfit,
      totalExpensesPaid,
      totalExpensesPending,
      totalRevenueReceived,
      totalRevenuePending,
      pendingCount,
    };
  }, [displayTransactions]);

  // Handle month change (resets period filter to full month)
  const handleChangeMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setPeriodFilter({ mode: 'all' });
  };

  // Add or update revenue
  const handleSaveRevenue = async (
    data: Omit<RevenueTransaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      let updatedTransaction: RevenueTransaction | null = null;
      setTransactions((prev) =>
        prev.map((item) => {
          if (item.id === editingId) {
            updatedTransaction = { ...item, ...data } as RevenueTransaction;
            return updatedTransaction;
          }
          return item;
        })
      );
      if (updatedTransaction) {
        await upsertTransactionsSupabase([updatedTransaction]);
      }
    } else {
      const newTransaction: RevenueTransaction = {
        ...data,
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);
      await upsertTransactionsSupabase([newTransaction]);

      // Automatically switch to the month of the added transaction if different
      const [transYear, transMonth] = data.date.split('-').map(Number);
      if (transYear !== currentYear || transMonth !== currentMonth) {
        setCurrentYear(transYear);
        setCurrentMonth(transMonth);
      }
    }
  };

  // Add or update expense (with installment generation support)
  const handleSaveExpense = async (
    data: Omit<ExpenseTransaction, 'id' | 'createdAt'> & { generateInstallments?: boolean },
    editingId?: string
  ) => {
    if (editingId) {
      let updatedTransaction: ExpenseTransaction | null = null;
      setTransactions((prev) =>
        prev.map((item) => {
          if (item.id === editingId) {
            updatedTransaction = { ...item, ...data } as ExpenseTransaction;
            return updatedTransaction;
          }
          return item;
        })
      );
      if (updatedTransaction) {
        await upsertTransactionsSupabase([updatedTransaction]);
      }
    } else if (data.isInstallment && data.generateInstallments && (data.installmentTotal ?? 0) > 1) {
      // Generate series of installments across consecutive months
      const N = data.installmentTotal!;
      const totalAmount = data.totalInstallmentAmount || data.amount;
      const installmentBase = Math.floor((totalAmount / N) * 100) / 100;
      const remainder = Math.round((totalAmount - installmentBase * N) * 100) / 100;
      const groupId = `grp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const newInstallments: ExpenseTransaction[] = [];
      for (let i = 0; i < N; i++) {
        const installmentDate = getInstallmentDate(data.date, i);
        // First installment absorbs rounding cents for 100% financial accuracy
        const installmentAmount = i === 0 ? installmentBase + remainder : installmentBase;
        const baseDesc = data.description || (data.category === 'maintenance' ? 'Manutenção' : 'Despesa');

        newInstallments.push({
          type: 'expense',
          category: data.category,
          date: installmentDate,
          amount: installmentAmount,
          description: `${baseDesc} (${i + 1}/${N})`,
          isInstallment: true,
          installmentGroupId: groupId,
          installmentCurrent: i + 1,
          installmentTotal: N,
          totalInstallmentAmount: totalAmount,
          // First installment takes current payment status (isPaid), subsequent future installments default to false (pending)
          isPaid: i === 0 ? (data.isPaid !== undefined ? data.isPaid : true) : false,
          id: `exp-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          createdAt: Date.now() + i,
        });
      }

      setTransactions((prev) => [...newInstallments, ...prev]);
      await upsertTransactionsSupabase(newInstallments);

      // Switch to month of the first installment if different
      const [transYear, transMonth] = data.date.split('-').map(Number);
      if (transYear !== currentYear || transMonth !== currentMonth) {
        setCurrentYear(transYear);
        setCurrentMonth(transMonth);
      }
    } else {
      const newTransaction: ExpenseTransaction = {
        ...data,
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);
      await upsertTransactionsSupabase([newTransaction]);

      // Automatically switch to the month of the added transaction if different
      const [transYear, transMonth] = data.date.split('-').map(Number);
      if (transYear !== currentYear || transMonth !== currentMonth) {
        setCurrentYear(transYear);
        setCurrentMonth(transMonth);
      }
    }
  };

  // Toggle paid status quickly directly from the list
  const handleTogglePaid = async (id: string) => {
    let updatedItem: Transaction | null = null;
    setTransactions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = !(item.isPaid !== false);
          updatedItem = {
            ...item,
            isPaid: newStatus,
            paidAt: newStatus ? new Date().toISOString() : undefined,
          };
          return updatedItem;
        }
        return item;
      })
    );
    if (updatedItem) {
      await upsertTransactionsSupabase([updatedItem]);
    }
  };

  // Delete transaction (single or entire installment group)
  const handleDeleteTransaction = async (id: string, deleteGroup?: boolean) => {
    if (deleteGroup) {
      const target = transactions.find((t) => t.id === id);
      if (target && target.type === 'expense' && target.installmentGroupId) {
        const grpId = target.installmentGroupId;
        setTransactions((prev) =>
          prev.filter(
            (item) =>
              !(item.type === 'expense' && item.installmentGroupId === grpId)
          )
        );
        await deleteTransactionGroupSupabase(grpId);
        return;
      }
    }
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    await deleteTransactionSupabase(id);
  };

  // Edit transaction trigger
  const handleEditTransaction = (item: Transaction) => {
    if (item.type === 'revenue') {
      setEditingRevenue(item);
      setIsRevenueModalOpen(true);
    } else {
      setEditingExpense(item);
      setIsExpenseModalOpen(true);
    }
  };

  // Reset data: clears all records
  const handleResetDemoData = () => {
    const empty: Transaction[] = [];
    setTransactions(empty);
    saveTransactions(empty);
  };

  // If not authenticated, show initial Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} credentials={credentials} />;
  }

  return (
    <div className="min-h-screen bg-[#EEF3FA] text-slate-800 flex flex-col font-sans">
      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Claymorphic Header */}
        <Header
          currentYear={currentYear}
          currentMonth={currentMonth}
          onChangeMonth={handleChangeMonth}
          vehicleConfig={vehicleConfig}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenNewRevenue={() => {
            setEditingRevenue(null);
            setIsRevenueModalOpen(true);
          }}
          onOpenNewExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
          onLogout={handleLogout}
          username={credentials.username}
        />

        {/* Filtragem por Semana ou Período dentro do Mês */}
        <PeriodFilterBar
          currentYear={currentYear}
          currentMonth={currentMonth}
          filter={periodFilter}
          onChangeFilter={setPeriodFilter}
          filteredCount={displayTransactions.length}
          totalMonthCount={monthTransactions.length}
        />

        {/* 4 Claymorphic Metric Cards (atualizados para o período filtrado) */}
        <MetricCards summary={summary} />

        {/* Charts: Weekly comparison & Expense distribution */}
        <FinancialCharts
          summary={summary}
          monthTransactions={monthTransactions}
          currentYear={currentYear}
          currentMonth={currentMonth}
          activeWeek={periodFilter.mode.startsWith('week-') ? periodFilter.mode : undefined}
          onSelectWeek={(weekKey) => {
            if (weekKey === 'all') {
              setPeriodFilter({ mode: 'all' });
            } else {
              const weekNum = parseInt(weekKey.replace('week-', ''), 10);
              const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
              const monthStr = String(currentMonth).padStart(2, '0');
              const startDay = (weekNum - 1) * 7 + 1;
              const endDay = weekNum === 5 ? daysInMonth : Math.min(weekNum * 7, daysInMonth);
              setPeriodFilter({
                mode: weekKey as any,
                startDate: `${currentYear}-${monthStr}-${String(startDay).padStart(2, '0')}`,
                endDate: `${currentYear}-${monthStr}-${String(endDay).padStart(2, '0')}`,
              });
            }
          }}
        />

        {/* Transactions & History Module */}
        <TransactionsList
          transactions={displayTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onTogglePaid={handleTogglePaid}
          onNewRevenue={() => {
            setEditingRevenue(null);
            setIsRevenueModalOpen(true);
          }}
          onNewExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/50 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">AutoGestão</span>
            <span aria-hidden="true">·</span>
            <span>Gestão Financeira para Veículo Terceirizado</span>
          </div>

          <div className="flex items-center gap-3">
            {isSyncing && (
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sincronizando...</span>
              </span>
            )}

            {isSupabaseConfigured ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium text-[11px] shadow-sm">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Conectado ao Supabase</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[11px]" title="Para salvar na nuvem, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>Armazenamento Local (Offline)</span>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => {
          setIsRevenueModalOpen(false);
          setEditingRevenue(null);
        }}
        onSave={handleSaveRevenue}
        editingTransaction={editingRevenue}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        editingTransaction={editingExpense}
        vehicleConfig={vehicleConfig}
      />

      <VehicleSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={vehicleConfig}
        onSaveConfig={handleSaveConfig}
        onResetDemoData={handleResetDemoData}
      />

      {/* Modal para Alterar Usuário e Senha */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        credentials={credentials}
        onSaveCredentials={handleSaveCredentials}
      />
    </div>
  );
}
