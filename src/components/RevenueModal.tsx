import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Calendar, DollarSign, FileText, Hash } from 'lucide-react';
import { RevenueTransaction } from '../types/finance';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<RevenueTransaction, 'id' | 'createdAt'>, editingId?: string) => void;
  editingTransaction?: RevenueTransaction | null;
}

export const RevenueModal: React.FC<RevenueModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}) => {
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tripsCount, setTripsCount] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setDate(editingTransaction.date);
        setAmount(editingTransaction.amount.toString());
        setDescription(editingTransaction.description || '');
        setTripsCount(editingTransaction.tripsCount ? editingTransaction.tripsCount.toString() : '');
        setIsPaid(editingTransaction.isPaid !== undefined ? editingTransaction.isPaid : true);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setAmount('');
        setDescription('Corridas do dia (Uber / 99 / Passageiros)');
        setTripsCount('');
        setIsPaid(true);
      }
    }
  }, [isOpen, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor, informe um valor bruto válido maior que zero.');
      return;
    }

    if (!date) {
      alert('Por favor, selecione uma data.');
      return;
    }

    onSave(
      {
        type: 'revenue',
        date,
        amount: parsedAmount,
        description: description.trim() || 'Receita de corridas',
        tripsCount: tripsCount ? parseInt(tripsCount, 10) : undefined,
        isPaid,
      },
      editingTransaction?.id
    );
    onClose();
  };

  const addQuickAmount = (val: number) => {
    const current = parseFloat(amount.replace(',', '.')) || 0;
    setAmount((current + val).toFixed(2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-[12px_16px_36px_rgba(0,0,0,0.18),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[4px_4px_10px_rgba(16,185,129,0.35),inset_2px_2px_4px_rgba(255,255,255,0.4)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {editingTransaction ? 'Editar Receita' : 'Novo Lançamento de Receita'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Produção bruta de corridas do veículo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Valor Bruto */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Valor Bruto (R$) *</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                autoFocus
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full clay-input py-3 pl-12 pr-4 text-slate-900 font-bold text-xl font-mono"
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Atalhos:</span>
              {[100, 200, 350, 450].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/50 cursor-pointer"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Data do Lançamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Data do Lançamento * (Permite retroativa)</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full clay-input py-2.5 px-4 text-slate-800 font-medium text-sm"
            />
          </div>

          {/* Quantidade de Corridas (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              <span>Quantidade de Corridas Realizadas (Opcional)</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 18"
              value={tripsCount}
              onChange={(e) => setTripsCount(e.target.value)}
              className="w-full clay-input py-2.5 px-4 text-slate-800 font-mono text-sm"
            />
          </div>

          {/* Descrição / Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Descrição / Observação (Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Corridas Sexta-feira, Turno Noite, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full clay-input py-2.5 px-4 text-slate-800 text-sm"
            />
          </div>

          {/* Status do Recebimento (Pago / Recebido vs Pendente) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status do Recebimento *
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPaid(true)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPaid
                    ? 'bg-emerald-600 text-white shadow-md -translate-y-0.5'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>Recebido / Pago</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPaid(false)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isPaid
                    ? 'bg-amber-600 text-white shadow-md -translate-y-0.5'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300" />
                <span>Pendente / A Receber</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isPaid
                ? 'Valor já entrou na conta bancária ou em espécie.'
                : 'Corridas já realizadas com repasse agendado para os próximos dias.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-[6px_8px_16px_rgba(16,185,129,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {editingTransaction ? 'Atualizar Receita' : 'Salvar Receita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
