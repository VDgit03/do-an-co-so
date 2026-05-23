import express from "express";
import { getBudgets, addBudget, updateBudget, deleteBudget } from "../controllers/cate/budgetController.js";
const router = express.Router();

// lấy
router.get("/userId", getBudgets);

// thêm
router.post("/add", addBudget);

// cập nhật
router.put("/:id", updateBudget);

// xóa
router.delete("/:id", deleteBudget);

export default router;