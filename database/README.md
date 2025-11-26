# Database Seed - Sistema de Conciliação de Caixa

Este diretório contém scripts para gerar dados aleatórios para o sistema de conciliação de caixa.

## Arquivos

- `init.sql` - Script de criação das tabelas (executado automaticamente pelo Docker)
- `../backend/src/services/seed-data.ts` - Script TypeScript principal usando Faker.js
- `../backend/seed-database.ts` - Script simplificado para execução direta
- `seed.sh` - Script shell (Linux/Mac) para facilitar a execução
- `seed.bat` - Script batch (Windows) para facilitar a execução

## Como Usar

### Pré-requisitos

1. **Docker** instalado e rodando
2. **Node.js** instalado (versão 16+)
3. Container do PostgreSQL rodando

### Passos

1. **Iniciar o banco de dados:**
   ```bash
   docker-compose up -d
   ```

2. **Rodar o script de geração de dados:**

   **Método mais simples (Recomendado):**
   ```bash
   cd backend
   npx ts-node seed-database.ts
   ```

### Solução de Problemas

Se ocorrer erro de chave duplicada (`duplicate key value violates unique constraint`):

```bash
# Limpar completamente o banco de dados
docker-compose down -v
docker-compose up -d
# Aguardar o banco iniciar
cd backend && npx ts-node seed-database.ts
```

## Configurações do Script

O script `seed-data.ts` possui as seguintes configurações na constante `CONFIG`:

- `STORES: 150` - Número de lojas
- `ANALYSTS: 8` - Número de analistas
- `DAYS_BACK: 60` - Quantos dias para trás gerar dados
- `SALES_PER_CASH_REGISTER: { min: 1, max: 8 }` - Vendas por caixa
- `DEPOSITS_PER_SALE: { min: 1, max: 4 }` - Depósitos por venda
- `EVIDENCE_REQUESTS_PER_RECONCILIATION: { min: 0, max: 3 }` - Solicitações por conciliação

## Dados Gerados

O script gera dados realistas para as seguintes entidades:

### 📊 Quantidades
- **Analistas**: 8 usuários com emails e nomes aleatórios
- **Lojas**: 150 lojas com CNPJ e endereços aleatórios
- **Caixas**: 1 caixa por loja por dia (últimos 60 dias)
- **Vendas**: 1-8 vendas por caixa com valores aleatórios
- **Depósitos**: 1-3 depósitos por caixa
- **Conciliações**: 1 conciliação por loja por dia
- **Solicitações de Evidência**: 0-3 por conciliação

### 🎯 Características dos Dados
- **Valores monetários**: R$ 100 a R$ 50.000
- **Data**: Últimos 60 dias (sem duplicatas)
- **Relacionamentos**: Muitos-para-muitos entre vendas e depósitos
- **Status**: Variedade de status para conciliações
- **Textos**: Descrições e observações em português brasileiro


## Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend` com as seguintes variáveis (opcional, script usa padrões):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=conciliacao_caixa
```

## Estrutura do Projeto

```
backend/
├── src/
│   ├── services/
│   │   └── seed-data.ts          # Script principal de geração de dados
│   └── seed-database.ts          # Script simplificado para execução
└── database/
    ├── init.sql                  # Criação das tabelas
    ├── seed.sh                   # Script Linux/Mac
    └── seed.bat                  # Script Windows
```

---

**Desenvolvido para processo trainee Verzel** 🚀