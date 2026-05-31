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

        // saving => tìm goal
        if (type === "saving" && goal_name) {

            const [goals] =
                await conn.query(
                    `
                    SELECT id
                    FROM goals
                    WHERE user_id = ?
                    AND LOWER(name) = LOWER(?)
                    LIMIT 1
                    `,
                    [user_id, goal_name]
                );

            if (goals.length === 0) {
                throw new Error(
                    `Không tìm thấy mục tiêu "${goal_name}"`
                );
            }

            goal_id = goals[0].id;
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

        // saving => cập nhật goal
        if (type === "saving" && goal_id) {

            await conn.query(
                `
                UPDATE goals
                SET saved_amount =
                    saved_amount + ?
                WHERE id = ?
                `,
                [
                    amount,
                    goal_id
                ]
            );

            // kiểm tra hoàn thành
            const [goalRows] =
                await conn.query(
                    `
                    SELECT
                        saved_amount,
                        target_amount
                    FROM goals
                    WHERE id = ?
                    `,
                    [goal_id]
                );

            const goal = goalRows[0];

            if (
                goal.saved_amount >=
                goal.target_amount
            ) {

                await conn.query(
                    `
                    UPDATE goals
                    SET status='completed'
                    WHERE id = ?
                    `,
                    [goal_id]
                );
            }
        }

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