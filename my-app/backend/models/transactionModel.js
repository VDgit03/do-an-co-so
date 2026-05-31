import pool from "../config/db.js";

export async function getTransactionsByMonth(
    userId,
    month,
    year
) {

    const [rows] = await pool.query(
        `
        SELECT 
            t.id,
            t.user_id,
            t.wallet_id,
            t.category_id,
            t.type,
            t.amount,
            t.title,
            t.note,
            t.transaction_date,
            t.created_at,

            w.name AS wallet_name,
            w.icon AS wallet_icon,
            w.bg_color AS wallet_bg,
            w.fg_color AS wallet_fg,

            c.name AS category_name,
            c.icon AS category_icon,
            c.bg_color AS bg_color,
            c.fg_color AS fg_color

        FROM transaction t

        LEFT JOIN wallets w
            ON t.wallet_id = w.id

        LEFT JOIN categories c
            ON t.category_id = c.id

        WHERE t.user_id = ?
        AND MONTH(t.transaction_date) = ?
        AND YEAR(t.transaction_date) = ?

        ORDER BY t.transaction_date DESC
        `,
        [userId, month, year]
    );

    return rows;
}



// lấy all
export const findAllTransactions = async (userId) => {
    const sql = `
        SELECT
            t.id,
            t.user_id,
            t.wallet_id,
            t.category_id,
            t.type,
            t.amount,
            t.title,
            t.note,
            t.transaction_date,
            t.created_at,

            w.name AS wallet_name,
            w.icon AS wallet_icon,
            w.bg_color AS wallet_bg,
            w.fg_color AS wallet_fg,

            c.name AS category_name,
            c.icon AS category_icon,
            c.bg_color AS category_bg,
            c.fg_color AS category_fg

        FROM transaction t

        LEFT JOIN wallets w
            ON t.wallet_id = w.id

        LEFT JOIN categories c
            ON t.category_id = c.id

        WHERE t.user_id = ?

        ORDER BY t.transaction_date DESC
    `;
    const [rows] = await pool.execute(sql, [userId]);
    return rows;
};


// tạo
export const insertTransaction = async (data) => {
    const {
        user_id,
        wallet_id,
        category_id,
        type,
        amount,
        title,
        note,
        transaction_date,
    } = data;
    const sql = `
        INSERT INTO transaction (
            user_id,
            wallet_id,
            category_id,
            type,
            amount,
            title,
            note,
            transaction_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(
        sql,
        [
            user_id,
            wallet_id || null,
            category_id || null,
            type,
            amount,
            title,
            note,
            transaction_date,
        ]
    );
    return result;
};

// xóa
export const deleteTransactionById = async (id) => {
    const sql = `
        DELETE FROM transaction
        WHERE id = ?
    `;
    const [result] = await pool.execute(
        sql,
        [id]
    );
    return result;
};

// update
export const updateTransactionById = async (
    id,
    data
) => {
    const {
        wallet_id,
        category_id,
        type,
        amount,
        title,
        note,
        transaction_date,
    } = data;
    const sql = `
        UPDATE transaction

        SET
            wallet_id = ?,
            category_id = ?,
            type = ?,
            amount = ?,
            title = ?,
            note = ?,
            transaction_date = ?

        WHERE id = ?
    `;
    const [result] = await pool.execute(
        sql,
        [
            wallet_id || null,
            category_id || null,
            type,
            amount,
            title,
            note,
            transaction_date,
            id,
        ]
    );

    return result;
};