import pool from "../config/db.js";

// lấy budgets
export const getBudgetsModel = async (userId, month, year) => {
    const [rows] = await pool.query(
        `
        SELECT
            b.id,
            b.amount,
            b.month,
            b.year,

            c.id AS category_id,
            c.name,
            c.icon,
            c.bg_color,
            c.fg_color
        
        FROM budgets b

        INNER JOIN categories c
            ON b.category_id = c.id

        WHERE b.user_id = ?
        AND b.month = CAST(? AS UNSIGNED)
        AND b.year = CAST(? AS UNSIGNED)

        ORDER BY b.id DESC;
        `,
        [userId, month, year]
    );

    return rows;
};

// thêm budget
export const addBudgetModel = async (
    user_id,
    category_id,
    amount,
    month,
    year
) => {
    await pool.query(
        `
        INSERT INTO budgets
        (user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE amount = VALUES(amount);
        `,
        [user_id, category_id, amount, month, year]
    );
};

// update budget
export const updateBudgetModel = async (id, amount) => {
    await pool.query(
        `
        UPDATE budgets
        SET amount = ?
        WHERE id = ?
        `,
        [amount, id]
    );
};


// xóa budget
export const deleteBudgetModel =
async (id) => {

    await pool.query(`
        DELETE FROM budgets
        WHERE id = ?
    `, [id]);
};