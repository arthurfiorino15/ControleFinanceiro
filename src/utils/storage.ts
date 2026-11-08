import { Transaction, VehicleConfig, AuthCredentials } from '../types/finance';

const STORAGE_KEY_TRANSACTIONS = 'autogestao_transactions_v4';
const STORAGE_KEY_CONFIG = 'autogestao_vehicle_config_v2';
const STORAGE_KEY_AUTH_CREDS = 'autogestao_auth_credentials_v1';

export const DEFAULT_AUTH_CREDENTIALS: AuthCredentials = {
  username: 'Arthur',
  password: 'Arthurfiorino',
};

export function loadAuthCredentials(): AuthCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_CREDS);
    if (!raw) {
      saveAuthCredentials(DEFAULT_AUTH_CREDENTIALS);
      return DEFAULT_AUTH_CREDENTIALS;
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
      return parsed;
    }
    return DEFAULT_AUTH_CREDENTIALS;
  } catch (err) {
    console.error('Error loading auth credentials:', err);
    return DEFAULT_AUTH_CREDENTIALS;
  }
}

export function saveAuthCredentials(creds: AuthCredentials): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_CREDS, JSON.stringify(creds));
  } catch (err) {
    console.error('Error saving auth credentials:', err);
  }
}

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  model: 'Chevrolet Onix Plus 1.0 Turbo',
  plate: 'BRA-2E19',
  driverName: 'Carlos Eduardo Silva',
  defaultDriverDailyRate: 130.0,
};

/**
 * Retorna transações iniciais vazias (sem dados de demonstração fictícios).
 * Conforme instrução: "não é necessário levar nenhum registro, pode apagar todos, mantenha apenas o usuário e senha"
 */
export function getInitialTransactions(): Transaction[] {
  return [];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item: Transaction) => ({
        ...item,
        isPaid: item.isPaid !== undefined ? item.isPaid : true,
      }));
    }
    return [];
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadVehicleConfig(): VehicleConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      saveVehicleConfig(DEFAULT_VEHICLE_CONFIG);
      return DEFAULT_VEHICLE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_VEHICLE_CONFIG, ...parsed };
  } catch (err) {
    console.error('Error loading vehicle config:', err);
    return DEFAULT_VEHICLE_CONFIG;
  }
}

export function saveVehicleConfig(config: VehicleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving vehicle config:', err);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function getMonthNameBR(monthNumber: number): string {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  return months[monthNumber - 1] || '';
}

export const CATEGORY_LABELS: Record<string, { label: string; color: string; clayClass: string }> = {
  driver: {
    label: 'Motorista (Diária)',
    color: '#0284C7',
    clayClass: 'clay-ocean',
  },
  fuel: {
    label: 'Combustível',
    color: '#EA580C',
    clayClass: 'clay-coral',
  },
  maintenance: {
    label: 'Manutenção & Óleo',
    color: '#D97706',
    clayClass: 'clay-amber',
  },
  other: {
    label: 'Outros Gastos',
    color: '#9333EA',
    clayClass: 'clay-purple',
  },
};

/**
 * Calculates subsequent monthly dates for installment payments.
 * Clamps day of month when target month has fewer days (e.g. Jan 31 -> Feb 28).
 */
export function getInstallmentDate(startDateStr: string, monthOffset: number): string {
  const [yearStr, monthStr, dayStr] = startDateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1; // 0-indexed
  const day = parseInt(dayStr, 10);

  month += monthOffset;
  year += Math.floor(month / 12);
  month = ((month % 12) + 12) % 12;

  const maxDays = new Date(year, month + 1, 0).getDate();
  const targetDay = Math.min(day, maxDays);

  const formattedYear = String(year);
  const formattedMonth = String(month + 1).padStart(2, '0');
  const formattedDay = String(targetDay).padStart(2, '0');

  return `${formattedYear}-${formattedMonth}-${formattedDay}`;
}
