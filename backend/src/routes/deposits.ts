import { Router } from "express";
import { DepositController } from "../controllers/DepositController";

const router = Router();
const depositController = new DepositController();

// List deposits
router.get("/", depositController.listDeposits);

// Update deposit status
router.put("/:id/status", depositController.updateDepositStatus);

// Get deposit details
router.get("/:id", depositController.getDepositDetails);

export default router;