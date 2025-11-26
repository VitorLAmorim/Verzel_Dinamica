import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Reconciliation } from "../entities/Reconciliation";
import { Store } from "../entities/Store";
import { Analyst } from "../entities/Analyst";

export class ReconciliationController {
  private reconciliationRepository = AppDataSource.getRepository(Reconciliation);
  private storeRepository = AppDataSource.getRepository(Store);
  private analystRepository = AppDataSource.getRepository(Analyst);

  // Update reconciliation status
  async updateReconciliationStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          message: "Status is required"
        });
      }

      const validStatuses = ['open', 'closed', 'pending_return', 'not_integrated'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed statuses: " + validStatuses.join(", ")
        });
      }

      const reconciliation = await this.reconciliationRepository.findOne({ where: { id } });

      if (!reconciliation) {
        return res.status(404).json({
          message: "Reconciliation not found"
        });
      }

      // Update status and notes
      reconciliation.status = status;
      if (notes !== undefined) {
        reconciliation.notes = notes;
      }

      await this.reconciliationRepository.save(reconciliation);

      return res.json({
        message: "Reconciliation status updated successfully",
        reconciliation: {
          id: reconciliation.id,
          store_id: reconciliation.store_id,
          date: reconciliation.date,
          status: reconciliation.status,
          notes: reconciliation.notes,
          updated_at: reconciliation.updated_at
        }
      });
    } catch (error: any) {
      console.error("Error updating reconciliation status:", error);
      return res.status(500).json({
        message: "Error updating reconciliation status",
        error: error.message
      });
    }
  }

  // Create new reconciliation
  async createReconciliation(req: Request, res: Response): Promise<Response> {
    try {
      const { store_id, date, analyst_id, status = 'open', notes } = req.body;

      if (!store_id || !date) {
        return res.status(400).json({
          message: "store_id and date are required"
        });
      }

      // Check if store exists
      const store = await this.storeRepository.findOne({ where: { id: store_id } });
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      // Check if analyst exists (if provided)
      if (analyst_id) {
        const analyst = await this.analystRepository.findOne({ where: { id: analyst_id } });
        if (!analyst) {
          return res.status(404).json({ message: "Analyst not found" });
        }
      }

      // Check if reconciliation already exists for this store and date
      const existingReconciliation = await this.reconciliationRepository.findOne({
        where: { store_id, date }
      });

      if (existingReconciliation) {
        return res.status(400).json({
          message: "Reconciliation already exists for this store and date"
        });
      }

      const reconciliation = this.reconciliationRepository.create({
        store_id,
        date: new Date(date),
        analyst_id: analyst_id || null,
        status,
        notes
      });

      await this.reconciliationRepository.save(reconciliation);

      return res.status(201).json({
        message: "Reconciliation created successfully",
        reconciliation
      });
    } catch (error: any) {
      console.error("Error creating reconciliation:", error);
      return res.status(500).json({
        message: "Error creating reconciliation",
        error: error.message
      });
    }
  }

}