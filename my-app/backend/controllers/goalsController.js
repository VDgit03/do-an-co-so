import db from "../config/db.js";
import {
    getGoalsByUser,
    createGoal,
    updateGoal,
    removeGoal,
    depositGoal
} from "../models/goalModel.js";

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
export async function deleteGoal(req, res) {

    try {

        const userId = req.user.id;
        const goalId = req.params.id;

        const [result] = await db.query(
            `
            DELETE FROM goals
            WHERE id = ?
            AND user_id = ?
            `,
            [goalId, userId]
        );

        if (result.affectedRows === 0) {

            return res.status(404).json({
                success: false,
                message: "Không tìm thấy mục tiêu"
            });

        }

        res.json({
            success: true,
            message: "Xóa mục tiêu thành công"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
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