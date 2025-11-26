import { Router } from "express";
import { EvidenceRequestController } from "../controllers/EvidenceRequestController";

const router = Router();
const evidenceRequestController = new EvidenceRequestController();

// Create evidence request
router.post("/", evidenceRequestController.createEvidenceRequest);

// Update evidence request status
router.put("/:id/status", evidenceRequestController.updateEvidenceRequestStatus);

// List evidence requests by store
router.get("/store/:storeId", evidenceRequestController.listEvidenceRequestsByStore);

export default router;