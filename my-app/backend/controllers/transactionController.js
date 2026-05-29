import {
    getAllTransactionsService,
    createTransactionService,
    removeTransactionService,
    editTransactionService,
} from "../services/transactionService.js";


// lấy
export const getTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await getAllTransactionsService(userId);
        res.status(200).json({
            success: true,
            transactions,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lấy giao dịch thất bại",
        });
    }
};

// tạo
export const addTransaction = async (req, res) => {
    try {
        const result = await createTransactionService(req.body);
        res.status(201).json({
            success: true,
            message: "Thêm giao dịch thành công",
            id: result.insertId,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};


// xóa
export const removeTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await removeTransactionService(id);
        res.status(200).json({
            success: true,
            message: "Xóa giao dịch thành công",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Xóa thất bại",
        });
    }
};


// update
export const editTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await editTransactionService(id, req.body);
        res.status(200).json({
            success: true,
            message: "Cập nhật thành công",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Cập nhật thất bại",
        });
    }
};