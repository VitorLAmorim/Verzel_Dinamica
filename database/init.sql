-- Script de criação de tabelas do banco de dados
-- Este script será executado automaticamente quando o container PostgreSQL iniciar

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Schema principal
CREATE SCHEMA IF NOT EXISTS conciliacao;
SET search_path TO conciliacao, public;

-- Tabela de Analistas
CREATE TABLE analysts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Stores (Lojas)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de CashRegisters (Caixas)
CREATE TABLE cash_registers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, date)
);

-- Tabela de Sales (Vendas)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    description TEXT,
    cash DECIMAL(15,2) DEFAULT 0,
    pix DECIMAL(15,2) DEFAULT 0,
    digital_wallets DECIMAL(15,2) DEFAULT 0,
    credit_card DECIMAL(15,2) DEFAULT 0,
    debit_card DECIMAL(15,2) DEFAULT 0,
    net_sales DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Deposits (Depósitos)
CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    deposit_date DATE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Reconciliations (Conciliações)
CREATE TABLE reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    analyst_id UUID REFERENCES analysts(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'closed', 'pending_return', 'not_integrated')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, date)
);

-- Tabela de EvidenceRequests (Solicitações de Evidência)
CREATE TABLE evidence_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reconciliation_id UUID NOT NULL REFERENCES reconciliations(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'responded', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_cash_registers_store_id ON cash_registers(store_id);
CREATE INDEX idx_cash_registers_date ON cash_registers(date);
CREATE INDEX idx_sales_cash_register_id ON sales(cash_register_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_deposits_cash_register_id ON deposits(cash_register_id);
CREATE INDEX idx_deposits_sale_id ON deposits(sale_id);
CREATE INDEX idx_deposits_verified ON deposits(verified);
CREATE INDEX idx_reconciliations_store_id ON reconciliations(store_id);
CREATE INDEX idx_reconciliations_analyst_id ON reconciliations(analyst_id);
CREATE INDEX idx_reconciliations_date ON reconciliations(date);
CREATE INDEX idx_reconciliations_status ON reconciliations(status);
CREATE INDEX idx_evidence_requests_reconciliation_id ON evidence_requests(reconciliation_id);

COMMIT;