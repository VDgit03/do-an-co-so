
// ─────────────────────────────────────────────────────────
// services/transactionService.js
// ─────────────────────────────────────────────────────────

import {
    findAllTransactions,
    insertTransaction,
    deleteTransactionById,
    updateTransactionById,
} from "../models/transactionModel.js";

// lấy
export const getAllTransactionsService = async (userId) => {
    return await findAllTransactions(userId);
};


// tạo
export const createTransactionService = async (data) => {
    const {
        user_id,
        type,
        wallet_id,
        category_id,
        amount,
        title,
        transaction_date,
    } = data;

    // validate chung
    if (!user_id) {
        throw new Error("Thiếu user_id");
    }

    if (!type) {
        throw new Error("Thiếu loại giao dịch");
    }

    if (!amount || amount <= 0) {
        throw new Error("Số tiền không hợp lệ");
    }

    if (!title || title.trim() === "") {
        throw new Error("Vui lòng nhập tiêu đề");
    }

    if (!transaction_date) {
        throw new Error("Vui lòng chọn ngày");
    }

    // validate theo loại
    if (type === "income" && !wallet_id) {
        throw new Error("Vui lòng chọn ví");
    }

    if (type === "expense" && !category_id) {
        throw new Error("Vui lòng chọn danh mục");
    }

    const result = await insertTransaction({
        ...data,

        // income chỉ lưu wallet
        wallet_id:
            type === "income"
                ? wallet_id
                : null,

        // expense chỉ lưu category
        category_id:
            type === "expense"
                ? category_id
                : null,
    });
    return result;
};


// xóa
export const removeTransactionService = async (id) => {

    return await deleteTransactionById(id);
};


// update
export const editTransactionService = async (id, data) => {

    return await updateTransactionById(id, data);
};
