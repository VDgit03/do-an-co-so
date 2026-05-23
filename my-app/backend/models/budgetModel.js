
import pool from "../config/db.js";

// lấy budgets
export const getBudgetsModel =
async () => {

    const [rows] = await pool.query(`
        SELECT
            budgets.id,
            budgets.amount,
            budgets.month,
            budgets.year,

            categories.name,
            categories.icon,
            categories.bg_color,
            categories.fg_color

        FROM budgets

        INNER JOIN categories
        ON budgets.category_id = categories.id

        ORDER BY budgets.id DESC
    `);

    return rows;
};


// thêm budget
export const addBudgetModel =
async (
    user_id,
    category_id,
    amount,
    month,
    year
) => {

    await pool.query(`
        INSERT INTO budgets
        (
            user_id,
            category_id,
            amount,
            month,
            year
        )
        VALUES (?, ?, ?, ?, ?)
    `, [
        user_id,
        category_id,
        amount,
        month,
        year
    ]);
};


// update budget
export const updateBudgetModel =
async (
    id,
    amount
) => {

    await pool.query(`
        UPDATE budgets
        SET amount = ?
        WHERE id = ?
    `, [
        amount,
        id
    ]);
};


// xóa budget
export const deleteBudgetModel =
async (id) => {

    await pool.query(`
        DELETE FROM budgets
        WHERE id = ?
    `, [id]);
};

