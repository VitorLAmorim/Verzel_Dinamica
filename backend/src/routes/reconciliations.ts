import { Router } from "express";
import { ReconciliationController } from "../controllers/ReconciliationController";

const router = Router();
const reconciliationController = new ReconciliationController();

// Update reconciliation status
router.put("/:id/status", reconciliationController.updateReconciliationStatus);

// Create reconciliation
router.post("/", reconciliationController.createReconciliation);

export default router;