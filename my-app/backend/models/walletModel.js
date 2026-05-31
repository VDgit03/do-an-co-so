import pool from "../config/db.js";

// lấy
export const getAllWalletsModel = async () => {
    const [rows] = await pool.execute(
        `
        SELECT *
        FROM wallets
        ORDER BY created_at DESC
        `
    );
    return rows;
};

// lấy theo user
export const getWalletsByUserModel = async (
    userId
) => {

    const [rows] = await pool.execute(
        `
        SELECT *
        FROM wallets
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [userId]
    );
    return rows;
};

// tạo
export const createWalletModel = async (
    user_id,
    name,
    type,
    amount,
    note,

    icon,
    bg_color,
    fg_color
) => {
    const [result] = await pool.execute(
        `
        INSERT INTO wallets
        (
            user_id,
            name,
            type,
            amount,
            note,

            icon,
            bg_color,
            fg_color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            user_id,
            name,
            type,
            amount,
            note,

            icon,
            bg_color,
            fg_color
        ]
    );
    const [rows] = await pool.execute(
        `
        SELECT *
        FROM wallets
        WHERE id = ?
        `,
        [result.insertId]
    );
    return rows[0];
};

// update
export const updateWalletModel = async (
    id,
    name,
    type,
    amount,
    note,

    icon,
    bg_color,
    fg_color
) => {
    await pool.execute(
        `
        UPDATE wallets
        SET
            name = ?,
            type = ?,
            amount = ?,
            note = ?,

            icon = ?,
            bg_color = ?,
            fg_color = ?
        WHERE id = ?
        `,
        [
            name,
            type,
            amount,
            note,

            icon,
            bg_color,
            fg_color,
            id
        ]
    );
    const [rows] = await pool.execute(
        `
        SELECT *
        FROM wallets
        WHERE id = ?
        `,
        [id]
    );
    return rows[0];
};

// xóa
export const deleteWalletModel = async (
    id
) => {
    await pool.execute(
        `
        DELETE FROM wallets
        WHERE id = ?
        `,
        [id]
    );
};