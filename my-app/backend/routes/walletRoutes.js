import express from "express";

import {
    getAllWallets,
    getWalletsByUser,
    createWallet,
    updateWallet,
    deleteWallet
} from "../controllers/wallet/walletController.js";

const router = express.Router();

// lấy
router.get("/", getAllWallets);

// lấy theo user
router.get("/user/:userId", getWalletsByUser);

// tạo
router.post("/", createWallet);

// update
router.put("/:id", updateWallet);

// xóa
router.delete("/:id", deleteWallet);

export default router;