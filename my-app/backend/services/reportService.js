import {
    getTransactionsByMonth
} from "../models/transactionModel.js";

export async function buildMonthlyReport(
    userId,
    month,
    year
) {

    const transaction =
        await getTransactionsByMonth(
            userId,
            month,
            year
        );

    let income = 0;
    let expense = 0;

    const categoryMap = {};
    const monthlyMap = {};

    transaction.forEach(t => {

        const amount = Number(t.amount);

        const date = new Date(t.transaction_date);

        const monthKey =
            `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthlyMap[monthKey]) {

            monthlyMap[monthKey] = {
                income: 0,
                expense: 0
            };
        }

        if (t.type === "income") {

            income += amount;

            monthlyMap[monthKey].income += amount;
        }

        if (t.type === "expense") {

            expense += amount;

            monthlyMap[monthKey].expense += amount;

            const category =
                t.category_name || "Khác";

            categoryMap[category] =
                (categoryMap[category] || 0)
                + amount;
        }
    });

    return {

        summary: {
            income,
            expense,
            saving: income - expense,
            balance: income - expense
        },

        categories: {
            labels: Object.keys(categoryMap),

            values: Object.values(categoryMap),

            colors: [
                "#5DCAA5",
                "#F0997B",
                "#378ADD",
                "#A66DD4",
                "#FFD166",
                "#EF476F"
            ]
        },

        monthly: {

            labels: Object.keys(monthlyMap),

            income: Object.values(monthlyMap)
                .map(v => v.income),

            expense: Object.values(monthlyMap)
                .map(v => v.expense)
        },

        transaction
    };
}