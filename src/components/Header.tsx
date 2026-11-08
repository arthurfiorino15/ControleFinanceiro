import React from 'react';
import { 
  Car, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  MinusCircle, 
  Settings, 
  User, 
  Calendar,
  LogOut,
  KeyRound 
} from 'lucide-react';
import { VehicleConfig } from '../types/finance';
import { getMonthNameBR } from '../utils/storage';

interface HeaderProps {
  currentYear: number;
  currentMonth: number; // 1 - 12
  onChangeMonth: (year: number, month: number) => void;
  vehicleConfig: VehicleConfig;
  onOpenSettings: () => void;
  onOpenNewRevenue: () => void;
  onOpenNewExpense: () => void;
  onOpenChangePassword?: () => void;
  onLogout?: () => void;
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentYear,
  currentMonth,
  onChangeMonth,
  vehicleConfig,
  onOpenSettings,
  onOpenNewRevenue,
  onOpenNewExpense,
  onOpenChangePassword,
  onLogout,
  username = 'Arthur',
}) => {
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      onChangeMonth(currentYear - 1, 12);
    } else {
      onChangeMonth(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onChangeMonth(currentYear + 1, 1);
    } else {
      onChangeMonth(currentYear, currentMonth + 1);
    }
  };

  const isCurrentMonthActual = () => {
    const today = new Date();
    return today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;
  };

  return (
    <header className="w-full mb-8">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4">
        {/* Brand & Vehicle Details */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl shadow-[6px_6px_14px_rgba(166,180,200,0.3),-6px_-6px_14px_rgba(255,255,255,0.9)] border border-white/60">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-inner">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-800 tracking-tight">AutoGestão</span>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Veículo Único
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Controle Financeiro de Veículo Terceirizado</p>
            </div>
          </div>

          {/* Vehicle & Driver Badge (Clickable to edit) */}
          <button
            onClick={onOpenSettings}
            className="group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-slate-700 shadow-[5px_5px_12px_rgba(166,180,200,0.25),-5px_-5px_12px_rgba(255,255,255,0.9)] border border-white/80 transition-all hover:-translate-y-0.5 active:translate-y-0.5 text-left"
            title="Clique para configurar veículo e motorista"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition-colors">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>{vehicleConfig.model}</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.5 rounded">
                  {vehicleConfig.plate}
                </span>
              </div>
              <div className="text-slate-500 font-medium">
                Motorista: <span className="font-semibold text-slate-700">{vehicleConfig.driverName}</span>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-1" />
          </button>
        </div>

        {/* Action Buttons & Logout */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewRevenue}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-[6px_8px_16px_rgba(16,185,129,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 text-emerald-100" />
            <span>+ Nova Receita</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm shadow-[6px_8px_16px_rgba(249,115,22,0.35),-4px_-4px_12px_rgba(255,255,255,0.9)] hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <MinusCircle className="w-4 h-4 text-orange-100" />
            <span>+ Nova Despesa</span>
          </button>

          {onOpenChangePassword && (
            <button
              onClick={onOpenChangePassword}
              className="p-3 rounded-2xl bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 shadow-[4px_4px_12px_rgba(166,180,200,0.25),-4px_-4px_12px_rgba(255,255,255,0.9)] border border-white/80 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Alterar usuário ou senha de acesso"
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">Senha</span>
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-3 rounded-2xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 shadow-[4px_4px_12px_rgba(166,180,200,0.25),-4px_-4px_12px_rgba(255,255,255,0.9)] border border-white/80 active:translate-y-0.5 transition-all cursor-pointer"
              title={`Sair da sessão (${username})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Month Selector Bar (Claymorphic Ribbon) */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-[6px_6px_16px_rgba(166,180,200,0.22),-6px_-6px_16px_rgba(255,255,255,0.9)] border border-white/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 ml-1" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Período de Gestão Mensal
          </span>
          {isCurrentMonthActual() && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Mês Atual
            </span>
          )}
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-2 bg-[#E9F0F8] p-1.5 rounded-xl shadow-[inset_2px_2px_4px_rgba(166,180,200,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-white text-slate-700 hover:text-indigo-600 shadow-[2px_2px_5px_rgba(166,180,200,0.25)] active:scale-95 transition-all cursor-pointer"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-4 py-1 text-center min-w-[170px]">
            <span className="font-extrabold text-slate-800 text-sm tracking-wide">
              {getMonthNameBR(currentMonth)}
            </span>
            <span className="text-slate-500 font-semibold text-xs ml-1.5 font-mono">
              {currentYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-white text-slate-700 hover:text-indigo-600 shadow-[2px_2px_5px_rgba(166,180,200,0.25)] active:scale-95 transition-all cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
