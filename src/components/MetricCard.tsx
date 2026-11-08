import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  PiggyBank, 
  CalendarDays,
  Percent,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MonthlySummary } from '../types/finance';
import { formatCurrency } from '../utils/storage';

interface MetricCardsProps {
  summary: MonthlySummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const isProfitable = summary.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* 1. LUCRO LÍQUIDO REAL (Destaque Principal - Clay Mint) */}
      <div className={`relative p-6 ${isProfitable ? 'clay-mint' : 'clay-coral'} transition-transform duration-200 hover:-translate-y-1`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <PiggyBank className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                Resultado do Mês
              </span>
              <h2 className="text-sm font-semibold text-white/95">Lucro Líquido Real</h2>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/25 backdrop-blur-sm text-xs font-bold text-white shadow-inner">
            <Percent className="w-3.5 h-3.5" />
            <span>{summary.profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-sm">
            {formatCurrency(summary.netProfit)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1">
              {isProfitable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-200" />
              )}
              {isProfitable ? 'Margem líquida positiva' : 'Atenção: Saldo negativo'}
            </span>
            <span className="font-mono opacity-90">
              {summary.workingDays > 0 ? `~${formatCurrency(summary.dailyAverageProfit)}/dia` : 'Sem lançamentos'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. RECEITA BRUTA TOTAL (Clay Indigo) */}
      <div className="relative p-6 clay-indigo transition-transform duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                Faturamento
              </span>
              <h3 className="text-sm font-semibold text-white/95">Receita Bruta Total</h3>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-sm text-xs font-bold text-white shadow-inner">
            <span>{summary.revenueCount} {summary.revenueCount === 1 ? 'dia' : 'dias'}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-sm">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-sm" />
              <span>Recebido:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(summary.totalRevenueReceived)}</span>
            </span>
            {summary.totalRevenuePending > 0 && (
              <span className="flex items-center gap-1 bg-amber-400/30 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold text-yellow-200">
                Pendente: {formatCurrency(summary.totalRevenuePending)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. DESPESAS TOTAIS (Clay Coral) */}
      <div className="relative p-6 clay-coral transition-transform duration-200 hover:-translate-y-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-white/90">
                Custos Totais
              </span>
              <h3 className="text-sm font-semibold text-white/95">Despesas do Mês</h3>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-sm text-xs font-bold text-white shadow-inner">
            <span>{summary.expenseCount} saídas</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums drop-shadow-sm">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-white/90 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-sm" />
              <span>Pago:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(summary.totalExpensesPaid)}</span>
            </span>
            {summary.totalExpensesPending > 0 ? (
              <span className="flex items-center gap-1 bg-black/25 px-1.5 py-0.5 rounded-md font-mono text-[11px] font-bold text-yellow-200">
                A pagar: {formatCurrency(summary.totalExpensesPending)}
              </span>
            ) : (
              <span className="text-[11px] text-white/80">100% quitado</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. OPERAÇÃO E MÉDIA DIÁRIA (Clay Card com tons suaves e alto contraste) */}
      <div className="relative p-6 clay-card transition-transform duration-200 hover:-translate-y-1 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Desempenho
              </span>
              <h3 className="text-sm font-bold text-slate-800">Dias Operados</h3>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs">
            {summary.workingDays} {summary.workingDays === 1 ? 'dia' : 'dias'}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Custo diário médio:</span>
            <span className="font-mono font-bold text-slate-700">
              {summary.workingDays > 0 ? formatCurrency(summary.totalExpenses / summary.workingDays) : 'R$ 0,00'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Diárias do Motorista:</span>
            <span className="font-mono font-bold text-sky-600">
              {formatCurrency(summary.expensesByCategory.driver)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Combustível:</span>
            <span className="font-mono font-bold text-orange-600">
              {formatCurrency(summary.expensesByCategory.fuel)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
