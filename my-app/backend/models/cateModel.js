import pool from "../config/db.js";

// lấy
  export const getAllCategoriesModel = async (
    userId,
    month,
    year
) => {

    const [rows] = await pool.query(
        `
        SELECT
            c.id,
            c.name,
            c.icon,
            c.bg_color,
            c.fg_color,

            COALESCE(b.amount, 0) AS budget,

            COALESCE(SUM(t.amount), 0) AS spent

        FROM categories c

        INNER JOIN budgets b
            ON c.id = b.category_id
            AND b.user_id = ?
            AND b.month = ?
            AND b.year = ?

        LEFT JOIN transaction t
            ON t.category_id = c.id
            AND t.user_id = ?
            AND t.type = 'expense'
            AND MONTH(t.transaction_date) = ?
            AND YEAR(t.transaction_date) = ?

        WHERE c.user_id = ?

        GROUP BY
            c.id,
            c.name,
            c.icon,
            c.bg_color,
            c.fg_color,
            b.amount

        ORDER BY c.created_at DESC
        `,
        [
            userId,
            month,
            year,

            userId,
            month,
            year,

            userId
        ]
    );

    return rows;
};
// tạo
export const addCategoryModel = async (data) => {
    const {
        user_id,
        name,
        icon,
        bg_color,
        fg_color,
        budget,
        month,
        year
    } = data;
    const [result] = await pool.query(
        `
        INSERT INTO categories
        (user_id, name, icon, bg_color, fg_color)
        VALUES (?, ?, ?, ?, ?)
        `,
        [user_id, name, icon, bg_color, fg_color]
    );
    const categoryId = result.insertId;
    await pool.query(
        `
        INSERT INTO budgets
        (user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
        `,
        [user_id, categoryId, budget || 0, month, year]
    );
    return result;
};

// update
export const editCategoryModel = async (id, data) => {
    const {
        user_id,
        name,
        icon,
        bg_color,
        fg_color,
        budget,
        month,
        year
    } = data;
    await pool.query(
        `
        UPDATE categories
        SET name = ?, icon = ?, bg_color = ?, fg_color = ?
        WHERE id = ?
        `,
        [name, icon, bg_color, fg_color, id]
    );
    await pool.query(
        `
        INSERT INTO budgets
        (user_id, category_id, amount, month, year)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        `,
        [user_id, id, budget || 0, month, year]
    );
};

// xóa
export const removeCategoryModel = async (id) => {
    await pool.query(
        `
        DELETE FROM categories
        WHERE id = ?
        `,
        [id]
    );
};