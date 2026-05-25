import express from "express";

import {
    getMonthlyReport
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/", getMonthlyReport);

export default router;