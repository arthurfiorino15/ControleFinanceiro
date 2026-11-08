-- Script de Criação das Tabelas no Supabase
-- Execute este script no SQL Editor do painel do seu projeto Supabase

-- 1. Tabela de Transações (Receitas e Despesas)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('driver', 'fuel', 'maintenance', 'other')),
  trips_count INTEGER,
  driver_base_amount NUMERIC(12, 2),
  driver_bonus_amount NUMERIC(12, 2),
  liters NUMERIC(8, 2),
  km NUMERIC(10, 2),
  is_installment BOOLEAN DEFAULT FALSE,
  installment_group_id TEXT,
  installment_current INTEGER,
  installment_total INTEGER,
  total_installment_amount NUMERIC(12, 2),
  is_paid BOOLEAN DEFAULT TRUE,
  paid_at TIMESTAMPTZ,
  created_at BIGINT NOT NULL
);

-- 2. Tabela de Configuração do Veículo
CREATE TABLE IF NOT EXISTS vehicle_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  default_driver_daily_rate NUMERIC(12, 2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão inicial caso não exista
INSERT INTO vehicle_config (id, model, plate, driver_name, default_driver_daily_rate)
VALUES ('default', 'Chevrolet Onix Plus 1.0 Turbo', 'BRA-2E19', 'Carlos Eduardo Silva', 130.00)
ON CONFLICT (id) DO NOTHING;

-- 3. Tabela de Credenciais de Acesso (Login)
CREATE TABLE IF NOT EXISTS auth_credentials (
  id TEXT PRIMARY KEY DEFAULT 'admin',
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir credenciais padrão iniciais
INSERT INTO auth_credentials (id, username, password)
VALUES ('admin', 'Arthur', 'Arthurfiorino')
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar Row Level Security (RLS) e Políticas de Acesso Público para Anon Key
-- (Como o aplicativo utiliza autenticação própria fixa simplificada sem Supabase Auth)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público anônimo a transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público anônimo a vehicle_config" ON vehicle_config
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acesso público anônimo a auth_credentials" ON auth_credentials
  FOR ALL USING (true) WITH CHECK (true);
