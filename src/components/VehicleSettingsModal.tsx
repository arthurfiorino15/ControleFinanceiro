import React, { useState } from 'react';
import { X, Car, User, DollarSign, RotateCcw, ShieldCheck } from 'lucide-react';
import { VehicleConfig } from '../types/finance';

interface VehicleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VehicleConfig;
  onSaveConfig: (newConfig: VehicleConfig) => void;
  onResetDemoData: () => void;
}

export const VehicleSettingsModal: React.FC<VehicleSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDemoData,
}) => {
  const [model, setModel] = useState(config.model);
  const [plate, setPlate] = useState(config.plate);
  const [driverName, setDriverName] = useState(config.driverName);
  const [defaultRate, setDefaultRate] = useState(config.defaultDriverDailyRate.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateNum = parseFloat(defaultRate.replace(',', '.'));
    onSaveConfig({
      model: model.trim() || 'Veículo Terceirizado',
      plate: plate.trim().toUpperCase() || 'ABC-1234',
      driverName: driverName.trim() || 'Motorista Titular',
      defaultDriverDailyRate: isNaN(rateNum) ? 130 : rateNum,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[12px_16px_36px_rgba(0,0,0,0.18),-8px_-8px_24px_rgba(255,255,255,0.9)] border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Configurações do Veículo
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Veículo terceirizado & Motorista parceiro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Modelo do Veículo
            </label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: Chevrolet Onix Plus"
              className="w-full clay-input py-2 px-3 text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Placa do Veículo
            </label>
            <input
              type="text"
              required
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="Ex: BRA-2E19"
              className="w-full clay-input py-2 px-3 text-slate-800 text-sm font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Nome do Motorista Titular</span>
            </label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Ex: Carlos Eduardo"
              className="w-full clay-input py-2 px-3 text-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Valor Base Padrão da Diária (R$)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={defaultRate}
              onChange={(e) => setDefaultRate(e.target.value)}
              className="w-full clay-input py-2 px-3 text-slate-800 font-mono text-sm font-bold"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Preenche automaticamente o campo de diária ao lançar nova despesa do motorista.
            </p>
          </div>

          {/* Reset Demo Data Action */}
          <div className="pt-3 border-t border-slate-100">
            {showResetConfirm ? (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs">
                <p className="font-bold text-red-800 mb-2">
                  Deseja restaurar os dados de demonstração originais?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 cursor-pointer"
                  >
                    Sim, restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 bg-white text-slate-700 rounded-lg text-xs hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar dados de exemplo do mês</span>
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-colors cursor-pointer"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
