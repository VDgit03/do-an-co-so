import db from "../config/db.js";

export async function getContext(
    userId
) {

    const [goals] =
        await db.query(
            `
   SELECT
      name,
      target_amount,
      saved_amount
   FROM goals
   WHERE user_id=?
   `,
            [userId]
        );

    const [transactions] =
        await db.query(
            `
   SELECT
      title,
      amount,
      type
   FROM transaction
   WHERE user_id=?
   ORDER BY
   transaction_date DESC
   LIMIT 20
   `,
            [userId]
        );

    return {
        goals,
        transactions
    };
}