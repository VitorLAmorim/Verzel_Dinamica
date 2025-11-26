import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Deposit } from "../entities/Deposit";
import { createDateRange, isValidDateString } from "../utils/dateUtils";

export class DepositController {
  private depositRepository = AppDataSource.getRepository(Deposit);
  // List deposits with filters
  async listDeposits(req: Request, res: Response): Promise<Response> {
    try {
      const {
        store_id,
        start_date,
        end_date,
        verified,
        sale_id,
        limit = 50,
        offset = 0
      } = req.query;

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

      const queryBuilder = this.depositRepository.createQueryBuilder("deposit")
        .leftJoinAndSelect("deposit.cashRegister", "cashRegister")
        .leftJoinAndSelect("cashRegister.store", "store")
        .leftJoinAndSelect("deposit.sale", "sale")
        .orderBy("deposit.deposit_date", "DESC")
        .addOrderBy("deposit.created_at", "DESC")
        .take(parseInt(limit as string))
        .skip(parseInt(offset as string));

      if (store_id) {
        queryBuilder.andWhere("store.id = :store_id", { store_id });
      }

      if (startDate) {
        queryBuilder.andWhere("deposit.deposit_date >= :startDate", { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere("deposit.deposit_date <= :endDate", { endDate });
      }

      if (verified !== undefined) {
        queryBuilder.andWhere("deposit.verified = :verified", { verified: verified === 'true' });
      }

      if (sale_id) {
        queryBuilder.andWhere("deposit.sale_id = :sale_id", { sale_id });
      }

      const [deposits, total] = await queryBuilder.getManyAndCount();

      return res.json({
        deposits,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          pages: Math.ceil(total / parseInt(limit as string))
        },
        filters: {
          store_id,
          start_date,
          end_date,
          verified,
          sale_id
        },
        summary: {
          total_amount: deposits.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
          verified_amount: deposits.filter(d => d.verified).reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0),
          unverified_amount: deposits.filter(d => !d.verified).reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0)
        }
      });
    } catch (error: any) {
      console.error("Error listing deposits:", error);
      return res.status(500).json({
        message: "Error listing deposits",
        error: error.message
      });
    }
  }

  // Update deposit verification status
  async updateDepositStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { verified } = req.body;

      if (verified === undefined) {
        return res.status(400).json({
          message: "'verified' field is required (true/false)"
        });
      }

      const deposit = await this.depositRepository.findOne({ where: { id } });

      if (!deposit) {
        return res.status(404).json({
          message: "Deposit not found"
        });
      }

      // Update status
      deposit.verified = verified;
      await this.depositRepository.save(deposit);

      return res.json({
        message: `Deposit marked as ${verified ? 'verified' : 'unverified'} successfully`,
        deposit: {
          id: deposit.id,
          code: deposit.code,
          amount: deposit.amount,
          verified: deposit.verified,
          updated_at: deposit.updated_at
        }
      });
    } catch (error: any) {
      console.error("Error updating deposit status:", error);
      return res.status(500).json({
        message: "Error updating deposit status",
        error: error.message
      });
    }
  }

  // Get deposit details
  async getDepositDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deposit = await this.depositRepository.createQueryBuilder("deposit")
        .leftJoinAndSelect("deposit.cashRegister", "cashRegister")
        .leftJoinAndSelect("cashRegister.store", "store")
        .leftJoinAndSelect("deposit.sale", "sale")
        .where("deposit.id = :id", { id })
        .getOne();

      if (!deposit) {
        return res.status(404).json({
          message: "Deposit not found"
        });
      }

      return res.json({
        deposit
      });
    } catch (error: any) {
      console.error("Error getting deposit details:", error);
      return res.status(500).json({
        message: "Error getting deposit details",
        error: error.message
      });
    }
  }
}