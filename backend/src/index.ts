import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import storeRoutes from "./routes/stores";
import depositRoutes from "./routes/deposits";
import evidenceRequestRoutes from "./routes/evidence-requests";
import reconciliationRoutes from "./routes/reconciliations";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/stores", storeRoutes);
app.use("/api/deposits", depositRoutes);
app.use("/api/evidence-requests", evidenceRequestRoutes);
app.use("/api/reconciliations", reconciliationRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({
    message: "Cash Reconciliation API - Verzel",
    entities: {
      stores: "Store entity",
      cash_registers: "CashRegister entity",
      sales: "Sale entity",
      deposits: "Deposit entity",
      analysts: "Analyst entity",
      reconciliations: "Reconciliation entity",
      evidence_requests: "EvidenceRequest entity"
    },
    relationships: {
      "Store → CashRegister": "OneToMany",
      "CashRegister → Sale": "OneToMany",
      "Sale → Deposit": "ManyToMany (direct)",
      "Reconciliation → Analyst": "ManyToOne",
      "Reconciliation → Store": "ManyToOne",
      "Reconciliation → EvidenceRequest": "OneToMany"
    },
    usage: {
      "total_deposit_amount": "SUM(deposit.amount) FROM sale_deposits WHERE sale_id = ?",
      "sale_with_deposits": "sale.deposits array contains all related deposits"
    }
  });
});

// Inicializar banco de dados e servidor
async function initializeServer() {
  try {
    // Conectar ao banco de dados
    await AppDataSource.initialize();
    console.log("✅ Conexão com PostgreSQL estabelecida com sucesso!");

    // Sincronizar entidades (desenvolvimento)
    if (process.env.NODE_ENV === "development") {
      await AppDataSource.synchronize(true);
      console.log("🔄 Banco de dados sincronizado (tabelas criadas/atualizadas)");
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

initializeServer();