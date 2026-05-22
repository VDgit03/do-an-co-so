import {
    getBudgetsService,
    addBudgetService,
    updateBudgetService,
    deleteBudgetService
} from "../../services/cate/budgetService.js";

export const getBudgets = async (req, res) => {

    try {

        const data = await getBudgetsService();

        res.json(data);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

export const addBudget = async (req, res) => {

    try {

        const {
            user_id,
            category_id,
            amount,
            month,
            year
        } = req.body;

        await addBudgetService(
            user_id,
            category_id,
            amount,
            month,
            year
        );

        res.json({
            message: "Thêm budget thành công"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

export const updateBudget = async (req, res) => {

    try {

        const id = req.params.id;

        const {
            amount
        } = req.body;

        await updateBudgetService(id, amount);

        res.json({
            message: "Cập nhật budget thành công"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

export const deleteBudget = async (req, res) => {

    try {

        const id = req.params.id;

        await deleteBudgetService(id);

        res.json({
            message: "Xóa budget thành công"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};