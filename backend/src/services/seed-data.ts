#!/usr/bin/env ts-node

import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '../backend/.env' });

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'conciliacao_caixa',
});

interface Analyst {
  id: string;
  name: string;
  email: string;
}

interface Store {
  id: string;
  name: string;
  cnpj: string;
  address: string;
}

interface CashRegister {
  id: string;
  store_id: string;
  date: Date;
}

interface Sale {
  id: string;
  cash_register_id: string;
  sale_date: Date;
  description: string;
  cash: number;
  pix: number;
  digital_wallets: number;
  credit_card: number;
  debit_card: number;
  net_sales: number;
}

interface Deposit {
  id: string;
  cash_register_id: string;
  code: string;
  amount: number;
  deposit_date: Date;
  verified: boolean;
  sale_id?: string;
}

interface Reconciliation {
  id: string;
  store_id: string;
  analyst_id: string | null;
  date: Date;
  status: 'open' | 'closed' | 'pending_return' | 'not_integrated';
  notes: string;
}

// Configurações de geração de dados
const CONFIG = {
  STORES: 150,      // Número de lojas
  ANALYSTS: 8,      // Número de analistas
  DAYS_BACK: 60,    // Quantos dias para trás gerar dados
  SALES_PER_CASH_REGISTER: { min: 1, max: 8 },  // Vendas por caixa
  DEPOSITS_PER_SALE: { min: 1, max: 4 },       // Depósitos por venda
  EVIDENCE_REQUESTS_PER_RECONCILIATION: { min: 0, max: 3 }, // Solicitações por conciliação
};

// Gerar CNPJ válido
function generateCNPJ(): string {
  const n1 = faker.number.int({ min: 0, max: 9 });
  const n2 = faker.number.int({ min: 0, max: 9 });
  const n3 = faker.number.int({ min: 0, max: 9 });
  const n4 = faker.number.int({ min: 0, max: 9 });
  const n5 = faker.number.int({ min: 0, max: 9 });
  const n6 = faker.number.int({ min: 0, max: 9 });
  const n7 = faker.number.int({ min: 0, max: 9 });
  const n8 = faker.number.int({ min: 0, max: 9 });
  const n9 = faker.number.int({ min: 0, max: 9 });
  const n10 = faker.number.int({ min: 0, max: 9 });
  const n11 = faker.number.int({ min: 0, max: 9 });
  const n12 = faker.number.int({ min: 0, max: 9 });

  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${n10}${n11}${n12}`;
}

// Gerar código de depósito
function generateDepositCode(depositDate?: Date): string {
  const date = depositDate || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = faker.number.int({ min: 1000, max: 9999 });
  return `DEP${year}${month}${day}${random}`;
}

// Gerar valor monetário aleatório
function generateAmount(min: number = 100, max: number = 50000): number {
  return parseFloat(faker.number.float({ min, max, multipleOf: 0.01 }).toFixed(2));
}

// Gerar dados dos analistas
function generateAnalysts(): Analyst[] {
  const analysts: Analyst[] = [];
  const usedEmails = new Set<string>();

  for (let i = 0; i < CONFIG.ANALYSTS; i++) {
    let firstName, lastName, email;

    do {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@verzel.com`;
    } while (usedEmails.has(email));

    usedEmails.add(email);

    analysts.push({
      id: faker.string.uuid(),
      name: `${firstName} ${lastName}`,
      email,
    });
  }

  return analysts;
}

// Gerar dados das lojas
function generateStores(): Store[] {
  const stores: Store[] = [];
  const storeTypes = [
    'Shopping Center', 'Street Store', 'Mall', 'Outlet', 'Gallery',
    'Plaza', 'Corner Store', 'Department Store', 'Boutique'
  ];

  for (let i = 0; i < CONFIG.STORES; i++) {
    const storeType = faker.helpers.arrayElement(storeTypes);
    const city = faker.location.city();
    const neighborhood = faker.location.street();

    stores.push({
      id: faker.string.uuid(),
      name: `${storeType} ${faker.company.name()} - ${city}`,
      cnpj: generateCNPJ(),
      address: `${faker.location.streetAddress()}, ${neighborhood}, ${city} - ${faker.location.state()}`,
    });
  }

  return stores;
}

// Gerar caixas (um por loja por dia)
function generateCashRegisters(stores: Store[]): CashRegister[] {
  const cashRegisters: CashRegister[] = [];

  for (const store of stores) {
    for (let daysBack = CONFIG.DAYS_BACK; daysBack >= 0; daysBack--) {
        const date = new Date();
        date.setDate(date.getDate() - daysBack);

      cashRegisters.push({
        id: faker.string.uuid(),
        store_id: store.id,
        date: date,
      });
    }
  }

  return cashRegisters;
}

// Gerar vendas
function generateSales(cashRegisters: CashRegister[]): Sale[] {
  const sales: Sale[] = [];

  for (const cashRegister of cashRegisters) {
    const salesCount = faker.number.int({
      min: CONFIG.SALES_PER_CASH_REGISTER.min,
      max: CONFIG.SALES_PER_CASH_REGISTER.max
    });

    for (let i = 0; i < salesCount; i++) {
      const cash = generateAmount(500, 8000);
      const pix = generateAmount(200, 5000);
      const digital_wallets = generateAmount(100, 3000);
      const credit_card = generateAmount(1000, 15000);
      const debit_card = generateAmount(800, 8000);

      sales.push({
        id: faker.string.uuid(),
        cash_register_id: cashRegister.id,
        sale_date: cashRegister.date,
        description: faker.helpers.arrayElement([
          'Vendas do período matutino',
          'Vendas do período vespertino',
          'Vendas do período noturno',
          'Vendas do fim de semana',
          'Vendas de promoção',
          'Vendas regulares',
          'Vendas de Natal',
          'Vendas de Black Friday'
        ]),
        cash,
        pix,
        digital_wallets,
        credit_card,
        debit_card,
        net_sales: cash + pix + digital_wallets + credit_card + debit_card,
      });
    }
  }

  return sales;
}

// Gerar depósitos
function generateDeposits(cashRegisters: CashRegister[]): Deposit[] {
  const deposits: Deposit[] = [];

  for (const cashRegister of cashRegisters) {
    const depositCount = faker.number.int({
      min: 1,
      max: 3
    });

    for (let i = 0; i < depositCount; i++) {
      deposits.push({
        id: faker.string.uuid(),
        cash_register_id: cashRegister.id,
        code: generateDepositCode(cashRegister.date),
        amount: generateAmount(1000, 20000),
        deposit_date: cashRegister.date,
        verified: faker.datatype.boolean({ probability: 0.7 }),
      });
    }
  }

  return deposits;
}

// Gerar conciliações
function generateReconciliations(stores: Store[], analysts: Analyst[]): Reconciliation[] {
  const reconciliations: Reconciliation[] = [];
  const today = new Date();
  const statuses: Array<'open' | 'closed' | 'pending_return' | 'not_integrated'> = [
    'open', 'closed', 'pending_return', 'not_integrated'
  ];

  for (const store of stores) {
    // Atribuir um analista aleatório para cada loja
    const assignedAnalyst = faker.helpers.arrayElement(analysts);

    for (let daysBack = CONFIG.DAYS_BACK; daysBack >= 0; daysBack--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysBack);

      reconciliations.push({
        id: faker.string.uuid(),
        store_id: store.id,
        analyst_id: faker.datatype.boolean({ probability: 0.8 }) ? assignedAnalyst.id : null,
        date: date,
        status: faker.helpers.arrayElement(statuses),
        notes: faker.datatype.boolean({ probability: 0.6 })
          ? faker.helpers.arrayElement([
              'Conciliação aguardando verificação',
              'Documentos pendentes',
              'Valores divergentes',
              'Depósitos não conferidos',
              'Aguardando evidências',
              'Em processo de análise',
              'Conciliação finalizada com sucesso',
              'Aguardando aprovação'
            ])
          : '',
      });
    }
  }

  return reconciliations;
}

// Relacionar depósitos com vendas (um depósito para uma venda, mas uma venda pode ter múltiplos depósitos)
async function relateDepositsWithSales(sales: Sale[], deposits: Deposit[]): Promise<void> {
  for (const sale of sales) {
    const availableDeposits = deposits.filter(d =>
      d.cash_register_id === sale.cash_register_id && !d.sale_id
    );

    if (availableDeposits.length === 0) continue;

    const depositCount = faker.number.int({
      min: CONFIG.DEPOSITS_PER_SALE.min,
      max: Math.min(CONFIG.DEPOSITS_PER_SALE.max, availableDeposits.length)
    });

    const selectedDeposits = faker.helpers.arrayElements(
      availableDeposits,
      depositCount
    );

    // Atualizar cada depósito para apontar para esta venda
    for (const deposit of selectedDeposits) {
      await pool.query(
        'UPDATE conciliacao.deposits SET sale_id = $1 WHERE id = $2',
        [sale.id, deposit.id]
      );
    }
  }
}

// Gerar solicitações de evidência
async function generateEvidenceRequests(reconciliations: Reconciliation[]): Promise<void> {
  for (const reconciliation of reconciliations) {
    const requestCount = faker.number.int({
      min: CONFIG.EVIDENCE_REQUESTS_PER_RECONCILIATION.min,
      max: CONFIG.EVIDENCE_REQUESTS_PER_RECONCILIATION.max
    });

    for (let i = 0; i < requestCount; i++) {
      const statusOptions = ['pending', 'responded', 'canceled'];

      await pool.query(
        `INSERT INTO conciliacao.evidence_requests
         (id, reconciliation_id, message, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          faker.string.uuid(),
          reconciliation.id,
          faker.helpers.arrayElement([
            'Favor enviar comprovante dos depósitos do dia',
            'Enviar extrato de cartões do período',
            'Apresentar relatório de vendas diárias',
            'Comprovar valores de pix transferidos',
            'Documentar conciliação do caixa',
            'Enviar notas fiscais do período',
            'Apresentar fechamento do caixa'
          ]),
          faker.helpers.arrayElement(statusOptions),
          faker.date.recent({ days: 30 }),
          faker.date.recent({ days: 1 })
        ]
      );
    }
  }
}

// Função principal
async function seedDatabase(): Promise<void> {
  console.log('🌱 Iniciando geração de dados para o banco de dados...');

  try {
    console.log('📊 Gerando analistas...');
    const analysts = generateAnalysts();

    console.log('🏪 Gerando lojas...');
    const stores = generateStores();

    console.log('💰 Gerando caixas...');
    const cashRegisters = generateCashRegisters(stores);

    console.log('🛒 Gerando vendas...');
    const sales = generateSales(cashRegisters);

    console.log('🏦 Gerando depósitos...');
    const deposits = generateDeposits(cashRegisters);

    console.log('📋 Gerando conciliações...');
    const reconciliations = generateReconciliations(stores, analysts);

    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    await pool.connect();

    // Inserir dados
    console.log('💾 Inserindo analistas...');
    for (const analyst of analysts) {
      await pool.query(
        'INSERT INTO conciliacao.analysts (id, name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [analyst.id, analyst.name, analyst.email, 'senha123', new Date(), new Date()]
      );
    }

    console.log('💾 Inserindo lojas...');
    for (const store of stores) {
      await pool.query(
        'INSERT INTO conciliacao.stores (id, name, cnpj, address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [store.id, store.name, store.cnpj, store.address, new Date(), new Date()]
      );
    }

    console.log('💾 Inserindo caixas...');
    for (const cashRegister of cashRegisters) {
      await pool.query(
        'INSERT INTO conciliacao.cash_registers (id, store_id, date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [cashRegister.id, cashRegister.store_id, cashRegister.date, new Date(), new Date()]
      );
    }

    console.log('💾 Inserindo vendas...');
    for (const sale of sales) {
      await pool.query(
        `INSERT INTO conciliacao.sales
         (id, cash_register_id, sale_date, description, cash, pix, digital_wallets, credit_card, debit_card, net_sales, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          sale.id, sale.cash_register_id, sale.sale_date, sale.description,
          sale.cash, sale.pix, sale.digital_wallets, sale.credit_card,
          sale.debit_card, sale.net_sales, new Date(), new Date()
        ]
      );
    }

    console.log('💾 Inserindo depósitos...');
    for (const deposit of deposits) {
      await pool.query(
        'INSERT INTO conciliacao.deposits (id, cash_register_id, code, amount, deposit_date, verified, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [deposit.id, deposit.cash_register_id, deposit.code, deposit.amount, deposit.deposit_date, deposit.verified, new Date(), new Date()]
      );
    }

    console.log('💾 Inserindo conciliações...');
    for (const reconciliation of reconciliations) {
      await pool.query(
        'INSERT INTO conciliacao.reconciliations (id, store_id, analyst_id, date, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          reconciliation.id, reconciliation.store_id, reconciliation.analyst_id,
          reconciliation.date, reconciliation.status, reconciliation.notes, new Date(), new Date()
        ]
      );
    }

    console.log('🔗 Relacionando depósitos com vendas...');
    await relateDepositsWithSales(sales, deposits);

    console.log('📬 Gerando solicitações de evidência...');
    await generateEvidenceRequests(reconciliations);

    console.log('✅ Dados gerados com sucesso!');
    console.log(`📈 Resumo:
    - ${analysts.length} analistas
    - ${stores.length} lojas
    - ${cashRegisters.length} caixas
    - ${sales.length} vendas
    - ${deposits.length} depósitos
    - ${reconciliations.length} conciliações`);

  } catch (error) {
    console.error('❌ Erro ao gerar dados:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar script
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };