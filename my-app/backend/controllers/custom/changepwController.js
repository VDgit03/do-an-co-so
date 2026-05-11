import { changePasswordService } from "../../services/auth/changepwService.js";

export const changePassword = async (
    req,
    res
) => {
    try {
        const {
            userId,
            oldPassword,
            newPassword,
            confirmPassword
        } = req.body;

        // validate
        if (!userId || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ"
            });
        }

        // xác nhận mật khẩu
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Mật khẩu xác nhận không khớp"
            });
        }

        // độ dài mật khẩu
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu tối thiểu 8 ký tự"
            });
        }

        const result = await changePasswordService(
            userId,
            oldPassword,
            newPassword
        );
        res.json(result);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
};