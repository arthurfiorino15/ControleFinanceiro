import { Transaction, VehicleConfig, AuthCredentials } from '../types/finance';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  loadTransactions as localLoadTransactions,
  saveTransactions as localSaveTransactions,
  loadVehicleConfig as localLoadVehicleConfig,
  saveVehicleConfig as localSaveVehicleConfig,
  loadAuthCredentials as localLoadAuthCredentials,
  saveAuthCredentials as localSaveAuthCredentials,
} from '../utils/storage';

// ==========================================
// TRANSAÇÕES
// ==========================================

export async function fetchTransactions(): Promise<Transaction[]> {
  if (!isSupabaseConfigured || !supabase) {
    return localLoadTransactions();
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar transações do Supabase, recorrendo ao cache local:', error.message);
      return localLoadTransactions();
    }

    if (!data || data.length === 0) {
      // Base vazia no Supabase
      localSaveTransactions([]);
      return [];
    }

    // Mapear colunas do banco (snake_case) para camelCase do TypeScript
    const mapped: Transaction[] = data.map((row: any) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      amount: Number(row.amount),
      description: row.description || undefined,
      createdAt: Number(row.created_at),
      isPaid: row.is_paid !== false,
      paidAt: row.paid_at || undefined,
      ...(row.type === 'revenue'
        ? { tripsCount: row.trips_count != null ? Number(row.trips_count) : undefined }
        : {
            category: row.category,
            driverBaseAmount: row.driver_base_amount != null ? Number(row.driver_base_amount) : undefined,
            driverBonusAmount: row.driver_bonus_amount != null ? Number(row.driver_bonus_amount) : undefined,
            liters: row.liters != null ? Number(row.liters) : undefined,
            km: row.km != null ? Number(row.km) : undefined,
            isInstallment: Boolean(row.is_installment),
            installmentGroupId: row.installment_group_id || undefined,
            installmentCurrent: row.installment_current != null ? Number(row.installment_current) : undefined,
            installmentTotal: row.installment_total != null ? Number(row.installment_total) : undefined,
            totalInstallmentAmount: row.total_installment_amount != null ? Number(row.total_installment_amount) : undefined,
          }),
    }));

    // Sincroniza cache local
    localSaveTransactions(mapped);
    return mapped;
  } catch (err) {
    console.error('Falha na conexão com Supabase:', err);
    return localLoadTransactions();
  }
}

export async function upsertTransactionsSupabase(transactions: Transaction[]): Promise<void> {
  if (transactions.length === 0) return;

  if (!isSupabaseConfigured || !supabase) return;

  try {
    const rows = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      date: t.date,
      amount: t.amount,
      description: t.description || null,
      category: t.type === 'expense' ? t.category : null,
      trips_count: t.type === 'revenue' ? t.tripsCount || null : null,
      driver_base_amount: t.type === 'expense' ? t.driverBaseAmount || null : null,
      driver_bonus_amount: t.type === 'expense' ? t.driverBonusAmount || null : null,
      liters: t.type === 'expense' ? t.liters || null : null,
      km: t.type === 'expense' ? t.km || null : null,
      is_installment: t.type === 'expense' ? Boolean(t.isInstallment) : false,
      installment_group_id: t.type === 'expense' ? t.installmentGroupId || null : null,
      installment_current: t.type === 'expense' ? t.installmentCurrent || null : null,
      installment_total: t.type === 'expense' ? t.installmentTotal || null : null,
      total_installment_amount: t.type === 'expense' ? t.totalInstallmentAmount || null : null,
      is_paid: t.isPaid !== false,
      paid_at: t.paidAt || null,
      created_at: t.createdAt,
    }));

    const { error } = await supabase.from('transactions').upsert(rows);
    if (error) {
      console.warn('Erro ao persistir transações no Supabase:', error.message);
    }
  } catch (err) {
    console.error('Falha de rede ao persistir no Supabase:', err);
  }
}

export async function deleteTransactionSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) console.warn('Erro ao deletar transação no Supabase:', error.message);
  } catch (err) {
    console.error('Falha de rede ao deletar no Supabase:', err);
  }
}

export async function deleteTransactionGroupSupabase(installmentGroupId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('installment_group_id', installmentGroupId);
    if (error) console.warn('Erro ao deletar grupo de parcelas no Supabase:', error.message);
  } catch (err) {
    console.error('Falha de rede ao deletar grupo no Supabase:', err);
  }
}

// ==========================================
// CONFIGURAÇÃO DO VEÍCULO
// ==========================================

export async function fetchVehicleConfig(): Promise<VehicleConfig> {
  if (!isSupabaseConfigured || !supabase) {
    return localLoadVehicleConfig();
  }

  try {
    const { data, error } = await supabase
      .from('vehicle_config')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return localLoadVehicleConfig();
    }

    const config: VehicleConfig = {
      model: data.model,
      plate: data.plate,
      driverName: data.driver_name,
      defaultDriverDailyRate: Number(data.default_driver_daily_rate),
    };

    localSaveVehicleConfig(config);
    return config;
  } catch (err) {
    console.error('Falha ao buscar vehicle_config do Supabase:', err);
    return localLoadVehicleConfig();
  }
}

export async function saveVehicleConfigSupabase(config: VehicleConfig): Promise<void> {
  localSaveVehicleConfig(config);

  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('vehicle_config').upsert({
      id: 'default',
      model: config.model,
      plate: config.plate,
      driver_name: config.driverName,
      default_driver_daily_rate: config.defaultDriverDailyRate,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Falha ao salvar vehicle_config no Supabase:', err);
  }
}

// ==========================================
// CREDENCIAIS DE ACESSO (LOGIN)
// ==========================================

export async function fetchAuthCredentials(): Promise<AuthCredentials> {
  if (!isSupabaseConfigured || !supabase) {
    return localLoadAuthCredentials();
  }

  try {
    const { data, error } = await supabase
      .from('auth_credentials')
      .select('username, password')
      .eq('id', 'admin')
      .maybeSingle();

    if (error || !data) {
      return localLoadAuthCredentials();
    }

    const creds: AuthCredentials = {
      username: data.username,
      password: data.password,
    };

    localSaveAuthCredentials(creds);
    return creds;
  } catch (err) {
    console.error('Falha ao buscar auth_credentials no Supabase:', err);
    return localLoadAuthCredentials();
  }
}

export async function saveAuthCredentialsSupabase(creds: AuthCredentials): Promise<void> {
  localSaveAuthCredentials(creds);

  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('auth_credentials').upsert({
      id: 'admin',
      username: creds.username,
      password: creds.password,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Falha ao salvar auth_credentials no Supabase:', err);
  }
}
