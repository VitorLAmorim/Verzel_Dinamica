import { Router } from "express";
import { StoreController } from "../controllers/StoreController";

const router = Router();
const storeController = new StoreController();

// Get store closures
router.get("/closure", storeController.getStoreClosures);

export default router;