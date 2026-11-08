import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Car, 
  Fuel, 
  Wrench, 
  Package, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency, formatDateBR, CATEGORY_LABELS } from '../utils/storage';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string, deleteGroup?: boolean) => void;
  onTogglePaid: (id: string) => void;
  onNewRevenue: () => void;
  onNewExpense: () => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onTogglePaid,
  onNewRevenue,
  onNewExpense,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const isPaid = t.isPaid !== false;

    // Type/Category/Status filters
    if (filterType === 'revenue' && t.type !== 'revenue') return false;
    if (filterType === 'expense' && t.type !== 'expense') return false;
    if (filterType === 'paid' && !isPaid) return false;
    if (filterType === 'pending' && isPaid) return false;
    if (filterType === 'installments') {
      if (t.type !== 'expense' || !t.isInstallment) return false;
    }
    if (['driver', 'fuel', 'maintenance', 'other'].includes(filterType)) {
      if (t.type !== 'expense' || t.category !== filterType) return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const dateFormatted = formatDateBR(t.date);
      const amountStr = t.amount.toString();
      const statusStr = isPaid ? 'pago recebido quitado' : 'pendente a pagar a receber';
      return desc.includes(term) || dateFormatted.includes(term) || amountStr.includes(term) || statusStr.includes(term);
    }

    return true;
  });

  // Sort descending by date
  const sorted = [...filtered].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
  });

  const getTransactionIcon = (t: Transaction) => {
    if (t.type === 'revenue') {
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
          <TrendingUp className="w-5 h-5" />
        </div>
      );
    }

    switch (t.category) {
      case 'driver':
        return (
          <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
            <Car className="w-5 h-5" />
          </div>
        );
      case 'fuel':
        return (
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
            <Fuel className="w-5 h-5" />
          </div>
        );
      case 'maintenance':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
            <Wrench className="w-5 h-5" />
          </div>
        );
      case 'other':
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
            <Package className="w-5 h-5" />
          </div>
        );
    }
  };

  const getCategoryBadge = (t: Transaction) => {
    if (t.type === 'revenue') {
      return (
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
          Receita Bruta {t.tripsCount ? `· ${t.tripsCount} corridas` : ''}
        </span>
      );
    }

    const catMeta = CATEGORY_LABELS[t.category] || { label: 'Despesa', color: '#666' };
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {catMeta.label}
        </span>
        {t.isInstallment && (
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300/60 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-amber-700" />
            Parcela {t.installmentCurrent}/{t.installmentTotal}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="clay-card p-6 mb-12">
      {/* Top Header of the Extrato */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">
            Histórico & Lançamentos do Mês
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Acompanhe cada entrada, saída, parcelas e status de quitação com 1 clique
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por descrição, data ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full clay-input py-2 pl-9 pr-3 text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 py-4 border-b border-slate-100 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-2 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filtrar:
        </span>

        {[
          { key: 'all', label: 'Todos' },
          { key: 'paid', label: '✓ Pagos / Recebidos' },
          { key: 'pending', label: '⏳ Pendentes' },
          { key: 'revenue', label: 'Receitas' },
          { key: 'expense', label: 'Despesas' },
          { key: 'installments', label: 'Parcelados' },
          { key: 'driver', label: 'Diária Motorista' },
          { key: 'fuel', label: 'Combustível' },
          { key: 'maintenance', label: 'Manutenção' },
          { key: 'other', label: 'Outros' },
        ].map((tab) => {
          const isActive = filterType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-[#F2F6FA] text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List of Transactions */}
      <div className="mt-4 space-y-2.5">
        {sorted.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Nenhum lançamento encontrado</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterType !== 'all'
                ? 'Tente ajustar os filtros ou o termo de busca.'
                : 'Você ainda não registrou entradas ou saídas neste mês.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={onNewRevenue}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Lançar Receita
              </button>
              <button
                onClick={onNewExpense}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                + Lançar Despesa
              </button>
            </div>
          </div>
        ) : (
          sorted.map((item) => {
            const isRevenue = item.type === 'revenue';
            const isPaid = item.isPaid !== false;

            return (
              <div
                key={item.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-[#F9FBFE] border shadow-[2px_3px_10px_rgba(166,180,200,0.12)] transition-all hover:-translate-y-0.5 ${
                  !isPaid ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
                }`}
              >
                {/* Left side: Icon, Title, Date, Badges & Paid Status */}
                <div className="flex items-start sm:items-center gap-3">
                  {getTransactionIcon(item)}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">
                        {item.description || (isRevenue ? 'Receita de Corridas' : 'Despesa Operacional')}
                      </span>
                      {getCategoryBadge(item)}

                      {/* Interactive Payment Status Badge (clickable to toggle) */}
                      <button
                        type="button"
                        onClick={() => onTogglePaid(item.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300/70'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                        }`}
                        title={
                          isPaid
                            ? 'Clique para marcar como Pendente'
                            : 'Clique para marcar como Pago / Recebido'
                        }
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{isRevenue ? 'Recebido' : 'Pago'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                            <span>{isRevenue ? 'A Receber' : 'Pendente'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-mono font-medium">{formatDateBR(item.date)}</span>

                      {/* Driver extra details */}
                      {item.type === 'expense' && item.category === 'driver' && item.driverBonusAmount ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-700">
                            Base: {formatCurrency(item.driverBaseAmount || 0)} + Bônus: {formatCurrency(item.driverBonusAmount)}
                          </span>
                        </>
                      ) : null}

                      {/* Fuel liters details */}
                      {item.type === 'expense' && item.category === 'fuel' && item.liters ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-orange-700 font-mono">
                            {item.liters.toFixed(1)} Litros
                          </span>
                        </>
                      ) : null}

                      {/* Installment details */}
                      {item.type === 'expense' && item.isInstallment && item.totalInstallmentAmount ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-800 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-amber-600" />
                            Total da compra: {formatCurrency(item.totalInstallmentAmount)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount & Action buttons */}
                <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold font-mono tabular-nums ${
                        isRevenue ? 'text-emerald-600' : 'text-orange-600'
                      }`}
                    >
                      {isRevenue ? '+ ' : '- '}
                      {formatCurrency(item.amount)}
                    </span>
                    {item.type === 'expense' && item.isInstallment && (
                      <span className="block text-[10px] text-slate-400 font-mono">
                        (Valor desta parcela)
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Editar lançamento"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {confirmDeleteId === item.id ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200">
                        {item.type === 'expense' && item.isInstallment && item.installmentGroupId ? (
                          <>
                            <span className="text-[10px] text-red-700 font-bold block sm:inline">Excluir:</span>
                            <button
                              onClick={() => {
                                onDelete(item.id, false);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-red-700 bg-red-100 hover:bg-red-200 rounded cursor-pointer whitespace-nowrap"
                              title="Excluir apenas este mês"
                            >
                              Só esta parcela
                            </button>
                            <button
                              onClick={() => {
                                onDelete(item.id, true);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer whitespace-nowrap"
                              title="Excluir todo o parcelamento"
                            >
                              Todas as {item.installmentTotal}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-white rounded cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-red-700 font-bold">Excluir?</span>
                            <button
                              onClick={() => {
                                onDelete(item.id, false);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[11px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-white rounded-lg cursor-pointer"
                            >
                              Não
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
