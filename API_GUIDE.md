# 📚 API Guide - Cash Reconciliation System

Guia completo com inputs e outputs de todas as rotas da API para desenvolvimento do frontend.

**Base URL:** `http://localhost:3333/api`

---

## 🏪 STORES

### 1. List Stores
**Endpoint:** `GET /api/stores`

**Query Params:**
```typescript
interface ListStoresParams {
  start_date?: string;      // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
  end_date?: string;        // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
  status?: string;          // "open" | "closed" | "pending_return" | "not_integrated"
  limit?: number;           // Padrão: 50
  offset?: number;          // Padrão: 0 (para paginação)
}
```

**Response (200):**
```typescript
interface ListStoresResponse {
  stores: Store[];          // Array de entidades Store com relations
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
  filters: {
    start_date?: string;
    end_date?: string;
    status?: string;
  };
}
```

### 2. Get Store Closures
**Endpoint:** `GET /api/stores/closure`

**Query Params:**
```typescript
interface StoreClosureParams {
  date: string;              // Formato: "YYYY-MM-DD" (obrigatório)
  status?: string;          // "open" | "closed" | "pending_return" | "not_integrated" (opcional)
}
```

**Response (200):**
```typescript
interface StoreClosureResponse {
  date: string;              // Data da consulta
  total_stores: number;       // Total de lojas no sistema
  stores_with_register: number;   // Lojas que possuem caixa na data
  stores_without_register: number;   // Lojas sem caixa na data
  closures: {
    store_id: string;
    store_name: string;
    date: string;
    total_sales: number;     // Soma de todas as vendas do dia (0 se não houver caixa)
    total_deposits: number;  // Soma de todos os depósitos do dia (0 se não houver caixa)
    balance: number;         // total_sales - total_deposits
    reconciliation_status: string | null;  // "not_integrated" se não houver caixa
    has_register: boolean;   // true se a loja possui caixa na data
  }[];
}
```

**Exemplo de Response:**
```json
{
  "date": "2024-01-15",
  "total_stores": 150,
  "stores_with_register": 142,
  "stores_without_register": 8,
  "closures": [
    {
      "store_id": "uuid-da-loja-1",
      "store_name": "Store Example 1",
      "date": "2024-01-15",
      "total_sales": 15000.00,
      "total_deposits": 12000.00,
      "balance": 3000.00,
      "reconciliation_status": "open",
      "has_register": true
    },
    {
      "store_id": "uuid-da-loja-2",
      "store_name": "Store Example 2",
      "date": "2024-01-15",
      "total_sales": 0,
      "total_deposits": 0,
      "balance": 0,
      "reconciliation_status": "not_integrated",
      "has_register": false
    }
  ]
}
```

---

## 💰 DEPOSITS

### 1. List Deposits
**Endpoint:** `GET /api/deposits`

**Query Params:**
```typescript
interface ListDepositsParams {
  store_id?: string;         // UUID da loja
  start_date?: string;       // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
  end_date?: string;         // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
  verified?: boolean;        // true | false
  sale_id?: string;         // UUID da venda
  limit?: number;           // Padrão: 50
  offset?: number;          // Padrão: 0
}
```

**Response (200):**
```typescript
interface ListDepositsResponse {
  deposits: Deposit[];       // Array de entidades Deposit com relations (CashRegister, Store, Sale)
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
  filters: {
    store_id?: string;
    start_date?: string;
    end_date?: string;
    verified?: boolean;
    sale_id?: string;
  };
  summary: {
    total_amount: number;
    verified_amount: number;
    unverified_amount: number;
  };
}
```

### 2. Update Deposit Status
**Endpoint:** `PUT /api/deposits/:id/status`

**Request Body:**
```typescript
interface UpdateDepositStatusRequest {
  verified: boolean;         // true | false (obrigatório)
}
```

**Response (200):**
```typescript
interface UpdateDepositStatusResponse {
  message: string;
  deposit: {
    id: string;
    code: string;
    amount: string;
    verified: boolean;
    updated_at: string;
  };
}
```

### 3. Get Deposit Details
**Endpoint:** `GET /api/deposits/:id`

**Response (200):**
```typescript
interface DepositDetailsResponse {
  deposit: Deposit;          // Entidade Deposit com relations (CashRegister, Store, Sale)
}
```

---

## 📊 RECONCILIATIONS

### 1. Update Reconciliation Status
**Endpoint:** `PUT /api/reconciliations/:id/status`

**Request Body:**
```typescript
interface UpdateReconciliationStatusRequest {
  status: string;            // "open" | "closed" | "pending_return" | "not_integrated" (obrigatório)
  notes?: string;            // Opcional
}
```

**Response (200):**
```typescript
interface UpdateReconciliationStatusResponse {
  message: string;
  reconciliation: {
    id: string;
    store_id: string;
    analyst_id: string | null;
    date: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

### 2. Create Reconciliation
**Endpoint:** `POST /api/reconciliations`

**Request Body:**
```typescript
interface CreateReconciliationRequest {
  store_id: string;          // UUID da loja (obrigatório)
  analyst_id?: string;       // UUID do analista (opcional)
  date: string;              // Formato: "YYYY-MM-DD" (obrigatório)
  status?: string;           // Padrão: "open"
  notes?: string;            // Opcional
}
```

**Response (201):**
```typescript
interface CreateReconciliationResponse {
  message: string;
  reconciliation: {
    id: string;
    store_id: string;
    analyst_id: string | null;
    date: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
}
```

---

## 📋 EVIDENCE REQUESTS

### 1. Create Evidence Request
**Endpoint:** `POST /api/evidence-requests`

**Request Body:**
```typescript
interface CreateEvidenceRequestRequest {
  reconciliation_id: string; // UUID da conciliação (obrigatório)
  message: string;           // Mensagem da solicitação (obrigatório)
  status?: string;          // Padrão: "pending"
}
```

**Response (201):**
```typescript
interface CreateEvidenceRequestResponse {
  message: string;
  evidence_request: {
    id: string;
    reconciliation_id: string;
    message: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  email_simulated: {
    to: string;
    subject: string;
    message: string;
    request_date: string;
    store_name: string;
    store_id: string;
    reconciliation_id: string;
    reconciliation_date: string;
    reconciliation_status: string;
  };
}
```

### 2. Update Evidence Request Status
**Endpoint:** `PUT /api/evidence-requests/:id/status`

**Request Body:**
```typescript
interface UpdateEvidenceStatusRequest {
  status: string;            // "pending" | "responded" | "canceled" (obrigatório)
}
```

**Response (200):**
```typescript
interface UpdateEvidenceStatusResponse {
  message: string;
  evidence_request: {
    id: string;
    reconciliation_id: string;
    message: string;
    status: string;
    updated_at: string;
  };
}
```

### 3. List Evidence Requests by Store
**Endpoint:** `GET /api/evidence-requests/store/:storeId`

**Query Params:**
```typescript
interface ListEvidenceByStoreParams {
  status?: string;          // "pending" | "responded" | "canceled"
  start_date?: string;      // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
  end_date?: string;        // Formato: "YYYY-MM-DD" -> convertido para range do dia inteiro
}
```

**Response (200):**
```typescript
interface ListEvidenceByStoreResponse {
  store: {
    id: string;
    name: string;
    cnpj: string;
    address: string;
  };
  evidence_requests: EvidenceRequest[];
  summary: {
    total: number;
    by_status: {
      pending: number;
      responded: number;
      canceled: number;
    };
  };
  filters: {
    status?: string;
    start_date?: string;
    end_date?: string;
  };
}
```

---

## ⚠️ CÓDIGOS DE ERRO

**Respostas de Erro Comuns:**

```typescript
// 400 Bad Request
interface ErrorResponse {
  message: string;
  error?: string;
}

// 404 Not Found
interface NotFoundResponse {
  message: string;
}

// 500 Internal Server Error
interface ServerErrorResponse {
  message: string;
  error: string;
}
```

**Exemplos de Mensagens de Erro:**
- `"reconciliation_id e message são obrigatórios"`
- `"Status inválido. Status permitidos: open, closed, pending_return, not_integrated"`
- `"Loja não encontrada"`
- `"Depósito não encontrado"`
- `"Campo 'verified' é obrigatório (true/false)"`

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Filtros de Data:** Todos os filtros de data (`data`) aceitam formato `"YYYY-MM-DD"` e são automaticamente convertidos para o range completo do dia (00:00:00 até 23:59:59.999).

2. **Paginação:** Use os parâmetros `limit` e `offset` para paginação. O response inclui informações de paginação com total de registros.

3. **UUIDs:** Todos os IDs são strings no formato UUID v4.

4. **Valores Monetários:** Retornados como strings para manter precisão decimal.

5. **Datas:** Retornadas no formato ISO 8601. Campos `date` das entidades estão em formato `YYYY-MM-DD`.

6. **Status Válidos:**
   - Reconciliações: `"open"`, `"closed"`, `"pending_return"`, `"not_integrated"`
   - Evidence Requests: `"pending"`, `"responded"`, `"canceled"`

---

**Desenvolvido para processo eliteDev Verzel** 🚀