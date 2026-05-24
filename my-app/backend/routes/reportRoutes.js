import express from "express";

import {
    getMonthlyReport
} from "../controllers/auth/reportController.js";

const router = express.Router();

router.get("/", getMonthlyReport);

export default router;