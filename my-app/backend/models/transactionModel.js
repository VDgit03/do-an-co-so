import pool from "../config/db.js";

export async function getTransactionsByMonth(
    userId,
    month,
    year
) {

    const [rows] = await pool.query(
        `
        SELECT 
            t.*,
            c.name AS category_name
        FROM transaction t
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