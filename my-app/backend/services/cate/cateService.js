import pool from "../../config/db.js";

// lấy          
export const getAllCategories = async (
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
            b.amount AS budget

        FROM budgets b

        INNER JOIN categories c
            ON c.id = b.category_id

        WHERE
            b.user_id = ?
            AND b.month = ?
            AND b.year = ?
        `,
        [userId, month, year]
    );
    return rows;
};  

// thêm
export const addCategory = async (data) => {
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
        (
            user_id,
            name,
            icon,
            bg_color,
            fg_color
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            user_id,
            name,
            icon,
            bg_color,
            fg_color
        ]
    );

    const categoryId = result.insertId;
    await pool.query(
        `
        INSERT INTO budgets
        (
            user_id,
            category_id,
            amount,
            month,
            year
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            user_id,
            categoryId,
            budget,
            month,
            year
        ]
    );
    return {
        message: "Created"
    };
};

// update
export const editCategory = async (
    id,
    data
) => {

    const {
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
        SET
            name = ?,
            icon = ?,
            bg_color = ?,
            fg_color = ?
        WHERE id = ?
        `,
        [
            name,
            icon,
            bg_color,
            fg_color,
            id
        ]
    );

    await pool.query(
        `
        UPDATE budgets
        SET amount = ?
        WHERE
            category_id = ?
            AND month = ?
            AND year = ?
        `,
        [
            budget,
            id,
            month,
            year
        ]
    );

    return {
        message: "Updated"
    };
};

export const removeCategory = async (
    id,
    month,
    year
) => {

    await pool.query(
        `
        DELETE FROM budgets
        WHERE
            category_id = ?
            AND month = ?
            AND year = ?
        `,
        [id, month, year]
    );

    return {
        message: "Deleted"
    };
};