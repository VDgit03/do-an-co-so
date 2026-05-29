import db from "../config/db.js";

// Lấy tất cả mục tiêu
export async function getGoalsByUser(userId) {
    const [rows] = await db.query(
        `SELECT * FROM goals
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
    );

    return rows;
}

// Lấy 1 mục tiêu
export async function getGoalById(id, userId) {
    const [rows] = await db.query(
        `SELECT * FROM goals
         WHERE id = ? AND user_id = ?`,
        [id, userId]
    );

    return rows[0];
}

// Tạo mục tiêu
export async function createGoal(data) {
    const {
        user_id,
        wallet_id,
        name,
        target_amount,
        saved_amount,
        color_index,
        start_date,
        deadline
    } = data;

    const [result] = await db.query(
        `INSERT INTO goals
        (
            user_id,
            wallet_id,
            name,
            target_amount,
            saved_amount,
            color_index,
            start_date,
            deadline
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user_id,
            wallet_id,
            name,
            target_amount,
            saved_amount,
            color_index,
            start_date,
            deadline
        ]
    );

    return result.insertId;
}

// Update
export async function updateGoal(id, userId, data) {

    const {
        name,
        target_amount,
        saved_amount,
        color_index,
        start_date,
        deadline
    } = data;

    await db.query(
        `UPDATE goals
         SET
            name = ?,
            target_amount = ?,
            saved_amount = ?,
            color_index = ?,
            start_date = ?,
            deadline = ?
         WHERE id = ? AND user_id = ?`,
        [
            name,
            target_amount,
            saved_amount,
            color_index,
            start_date,
            deadline,
            id,
            userId
        ]
    );
}

// Xóa
export async function deleteGoal(id, userId) {
    await db.query(
        `DELETE FROM goals
         WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
}

// Nạp tiền
export async function depositGoal(id, userId, amount) {

    await db.query(
        `UPDATE goals
         SET saved_amount = saved_amount + ?
         WHERE id = ? AND user_id = ?`,
        [amount, id, userId]
    );
}