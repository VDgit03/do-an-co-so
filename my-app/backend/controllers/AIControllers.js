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
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};