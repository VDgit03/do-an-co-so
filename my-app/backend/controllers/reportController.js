import {
    buildMonthlyReport
} from "../services/reportService.js";

export async function getMonthlyReport(
    req,
    res
) {
    try {

        const { month, year } = req.query;

        const userId = req.user.id;

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