import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory} from "../controllers/cate/cateController.js";
const router = express.Router();

// lấy
router.get("/:userId", getCategories);

// tạo
router.post("/", createCategory);

// cập nhật
router.put("/:id", updateCategory);

// xóa
router.delete("/:id", deleteCategory);

export default router;