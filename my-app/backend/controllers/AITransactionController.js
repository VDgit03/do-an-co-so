import {
    createAITransaction
} from "../services/AITransactionService.js";

export const confirmAITransaction = async (req, res) => {
    try {
        const user_id = req.user.id; // 👈 lấy từ middleware auth

        const result = await createAITransaction({
            ...req.body,
            user_id
        });

        res.status(201).json({
            success: true,
            message: "Đã lưu giao dịch AI",
            id: result.id
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};