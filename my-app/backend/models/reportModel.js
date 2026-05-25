import pool from "../config/db.js";

// lấy tất cả transaction theo tháng
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

            c.name AS category_name,
            c.icon AS category_icon,

            w.name AS wallet_name

        FROM \`transaction\` t

        LEFT JOIN categories c
        ON t.category_id = c.id

        LEFT JOIN wallets w
        ON t.wallet_id = w.id

        WHERE t.user_id = ?
        AND MONTH(t.transaction_date) = ?
        AND YEAR(t.transaction_date) = ?

        ORDER BY t.transaction_date DESC
        `,
        [userId, month, year]
    );

    return rows;
}


// tổng thu nhập và chi tiêu
export async function getSummaryReport(
    userId,
    month,
    year
) {

    const [rows] = await pool.query(
        `
        SELECT

            SUM(
                CASE
                    WHEN type = 'income'
                    THEN amount
                    ELSE 0
                END
            ) AS total_income,

            SUM(
                CASE
                    WHEN type = 'expense'
                    THEN amount
                    ELSE 0
                END
            ) AS total_expense

        FROM \`transaction\`

        WHERE user_id = ?
        AND MONTH(transaction_date) = ?
        AND YEAR(transaction_date) = ?
        `,
        [userId, month, year]
    );

    return rows[0];
}


// chi tiêu theo danh mục
export async function getExpenseByCategory(
    userId,
    month,
    year
) {

    const [rows] = await pool.query(
        `
        SELECT

            c.name AS category_name,

            SUM(t.amount) AS total

        FROM \`transaction\` t

        LEFT JOIN categories c
        ON t.category_id = c.id

        WHERE t.user_id = ?
        AND t.type = 'expense'
        AND MONTH(t.transaction_date) = ?
        AND YEAR(t.transaction_date) = ?

        GROUP BY c.name

        ORDER BY total DESC
        `,
        [userId, month, year]
    );

    return rows;
}


// xu hướng tài chính 12 tháng
export async function getMonthlyTrend(
    userId
) {

    const [rows] = await pool.query(
        `
        SELECT

            MONTH(transaction_date) AS month,
            YEAR(transaction_date) AS year,

            SUM(
                CASE
                    WHEN type = 'income'
                    THEN amount
                    ELSE 0
                END
            ) AS income,

            SUM(
                CASE
                    WHEN type = 'expense'
                    THEN amount
                    ELSE 0
                END
            ) AS expense

        FROM \`transaction\`

        WHERE user_id = ?

        GROUP BY
            YEAR(transaction_date),
            MONTH(transaction_date)

        ORDER BY
            YEAR(transaction_date),
            MONTH(transaction_date)
        `,
        [userId]
    );

    return rows;
}


// // tổng số dư ví
// export async function getWalletBalance(
//     userId
// ) {

//     const [rows] = await pool.query(
//         `
//         SELECT

//             SUM(balance) AS total_balance

//         FROM wallets

//         WHERE user_id = ?
//         `,
//         [userId]
//     );

//     return rows[0];
// }


// top danh mục chi tiêu nhiều nhất
export async function getTopExpenseCategories(
    userId,
    limit = 5
) {

    const [rows] = await pool.query(
        `
        SELECT

            c.name AS category_name,

            SUM(t.amount) AS total

        FROM \`transaction\` t

        LEFT JOIN categories c
        ON t.category_id = c.id

        WHERE
            t.user_id = ?
            AND t.type = 'expense'

        GROUP BY c.name

        ORDER BY total DESC

        LIMIT ?
        `,
        [userId, limit]
    );

    return rows;
}


// dữ liệu AI dự đoán tài chính
export async function getPredictionDataset(
    userId
) {

    const [rows] = await pool.query(
        `
        SELECT

            type,
            amount,
            category_id,
            transaction_date

        FROM \`transaction\`

        WHERE user_id = ?

        ORDER BY transaction_date ASC
        `,
        [userId]
    );

    return rows;
}