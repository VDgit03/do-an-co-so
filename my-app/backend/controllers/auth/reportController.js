import {
    buildMonthlyReport
} from "../../services/auth/reportService.js";

export async function getMonthlyReport(
    req,
    res
) {

    try {

        const { month, year } = req.query;

        // demo user
        const userId = 1;

        const report =
            await buildMonthlyReport(
                userId,
                month,
                year
            );

        res.json(report);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server error"
        });
    }
}