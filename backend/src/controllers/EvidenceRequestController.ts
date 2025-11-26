import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { EvidenceRequest } from "../entities/EvidenceRequest";
import { Reconciliation } from "../entities/Reconciliation";
import { Store } from "../entities/Store";
import { createDateRange, isValidDateString } from "../utils/dateUtils";

export class EvidenceRequestController {
  private evidenceRequestRepository = AppDataSource.getRepository(EvidenceRequest);
  private reconciliationRepository = AppDataSource.getRepository(Reconciliation);
  private storeRepository = AppDataSource.getRepository(Store);

  // Create new evidence request
  async createEvidenceRequest(req: Request, res: Response): Promise<Response> {
    try {
      const { reconciliation_id, message, status = 'pending' } = req.body;

      if (!reconciliation_id || !message) {
        return res.status(400).json({
          message: "reconciliation_id and message are required"
        });
      }

      const validStatuses = ['pending', 'responded', 'canceled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed statuses: " + validStatuses.join(", ")
        });
      }

      // Check if reconciliation exists
      const reconciliation = await this.reconciliationRepository.findOne({
        where: { id: reconciliation_id },
        relations: ['store']
      });

      if (!reconciliation) {
        return res.status(404).json({
          message: "Reconciliation not found"
        });
      }

      // Create the request
      const evidenceRequest = this.evidenceRequestRepository.create({
        reconciliation_id,
        message,
        status
      });

      await this.evidenceRequestRepository.save(evidenceRequest);

      // Simulate email content that would be sent
      const simulatedEmail = {
        to: `${reconciliation.store.name} <contact@store.com.br>`,
        subject: `Evidence Request - Reconciliation ${reconciliation.date}`,
        message: `
Dear ${reconciliation.store.name} representative,

We have identified the need to present evidence for cash flow regularization.

Reconciliation date: ${reconciliation.date}
Current status: ${reconciliation.status}

Request: ${message}

Please send the requested documentation within 48 hours for analysis by the finance team.

Best regards,
Cash Reconciliation Team - Verzel
        `.trim(),
        request_date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        store_name: reconciliation.store.name,
        store_id: reconciliation.store_id,
        reconciliation_id: reconciliation.id,
        reconciliation_date: reconciliation.date,
        reconciliation_status: reconciliation.status
      };

      return res.status(201).json({
        message: "Evidence request created successfully",
        evidence_request: {
          id: evidenceRequest.id,
          reconciliation_id: evidenceRequest.reconciliation_id,
          message: evidenceRequest.message,
          status: evidenceRequest.status,
          created_at: evidenceRequest.created_at,
          updated_at: evidenceRequest.updated_at
        },
        simulated_email: simulatedEmail
      });
    } catch (error: any) {
      console.error("Error creating evidence request:", error);
      return res.status(500).json({
        message: "Error creating evidence request",
        error: error.message
      });
    }
  }

  // Update evidence request status
  async updateEvidenceRequestStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          message: "Status is required"
        });
      }

      const validStatuses = ['pending', 'responded', 'canceled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Allowed statuses: " + validStatuses.join(", ")
        });
      }

      const evidenceRequest = await this.evidenceRequestRepository.findOne({ where: { id } });

      if (!evidenceRequest) {
        return res.status(404).json({
          message: "Evidence request not found"
        });
      }

      // Update status
      evidenceRequest.status = status;
      await this.evidenceRequestRepository.save(evidenceRequest);

      return res.json({
        message: "Evidence request status updated successfully",
        evidence_request: {
          id: evidenceRequest.id,
          reconciliation_id: evidenceRequest.reconciliation_id,
          message: evidenceRequest.message,
          status: evidenceRequest.status,
          updated_at: evidenceRequest.updated_at
        }
      });
    } catch (error: any) {
      console.error("Error updating evidence request status:", error);
      return res.status(500).json({
        message: "Error updating evidence request status",
        error: error.message
      });
    }
  }

  // List evidence requests by store
  async listEvidenceRequestsByStore(req: Request, res: Response): Promise<Response> {
    try {
      const { storeId } = req.params;
      const { status, start_date, end_date } = req.query;

      // Convert single dates to range if necessary
      let startDate = start_date;
      let endDate = end_date;

      if (start_date && typeof start_date === 'string' && isValidDateString(start_date)) {
        const range = createDateRange(start_date);
        startDate = range.start;
      }

      if (end_date && typeof end_date === 'string' && isValidDateString(end_date)) {
        const range = createDateRange(end_date);
        endDate = range.end;
      }

      // Check if store exists
      const store = await this.storeRepository.findOne({ where: { id: storeId } });
      if (!store) {
        return res.status(404).json({
          message: "Store not found"
        });
      }

      const queryBuilder = this.evidenceRequestRepository.createQueryBuilder("evidenceRequest")
        .leftJoinAndSelect("evidenceRequest.reconciliation", "reconciliation")
        .leftJoin("reconciliation.store", "store")
        .addSelect(["store.id", "store.name"])
        .where("store.id = :storeId", { storeId })
        .orderBy("evidenceRequest.created_at", "DESC");

      if (status) {
        queryBuilder.andWhere("evidenceRequest.status = :status", { status });
      }

      if (startDate) {
        queryBuilder.andWhere("evidenceRequest.created_at >= :startDate", { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere("evidenceRequest.created_at <= :endDate", { endDate });
      }

      const evidenceRequests: EvidenceRequest[] = await queryBuilder.getMany();

      return res.json({
        store: {
          id: store.id,
          name: store.name,
          cnpj: store.cnpj,
          address: store.address
        },
        evidence_requests: evidenceRequests,
        summary: {
          total: evidenceRequests.length,
          by_status: {
            pending: evidenceRequests.filter(e => e.status === 'pending').length,
            responded: evidenceRequests.filter(e => e.status === 'responded').length,
            canceled: evidenceRequests.filter(e => e.status === 'canceled').length
          }
        },
        filters: {
          status,
          start_date,
          end_date
        }
      });
    } catch (error: any) {
      console.error("Error listing evidence requests by store:", error);
      return res.status(500).json({
        message: "Error listing evidence requests by store",
        error: error.message
      });
    }
  }
}