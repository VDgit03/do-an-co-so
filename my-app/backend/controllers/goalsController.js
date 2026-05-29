import db from "../config/db.js";
import {
    getGoalsByUser,
    createGoal,
    updateGoal,
    deleteGoal,
    depositGoal
} from "../models/goalModel.js";

// GET
export async function getGoals(req, res) {

    try {

        const userId = req.user.id;

        const goals = await getGoalsByUser(userId);

        res.json(goals);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });
    }
}

// POST
export async function addGoal(req, res) {

    try {

        const user_id = req.user.id;

        const {
            name,
            target_amount,
            saved_amount,
            color_index,
            start_date,
            deadline
        } = req.body;

        const sql = `
            INSERT INTO goals
            (
                user_id,
                name,
                target_amount,
                saved_amount,
                color_index,
                start_date,
                deadline
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            user_id,
            name,
            target_amount,
            saved_amount,
            color_index,
            start_date,
            deadline
        ]);

        res.json({
            message: "success"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: err.message
        });
    }
}

// PUT
export async function editGoal(req, res) {

    try {

        const userId = req.user.id;

        await updateGoal(
            req.params.id,
            userId,
            req.body
        );

        res.json({
            message: "Cập nhật thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
}

// DELETE
export async function removeGoal(req, res) {

    try {

        const userId = req.user.id;

        await deleteGoal(
            req.params.id,
            userId
        );

        res.json({
            message: "Xóa thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
}

// Deposit
export async function deposit(req, res) {

    try {

        const userId = req.user.id;

        const { amount } = req.body;

        await depositGoal(
            req.params.id,
            userId,
            amount
        );

        res.json({
            message: "Nạp tiền thành công"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
}