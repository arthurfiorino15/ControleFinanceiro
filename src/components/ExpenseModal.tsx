import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  FileText, 
  Car, 
  Fuel, 
  Wrench, 
  Package,
  Plus,
  Equal,
  CreditCard,
  Layers,
  CalendarClock
} from 'lucide-react';
import { ExpenseCategory, ExpenseTransaction, VehicleConfig } from '../types/finance';
import { formatCurrency, getInstallmentDate, formatDateBR } from '../utils/storage';

export type ExpenseSavePayload = Omit<ExpenseTransaction, 'id' | 'createdAt'> & {
  generateInstallments?: boolean;
};

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpenseSavePayload, editingId?: string) => void;
  editingTransaction?: ExpenseTransaction | null;
  vehicleConfig: VehicleConfig;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  vehicleConfig,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('driver');
  const [date, setDate] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Driver category specific fields
  const [driverBaseAmount, setDriverBaseAmount] = useState<string>('');
  const [driverBonusAmount, setDriverBonusAmount] = useState<string>('');

  // Fuel specific
  const [liters, setLiters] = useState<string>('');

  // Installments specific (for maintenance and other)
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [installmentCount, setInstallmentCount] = useState<number>(3);

  // Payment status
  const [isPaid, setIsPaid] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setDescription(editingTransaction.description || '');
        setIsPaid(editingTransaction.isPaid !== undefined ? editingTransaction.isPaid : true);

        if (editingTransaction.isInstallment && editingTransaction.totalInstallmentAmount) {
          // If editing an installment item
          setIsInstallment(true);
          setInstallmentCount(editingTransaction.installmentTotal || 2);
          setAmount(editingTransaction.totalInstallmentAmount.toString());
        } else {
          setIsInstallment(false);
          setInstallmentCount(3);
          setAmount(editingTransaction.amount.toString());
        }

        if (editingTransaction.category === 'driver') {
          setDriverBaseAmount(editingTransaction.driverBaseAmount?.toString() || editingTransaction.amount.toString());
          setDriverBonusAmount(editingTransaction.driverBonusAmount?.toString() || '0');
        } else {
          setDriverBaseAmount(vehicleConfig.defaultDriverDailyRate.toString());
          setDriverBonusAmount('0');
        }

        if (editingTransaction.liters) {
          setLiters(editingTransaction.liters.toString());
        } else {
          setLiters('');
        }
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setCategory('driver');
        setDriverBaseAmount(vehicleConfig.defaultDriverDailyRate.toString());
        setDriverBonusAmount('0');
        setAmount(vehicleConfig.defaultDriverDailyRate.toString());
        setDescription(`Diária do motorista ${vehicleConfig.driverName}`);
        setLiters('');
        setIsInstallment(false);
        setInstallmentCount(3);
        setIsPaid(true);
      }
    }
  }, [isOpen, editingTransaction, vehicleConfig]);

  // Update total amount when driver base or bonus changes
  useEffect(() => {
    if (category === 'driver') {
      const base = parseFloat(driverBaseAmount.replace(',', '.')) || 0;
      const bonus = parseFloat(driverBonusAmount.replace(',', '.')) || 0;
      setAmount((base + bonus).toFixed(2));
    }
  }, [driverBaseAmount, driverBonusAmount, category]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (cat === 'driver') {
      const base = parseFloat(driverBaseAmount.replace(',', '.')) || vehicleConfig.defaultDriverDailyRate;
      const bonus = parseFloat(driverBonusAmount.replace(',', '.')) || 0;
      setAmount((base + bonus).toFixed(2));
      setDescription(`Diária do motorista ${vehicleConfig.driverName}`);
      setIsInstallment(false);
    } else if (cat === 'fuel') {
      setDescription('Abastecimento de combustível');
      setAmount('');
      setIsInstallment(false);
    } else if (cat === 'maintenance') {
      setDescription('Manutenção preventiva / Troca de óleo');
      setAmount('');
    } else {
      setDescription('Gasto operacional');
      setAmount('');
    }
  };

  const allowsInstallments = category === 'maintenance' || category === 'other';

  // Calculate installment values
  const totalAmountNum = parseFloat(amount.replace(',', '.')) || 0;
  const singleInstallmentValue = isInstallment && installmentCount > 0 ? totalAmountNum / installmentCount : totalAmountNum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Por favor, informe um valor de despesa válido maior que zero.');
      return;
    }

    if (!date) {
      alert('Por favor, selecione uma data válida.');
      return;
    }

    const payload: ExpenseSavePayload = {
      type: 'expense',
      category,
      date,
      amount: finalAmount,
      description: description.trim() || undefined,
      isPaid,
    };

    if (category === 'driver') {
      payload.driverBaseAmount = parseFloat(driverBaseAmount.replace(',', '.')) || finalAmount;
      payload.driverBonusAmount = parseFloat(driverBonusAmount.replace(',', '.')) || 0;
    } else if (category === 'fuel' && liters) {
      payload.liters = parseFloat(liters.replace(',', '.'));
    } else if (allowsInstallments && isInstallment && installmentCount > 1) {
      payload.isInstallment = true;
      payload.installmentTotal = installmentCount;
      payload.totalInstallmentAmount = finalAmount;
      payload.generateInstallments = !editingTransaction; // Only generate series on new creation
    }

    onSave(payload, editingTransaction?.id);
    onClose();
  };

  const categoryOptions: { key: ExpenseCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'driver', label: 'Motorista (Diária)', icon: Car },
    { key: 'fuel', label: 'Combustível', icon: Fuel },
    { key: 'maintenance', label: 'Manutenção', icon: Wrench },
    { key: 'other', label: 'Outros', icon: Package },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-[12px_16px_36px_rgba(0,0,0,0.18),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-white/80 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center text-white shadow-[4px_4px_10px_rgba(249,115,22,0.35),inset_2px_2px_4px_rgba(255,255,255,0.4)]">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">
                {editingTransaction ? 'Editar Despesa' : 'Novo Lançamento de Despesa'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {allowsInstallments 
                  ? 'Suporta pagamento à vista ou parcelado'
                  : 'Pagamentos imediatos (Diária e abastecimento)'}
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

        {/* Category Picker Tabs (Claymorphic) */}
        <div className="mt-5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Selecione a Categoria de Despesa *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoryOptions.map((opt) => {
              const isSelected = category === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleCategoryChange(opt.key)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-[4px_6px_14px_rgba(234,88,12,0.35),inset_1px_1px_3px_rgba(255,255,255,0.5)] border-transparent -translate-y-0.5'
                      : 'bg-[#F2F6FA] text-slate-600 hover:bg-white border-white/60 shadow-[3px_3px_8px_rgba(166,180,200,0.25)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* SPECIAL CATEGORY: Motorista (Diária Base + Bônus) */}
          {category === 'driver' ? (
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                <span className="flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-sky-600" />
                  Cálculo da Diária do Motorista
                </span>
                <span className="text-[11px] text-sky-700 font-normal">
                  Motorista: {vehicleConfig.driverName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Valor Base Fixo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={driverBaseAmount}
                    onChange={(e) => setDriverBaseAmount(e.target.value)}
                    className="w-full clay-input py-2 px-3 text-slate-900 font-bold font-mono text-base"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <Plus className="w-3 h-3 text-orange-500" />
                    <span>Acréscimo / Bônus (R$)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={driverBonusAmount}
                    onChange={(e) => setDriverBonusAmount(e.target.value)}
                    className="w-full clay-input py-2 px-3 text-slate-900 font-bold font-mono text-base"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1">
                  <Equal className="w-3.5 h-3.5" /> Total Pago ao Motorista:
                </span>
                <span className="font-mono font-extrabold text-lg text-sky-950">
                  {formatCurrency(parseFloat(amount) || 0)}
                </span>
              </div>
            </div>
          ) : (
            /* Standard Valor for other categories */
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-orange-600" />
                <span>{allowsInstallments && isInstallment ? 'Valor Total da Compra (R$) *' : 'Valor Pago (R$) *'}</span>
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
            </div>
          )}

          {/* PARCELAMENTO PARA MANUTENÇÃO E OUTROS */}
          {allowsInstallments && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInstallment}
                    onChange={(e) => setIsInstallment(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-700" />
                    Parcelar esta despesa no cartão / fornecedor
                  </span>
                </label>

                {isInstallment && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                    {installmentCount}x parcelas
                  </span>
                )}
              </div>

              {isInstallment && (
                <div className="pt-2 border-t border-amber-200/60 space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Número de Parcelas Mensais
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setInstallmentCount(num)}
                          className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                            installmentCount === num
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white text-slate-700 hover:bg-amber-100/70 border border-amber-200'
                          }`}
                        >
                          {num}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Installment breakdown preview */}
                  {totalAmountNum > 0 && (
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-amber-900">
                          <Layers className="w-3.5 h-3.5 text-amber-600" />
                          Valor de cada parcela:
                        </span>
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {formatCurrency(singleInstallmentValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="w-3 h-3 text-slate-400" />
                          1ª parcela: {date ? formatDateBR(date) : 'Hoje'}
                        </span>
                        <span>
                          Última ({installmentCount}ª): {date ? formatDateBR(getInstallmentDate(date, installmentCount - 1)) : '-'}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-800/80 italic pt-0.5">
                        * O sistema lançará cada parcela no seu respectivo mês, garantindo o cálculo fiel do fluxo de caixa e lucro líquido de cada período.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Combustível: Litros (Opcional) */}
          {category === 'fuel' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-orange-600" />
                <span>Quantidade Abastecida em Litros (Opcional)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 22.5"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="w-full clay-input py-2.5 px-4 text-slate-800 font-mono text-sm"
              />
            </div>
          )}

          {/* Data do Lançamento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {isInstallment ? 'Data da 1ª Parcela * (Permite retroativa)' : 'Data do Pagamento * (Permite retroativa)'}
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full clay-input py-2.5 px-4 text-slate-800 font-medium text-sm"
            />
          </div>

          {/* Descrição / Observação */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Descrição / Detalhes (Opcional)</span>
            </label>
            <input
              type="text"
              placeholder={
                category === 'maintenance'
                  ? 'Ex: Troca de 4 Pneus / Revisão de suspensão'
                  : category === 'other'
                  ? 'Ex: Seguro parcelado / IPVA / Lavagem'
                  : 'Ex: Observações do pagamento'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full clay-input py-2.5 px-4 text-slate-800 text-sm"
            />
          </div>

          {/* Status do Pagamento (Pago vs Pendente) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Status do Pagamento *
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
                <span>Pago / Quitado</span>
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
                <span>Pendente / A Pagar</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isPaid
                ? 'Pagamento já efetuado (dinheiro, Pix, débito ou fatura já faturada).'
                : isInstallment
                ? 'Parcelas futuras nascerão agendadas como Pendentes até a quitação.'
                : 'Despesa lançada mas ainda pendente de acerto com motorista ou fornecedor.'}
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-extrabold text-sm shadow-[6px_8px_16px_rgba(249,115,22,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {editingTransaction 
                ? 'Atualizar Despesa' 
                : isInstallment && installmentCount > 1 
                ? `Lançar em ${installmentCount}x` 
                : 'Salvar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
