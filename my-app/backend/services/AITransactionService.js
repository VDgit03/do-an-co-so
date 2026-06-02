import db from "../config/db.js";

export const createAITransaction = async (data) => {
    const {
        user_id,
        type,
        amount,
        title,
        category,
        goal_name
    } = data;

    if (!user_id) {
        throw new Error("Thiếu user_id");
    }

    if (!type) {
        throw new Error("Thiếu loại giao dịch");
    }

    if (!amount || amount <= 0) {
        throw new Error("Số tiền không hợp lệ");
    }

    const conn = await db.getConnection();

    try {

        await conn.beginTransaction();

        let category_id = null;
        let goal_id = null;

        // tìm category theo tên
        if (category) {

            const [categories] =
                await conn.query(
                    `
                    SELECT id
                    FROM categories
                    WHERE user_id = ?
                    AND LOWER(name) = LOWER(?)
                    LIMIT 1
                    `,
                    [user_id, category]
                );

            if (categories.length > 0) {
                category_id = categories[0].id;
            }
        }

        // insert transaction
        const [result] = await conn.query(
            `
    INSERT INTO \`transaction\`
    (
        user_id,
        category_id,
        goal_id,
        type,
        amount,
        title,
        transaction_date
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())
    `,
            [
                user_id,
                category_id,
                goal_id,
                type,
                amount,
                title
            ]
        );

        await conn.commit();

        return {
            id: result.insertId
        };

    } catch (err) {

        await conn.rollback();
        throw err;

    } finally {

        conn.release();

    }
};

async function chat(system, messages) {
    const conversation = messages
        .map(m => {
            const role =
                m.role === "assistant"
                    ? "AI"
                    : "User";

            return `${role}: ${m.content}`;
        })
        .join("\n");

    const prompt = `
${system}

${conversation}
`;

    return await generateWithRetry(
        prompt
    );
}

export const deleteAITransaction = async (
    user_id,
    keyword
) => {

    const [result] =
        await db.query(
            `
            DELETE FROM transaction
            WHERE user_id = ?
            AND title LIKE ?
            LIMIT 1
            `,
            [
                user_id,
                `%${keyword}%`
            ]
        );

    return result.affectedRows;
};

export const getBalance = async (user_id) => {

    const [rows] =
        await db.query(
            `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'income'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) income,

                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'expense'
                            THEN amount
                            ELSE 0
                        END
                    ), 0
                ) expense
            FROM transaction
            WHERE user_id = ?
            `,
            [user_id]
        );

    const data = rows[0];

    return {
        income: data.income,
        expense: data.expense,
        balance:
            data.income -
            data.expense
    };
};

export const getHighestCategory = async (
    user_id
) => {

    const [rows] =
        await db.query(
            `
            SELECT
                c.name,
                SUM(t.amount) total
            FROM transaction t
            JOIN categories c
                ON c.id = t.category_id
            WHERE
                t.user_id = ?
                AND t.type = 'expense'
            GROUP BY c.id, c.name
            ORDER BY total DESC
            LIMIT 1
            `,
            [user_id]
        );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
};