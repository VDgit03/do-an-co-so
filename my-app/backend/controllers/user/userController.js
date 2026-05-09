
import {
    findUserById
} from "../../models/authModel.js";

export const getUser = async (req, res) => {
    try {

        const { id } = req.params;

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            fullname:
                `${user.first_name} ${user.last_name}`
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};