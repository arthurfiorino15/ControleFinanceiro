import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Car, 
  Fuel, 
  Wrench, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { MonthlySummary, Transaction } from '../types/finance';
import { formatCurrency, CATEGORY_LABELS } from '../utils/storage';

interface FinancialChartsProps {
  summary: MonthlySummary;
  monthTransactions: Transaction[];
  currentYear: number;
  currentMonth: number;
  activeWeek?: string;
  onSelectWeek?: (weekMode: string) => void;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  summary,
  monthTransactions,
  currentYear,
  currentMonth,
  activeWeek,
  onSelectWeek,
}) => {
  // Break down into 4 weeks of the month for the comparative bar chart
  const weeklyData = [
    { label: 'Semana 1 (1-7)', days: [1, 7], revenue: 0, expense: 0 },
    { label: 'Semana 2 (8-14)', days: [8, 14], revenue: 0, expense: 0 },
    { label: 'Semana 3 (15-21)', days: [15, 21], revenue: 0, expense: 0 },
    { label: 'Semana 4 (22-28)', days: [22, 28], revenue: 0, expense: 0 },
    { label: 'Semana 5 (29-31)', days: [29, 31], revenue: 0, expense: 0 },
  ];

  monthTransactions.forEach((t) => {
    const day = parseInt(t.date.split('-')[2], 10);
    const week = weeklyData.find((w) => day >= w.days[0] && day <= w.days[1]);
    if (week) {
      if (t.type === 'revenue') {
        week.revenue += t.amount;
      } else {
        week.expense += t.amount;
      }
    }
  });

  // Calculate maximum for scaling the bars
  const maxWeeklyVal = Math.max(
    ...weeklyData.map((w) => Math.max(w.revenue, w.expense)),
    100
  );

  // Category percentages
  const totalExp = summary.totalExpenses || 1;
  const categories = [
    {
      key: 'driver' as const,
      label: 'Motorista (Diária)',
      amount: summary.expensesByCategory.driver,
      icon: Car,
      color: 'bg-sky-500',
      textColor: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    {
      key: 'fuel' as const,
      label: 'Combustível',
      amount: summary.expensesByCategory.fuel,
      icon: Fuel,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      key: 'maintenance' as const,
      label: 'Manutenção & Óleo',
      amount: summary.expensesByCategory.maintenance,
      icon: Wrench,
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      key: 'other' as const,
      label: 'Outros Gastos',
      amount: summary.expensesByCategory.other,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
  ];

  // Revenue vs Expense ratio for the summary meter
  const totalFlow = summary.totalRevenue + summary.totalExpenses;
  const revenuePct = totalFlow > 0 ? (summary.totalRevenue / totalFlow) * 100 : 50;
  const expensePct = totalFlow > 0 ? (summary.totalExpenses / totalFlow) * 100 : 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      {/* Comparativo Semanal (Clay Card - 7 Cols) */}
      <div className="lg:col-span-7 clay-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Comparativo Semanal: Receitas x Despesas
                </h3>
                <p className="text-xs text-slate-500">Distribuição do fluxo financeiro por semana</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
                <span className="text-slate-600 font-medium">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-orange-500 shadow-sm" />
                <span className="text-slate-600 font-medium">Despesas</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end h-52">
              {weeklyData.map((week, idx) => {
                const weekKey = `week-${idx + 1}`;
                const isSelectedWeek = activeWeek === weekKey;
                const revHeight = maxWeeklyVal > 0 ? (week.revenue / maxWeeklyVal) * 100 : 0;
                const expHeight = maxWeeklyVal > 0 ? (week.expense / maxWeeklyVal) * 100 : 0;
                const netWeek = week.revenue - week.expense;

                return (
                  <div
                    key={idx}
                    onClick={() => onSelectWeek && onSelectWeek(isSelectedWeek ? 'all' : weekKey)}
                    className={`flex flex-col items-center h-full justify-end group rounded-2xl p-1.5 transition-all cursor-pointer ${
                      isSelectedWeek
                        ? 'bg-indigo-50/90 ring-2 ring-indigo-500 shadow-sm'
                        : 'hover:bg-slate-50'
                    }`}
                    title={`Clique para filtrar Semana ${idx + 1}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block absolute -top-8 bg-slate-800 text-white text-[11px] py-1 px-2 rounded-lg shadow-lg z-20 whitespace-nowrap">
                      Lucro: {formatCurrency(netWeek)} {isSelectedWeek ? '(Ativo)' : '(Clique p/ filtrar)'}
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-40">
                      {/* Revenue Bar */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        {week.revenue > 0 && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatCurrency(week.revenue).replace('R$', '')}
                          </span>
                        )}
                        <div
                          style={{ height: `${Math.max(revHeight, 4)}%` }}
                          className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                            week.revenue > 0
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[2px_2px_6px_rgba(16,185,129,0.3)]'
                              : 'bg-slate-100'
                          }`}
                        />
                      </div>

                      {/* Expense Bar */}
                      <div className="w-1/2 flex flex-col items-center justify-end h-full">
                        {week.expense > 0 && (
                          <span className="text-[10px] font-mono font-bold text-orange-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatCurrency(week.expense).replace('R$', '')}
                          </span>
                        )}
                        <div
                          style={{ height: `${Math.max(expHeight, 4)}%` }}
                          className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                            week.expense > 0
                              ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-[2px_2px_6px_rgba(234,88,12,0.3)]'
                              : 'bg-slate-100'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="w-full text-center mt-2.5">
                      <span className={`text-[11px] font-bold block ${isSelectedWeek ? 'text-indigo-700' : 'text-slate-700'}`}>
                        Sem {idx + 1}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {week.days[0]}-{week.days[1]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tactile Balance Meter below chart */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Proporção Geral do Fluxo
            </span>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-emerald-700 font-bold">{revenuePct.toFixed(0)}% Entrada</span>
              <span className="text-orange-700 font-bold">{expensePct.toFixed(0)}% Saída</span>
            </div>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 shadow-inner flex">
            <div
              style={{ width: `${revenuePct}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full shadow-sm transition-all duration-500"
            />
            <div
              style={{ width: `${expensePct}%` }}
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-r-full shadow-sm transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Distribuição de Despesas por Categoria (Clay Card - 5 Cols) */}
      <div className="lg:col-span-5 clay-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Despesas por Categoria
                </h3>
                <p className="text-xs text-slate-500">Destino de cada real gasto</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
              {formatCurrency(summary.totalExpenses)}
            </span>
          </div>

          {/* Category Rows with Clay progress indicators */}
          <div className="mt-5 space-y-3.5">
            {categories.map((cat) => {
              const pct = summary.totalExpenses > 0 ? (cat.amount / summary.totalExpenses) * 100 : 0;
              const Icon = cat.icon;

              return (
                <div key={cat.key} className="p-2.5 rounded-2xl bg-white/60 border border-slate-100 hover:bg-white transition-all shadow-[2px_2px_8px_rgba(166,180,200,0.15)]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${cat.bgColor} ${cat.textColor} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800">{cat.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-800">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 min-w-[42px] text-right">
                        ({pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${cat.color} rounded-full transition-all duration-500 shadow-sm`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Driver Insight */}
        <div className="mt-5 p-3 rounded-2xl bg-sky-50/80 border border-sky-100 text-xs text-sky-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Diária base configurada:</span>
          </div>
          <span className="font-mono font-bold text-sky-950">
            {formatCurrency(130.00)}/dia
          </span>
        </div>
      </div>
    </div>
  );
};
