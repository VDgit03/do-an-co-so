import express from "express";

const router = express.Router();

import { chat } from "../controllers/AIControllers.js";
import { confirmAITransaction } from "../controllers/AITransactionController.js";
import { executeAIAction } from "../controllers/AIActionController.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";

router.post("/chat", chat);
router.post("/confirm", confirmAITransaction);
router.post("/execute", verifyToken, executeAIAction);
export default router;
