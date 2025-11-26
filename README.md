# Sistema de Conciliação de Caixa

Sistema para conciliação de caixas de rede de varejo desenvolvido para o processo trainee da Verzel.

## Estrutura do Projeto

```
sistema-conciliacao/
├── backend/          # API Node.js + Express + TypeORM
├── frontend/         # React + TypeScript
├── database/         # Scripts PostgreSQL
└── docker-compose.yml
```

## Tecnologias

### Backend
- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL

### Frontend
- React
- TypeScript
- Vite
- CSS Modules

## Início Rápido

### 1. Subir PostgreSQL
```bash
docker-compose up -d postgres
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```

## Endpoints Disponíveis

- GET /api/lojas
- GET /api/caixas
- GET /api/depositos
- GET /api/solicitacoes
- GET /api/analistas

## Funcionalidades

1. Lista de lojas com status de conciliação
2. Tela de conciliação detalhada por loja/data
3. Conferência de depósitos
4. Solicitação de evidências para lojas

## Equipe

Este projeto está sendo desenvolvido como parte do processo seletivo trainee da Verzel.