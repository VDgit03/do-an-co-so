import express from "express";
import {
    getTransactions,
    addTransaction,
    removeTransaction,
    editTransaction,
} from "../controllers/transactionController.js";
const router = express.Router();

// lấy
router.get("/:userId", getTransactions);

// tạo
router.post("/", addTransaction);

// xóa
router.delete("/:id", removeTransaction);

// update
router.put("/:id", editTransaction);
export default router;