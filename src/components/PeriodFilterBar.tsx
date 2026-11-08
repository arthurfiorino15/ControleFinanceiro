import React, { useState } from 'react';
import { Calendar, Filter, X, CalendarRange, Clock, ArrowRight } from 'lucide-react';
import { PeriodFilter, PeriodFilterMode } from '../types/finance';
import { formatDateBR } from '../utils/storage';

interface PeriodFilterBarProps {
  currentYear: number;
  currentMonth: number;
  filter: PeriodFilter;
  onChangeFilter: (filter: PeriodFilter) => void;
  filteredCount: number;
  totalMonthCount: number;
}

export const PeriodFilterBar: React.FC<PeriodFilterBarProps> = ({
  currentYear,
  currentMonth,
  filter,
  onChangeFilter,
  filteredCount,
  totalMonthCount,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  // Month boundary days
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const monthStr = String(currentMonth).padStart(2, '0');
  const minDate = `${currentYear}-${monthStr}-01`;
  const maxDate = `${currentYear}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;

  const [customStart, setCustomStart] = useState<string>(
    filter.mode === 'custom' && filter.startDate ? filter.startDate : minDate
  );
  const [customEnd, setCustomEnd] = useState<string>(
    filter.mode === 'custom' && filter.endDate ? filter.endDate : maxDate
  );

  const weeks: { mode: PeriodFilterMode; label: string; sub: string; startDay: number; endDay: number }[] = [
    { mode: 'week-1', label: 'Semana 1', sub: 'Dias 1 a 7', startDay: 1, endDay: 7 },
    { mode: 'week-2', label: 'Semana 2', sub: 'Dias 8 a 14', startDay: 8, endDay: 14 },
    { mode: 'week-3', label: 'Semana 3', sub: 'Dias 15 a 21', startDay: 15, endDay: 21 },
    { mode: 'week-4', label: 'Semana 4', sub: 'Dias 22 a 28', startDay: 22, endDay: 28 },
  ];

  if (daysInMonth > 28) {
    weeks.push({
      mode: 'week-5',
      label: 'Semana 5',
      sub: `Dias 29 a ${daysInMonth}`,
      startDay: 29,
      endDay: daysInMonth,
    });
  }

  const handleSelectMode = (mode: PeriodFilterMode) => {
    if (mode === 'all') {
      onChangeFilter({ mode: 'all' });
      setIsCustomOpen(false);
      return;
    }

    if (mode === 'custom') {
      setIsCustomOpen(true);
      onChangeFilter({
        mode: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
      return;
    }

    // Week modes
    const week = weeks.find((w) => w.mode === mode);
    if (week) {
      const sDay = String(week.startDay).padStart(2, '0');
      const eDay = String(week.endDay).padStart(2, '0');
      onChangeFilter({
        mode,
        startDate: `${currentYear}-${monthStr}-${sDay}`,
        endDate: `${currentYear}-${monthStr}-${eDay}`,
      });
      setIsCustomOpen(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      alert('A data inicial não pode ser posterior à data final.');
      return;
    }
    onChangeFilter({
      mode: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
  };

  const isFiltered = filter.mode !== 'all';

  return (
    <div className="mb-6 p-4 rounded-3xl bg-white/80 backdrop-blur-md shadow-[6px_8px_20px_rgba(166,180,200,0.22),-6px_-6px_20px_rgba(255,255,255,0.9)] border border-white/80 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Indicator title and filtered stats */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Filtro no Mês
              </span>
              {isFiltered ? (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[11px] flex items-center gap-1">
                  <span>Filtrando</span>
                  <span className="font-mono">({filteredCount} de {totalMonthCount} itens)</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-medium">
                  Exibindo o mês completo ({totalMonthCount} lançamentos)
                </span>
              )}
            </div>
            {isFiltered && filter.startDate && filter.endDate && (
              <p className="text-[11px] font-mono text-indigo-700 mt-0.5">
                Período ativo: {formatDateBR(filter.startDate)} até {formatDateBR(filter.endDate)}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick buttons for Month, Weeks, and Custom Period */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Mês Completo */}
          <button
            type="button"
            onClick={() => handleSelectMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter.mode === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-[#F2F6FA] text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
            }`}
          >
            Mês Completo
          </button>

          {/* Semanas */}
          {weeks.map((w) => {
            const isActive = filter.mode === w.mode;
            return (
              <button
                key={w.mode}
                type="button"
                onClick={() => handleSelectMode(w.mode)}
                className={`group px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[#F2F6FA] text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
                }`}
                title={w.sub}
              >
                <span>{w.label}</span>
                <span className={`text-[10px] font-mono ${isActive ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  ({w.startDay}-{w.endDay})
                </span>
              </button>
            );
          })}

          {/* Por Período Customizado */}
          <button
            type="button"
            onClick={() => {
              setIsCustomOpen(!isCustomOpen);
              if (!isCustomOpen && filter.mode !== 'custom') {
                handleSelectMode('custom');
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter.mode === 'custom'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#F2F6FA] text-slate-600 hover:bg-slate-200/70 border border-slate-200/50'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Por Período...</span>
          </button>

          {/* Limpar filtro */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => handleSelectMode('all')}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Limpar filtro de período"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Custom Date Range Drawer */}
      {isCustomOpen && (
        <form
          onSubmit={handleApplyCustom}
          className="mt-3 pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">De:</span>
            <input
              type="date"
              required
              min={minDate}
              max={maxDate}
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="clay-input py-1.5 px-3 text-xs text-slate-800 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Até:</span>
            <input
              type="date"
              required
              min={customStart || minDate}
              max={maxDate}
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="clay-input py-1.5 px-3 text-xs text-slate-800 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Aplicar Intervalo
          </button>

          <span className="text-[11px] text-slate-500">
            * O intervalo é delimitado ao mês de referência selecionado.
          </span>
        </form>
      )}
    </div>
  );
};
