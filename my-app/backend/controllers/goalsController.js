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

        const [result] = await db.query(
            sql,
            [
                user_id,
                name,
                target_amount,
                saved_amount,
                color_index,
                start_date,
                deadline
            ]
        );

        const goalId = result.insertId;

        if (saved_amount > 0) {

            await db.query(
                `
        INSERT INTO transaction
        (
            user_id,
            goal_id,
            type,
            amount,
            title,
            transaction_date
        )
        VALUES (?, ?, 'saving', ?, ?, NOW())
        `,
                [
                    user_id,
                    goalId,
                    saved_amount,
                    name
                ]
            );

        }

        res.json({
            message: "success",
            goalId
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
        const goalId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                message: "Số tiền không hợp lệ"
            });
        }

        // Lấy tên mục tiêu
        const [rows] = await db.query(
            `SELECT name
             FROM goals
             WHERE id = ?
             AND user_id = ?`,
            [goalId, userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy mục tiêu"
            });
        }

        const goalName = rows[0].name;

        // Cập nhật số tiền đã tiết kiệm
        await db.query(
            `UPDATE goals
             SET saved_amount = saved_amount + ?
             WHERE id = ?
             AND user_id = ?`,
            [
                amount,
                goalId,
                userId
            ]
        );

        // Lưu lịch sử giao dịch
        await db.query(
            `INSERT INTO transaction
            (
                user_id,
                goal_id,
                type,
                amount,
                title,
                transaction_date
            )
            VALUES (?, ?, 'saving', ?, ?, NOW())`,
            [
                userId,
                goalId,
                amount,
                `Nạp tiền - ${goalName}`
            ]
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