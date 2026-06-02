import express from "express";
import { verifyToken } from "../middlewares/authMiddlewares.js";

import {
    getMonthlyReport
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", verifyToken, getMonthlyReport);

export default router;