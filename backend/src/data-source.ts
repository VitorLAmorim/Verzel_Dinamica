import "reflect-metadata";
import { DataSource } from "typeorm";
import { Store } from "./entities/Store";
import { CashRegister } from "./entities/CashRegister";
import { Sale } from "./entities/Sale";
import { Deposit } from "./entities/Deposit";
import { EvidenceRequest } from "./entities/EvidenceRequest";
import { Analyst } from "./entities/Analyst";
import { Reconciliation } from "./entities/Reconciliation";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "conciliacao_caixa",
  synchronize: false, // true para development (creates tables automatically)
  logging: true,
  entities: [Store, CashRegister, Sale, Deposit, EvidenceRequest, Analyst, Reconciliation],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});