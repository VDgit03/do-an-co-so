import express from "express";

import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/cate/cateController.js";

const router = express.Router();

router.get("/:userId", getCategories);

router.post("/", createCategory);

router.put("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;