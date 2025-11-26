#!/usr/bin/env ts-node

// Script simplificado para executar o seed do banco
// execute: npx ts-node seed-database.ts

import { seedDatabase } from './src/services/seed-data';

console.log('🚀 Iniciando script de seed do banco de dados...');
console.log('==========================================================');

// Verificar variáveis de ambiente
if (!process.env.DB_HOST && !process.env.DB_USER) {
  console.log('⚙️  Usando configurações padrão do PostgreSQL...');
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USER = 'postgres';
  process.env.DB_PASSWORD = 'postgres';
  process.env.DB_NAME = 'conciliacao_caixa';
}

// Executar o seed
seedDatabase()
  .then(() => {
    console.log('✅ Seed concluído com sucesso!');
    console.log('🎉 Banco de dados populado com dados aleatórios!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro durante o seed:', error.message);
    if (error.code === '23505') {
      console.log('💡 Dica: Tente limpar o banco de dados com:');
      console.log('   docker-compose down -v');
      console.log('   docker-compose up -d');
    }
    process.exit(1);
  });