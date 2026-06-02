import * as aiService
    from "../services/AIServices.js";

export const chat = async (req, res) => {

    try {

        const {
            system,
            messages
        } = req.body;

        const reply =
            await aiService.chat(
                system,
                messages
            );

        res.json({
            success: true,
            reply
        });

    } catch (error) {

        console.error(error);

        if (error.status === 429) {

            return res.status(429).json({
                success: false,
                reply:
                    "⚠️ Đã vượt giới hạn sử dụng AI hôm nay."
            });
        }

        if (error.status === 503) {

            return res.status(503).json({
                success: false,
                reply:
                    "⚠️ Hệ thống AI đang quá tải, vui lòng thử lại sau."
            });
        }

        return res.status(500).json({
            success: false,
            reply:
                "❌ Không thể kết nối AI."
        });
    }
};
