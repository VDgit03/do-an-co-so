import express from "express";


import {
    getGoals,
    addGoal,
    editGoal,
    deleteGoal,
    deposit
} from "../controllers/goalsController.js";
import { verifyToken } from "../middlewares/authMiddlewares.js";
const router = express.Router();

router.get("/", verifyToken, getGoals);

router.post("/", verifyToken, addGoal);

router.put("/:id", verifyToken, editGoal);

router.delete("/:id", verifyToken, deleteGoal);

router.patch("/:id/deposit", verifyToken, deposit);

export default router;