import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
// import lojaRoutes from "./routes/lojaRoutes";
// import caixaRoutes from "./routes/caixaRoutes";
// import depositoRoutes from "./routes/depositoRoutes";
// import solicitacaoRoutes from "./routes/solicitacaoRoutes";
// import analistaRoutes from "./routes/analistaRoutes";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
// app.use("/api/lojas", lojaRoutes);
// app.use("/api/caixas", caixaRoutes);
// app.use("/api/depositos", depositoRoutes);
// app.use("/api/solicitacoes", solicitacaoRoutes);
// app.use("/api/analistas", analistaRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API de Conciliação de Caixa - Verzel" });
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
      console.log("📚 Rotas disponíveis:");
    });

  } catch (error) {
    console.error("❌ Erro ao inicializar servidor:", error);
    process.exit(1);
  }
}

initializeServer();