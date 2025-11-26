import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Store } from "../entities/Store";
import { CashRegister } from "../entities/CashRegister";
import { Sale } from "../entities/Sale";
import { Deposit } from "../entities/Deposit";
import { Reconciliation } from "../entities/Reconciliation";

export class StoreController {
  private storeRepository = () => AppDataSource.getRepository(Store);
  private cashRegisterRepository = () => AppDataSource.getRepository(CashRegister);
  private saleRepository = () => AppDataSource.getRepository(Sale);
  private depositRepository = () => AppDataSource.getRepository(Deposit);
  private reconciliationRepository = () => AppDataSource.getRepository(Reconciliation);

  // Get store closures for all stores on specific date
  async getStoreClosures(req: Request, res: Response): Promise<Response> {
    try {
      const { date, status } = req.query;

      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      // Get all stores
      const stores = await this.storeRepository().find({
        order: { name: "ASC" }
      });

      // Get all reconciliations for the specified date
      const reconciliationQueryBuilder = this.reconciliationRepository().createQueryBuilder("reconciliation")
        .leftJoinAndSelect("reconciliation.analyst", "analyst")
        .leftJoin("reconciliation.store", "store")
        .addSelect(["store.id", "store.name"])
        .where("reconciliation.date = :date", { date: date as string });

      if (status) {
        reconciliationQueryBuilder.andWhere("reconciliation.status = :status", { status });
      }

      const reconciliations = await reconciliationQueryBuilder.getMany();

      // Map reconciliations by store_id for easy access
      const reconciliationMap = new Map();
      reconciliations.forEach(r => {
        reconciliationMap.set(r.store_id, r);
      });

      // Get all cash registers for the specified date
      const cashRegisters = await this.cashRegisterRepository().find({
        where: { date: new Date(date as string) },
        relations: ["sales", "deposits"]
      });

      // Group cash registers by store_id
      const cashRegistersByStore = new Map();
      cashRegisters.forEach(cr => {
        if (!cashRegistersByStore.has(cr.store_id)) {
          cashRegistersByStore.set(cr.store_id, []);
        }
        cashRegistersByStore.get(cr.store_id).push(cr);
      });

      // Process each store
      const closures = [];

      for (const store of stores) {
        const storeCashRegisters: CashRegister[] = cashRegistersByStore.get(store.id) || [];
        const storeReconciliation = reconciliationMap.get(store.id);

        let totalSales = 0;
        let totalDeposits = 0;

        if (storeCashRegisters.length > 0) {
          const cashRegisterIds = storeCashRegisters.map(cr => cr.id);

          // Sum all sales for the store
          const salesSum = await this.saleRepository()
            .createQueryBuilder("sale")
            .select("SUM(sale.net_sales)", "total")
            .where("sale.cash_register_id IN (:...ids)", { ids: cashRegisterIds })
            .getRawOne();

          totalSales = parseFloat(salesSum?.total || "0");

          // Sum all deposits for the store
          const depositsSum = await this.depositRepository()
            .createQueryBuilder("deposit")
            .select("SUM(deposit.amount)", "total")
            .where("deposit.cash_register_id IN (:...ids)", { ids: cashRegisterIds })
            .getRawOne();

          totalDeposits = parseFloat(depositsSum?.total || "0");
        }

        const balance = totalSales - totalDeposits;

        // If no cash register for the date, status is not_integrated
        const reconciliationStatus = storeCashRegisters.length === 0
          ? "not_integrated"
          : (storeReconciliation?.status || null);

        closures.push({
          store_id: store.id,
          store_name: store.name,
          date: date as string,
          total_sales: totalSales,
          total_deposits: totalDeposits,
          balance: balance,
          reconciliation_status: reconciliationStatus,
          has_register: storeCashRegisters.length > 0
        });
      }

      return res.json({
        date: date as string,
        total_stores: closures.length,
        stores_with_register: closures.filter(c => c.has_register).length,
        stores_without_register: closures.filter(c => !c.has_register).length,
        closures: closures
      });
    } catch (error: any) {
      console.error("Error getting store closures:", error);
      return res.status(500).json({
        message: "Error getting store closures",
        error: error.message
      });
    }
  }
}