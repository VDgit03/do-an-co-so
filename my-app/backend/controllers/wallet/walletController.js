import {
    getAllWalletsService,
    getWalletsByUserService,
    createWalletService,
    updateWalletService,
    deleteWalletService
} from "../../services/wallet/walletService.js";


// lấy
export const getAllWallets = async (
    _req,
    res
) => {
    try {
        const wallets = await getAllWalletsService();
        res.json({
            wallets
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};

// lấy ví theo user
export const getWalletsByUser = async (
    req,
    res
) => {
    try {
        const { userId } = req.params;
        const wallets = await getWalletsByUserService(userId);
        res.json({
            wallets
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};

// tạo
export const createWallet = async (
    req,
    res
) => {
    try {

        const {
            user_id,
            name,
            type,
            amount,
            note,

            icon,
            bg_color,
            fg_color

        } = req.body;

        if (
            !user_id ||
            !name ||
            !type ||
            amount === undefined
        ) {
            return res.status(400).json({
                message: "Thiếu dữ liệu"
            });
        }

        const wallet =
            await createWalletService(
                user_id,
                name,
                type,
                amount,
                note,

                icon,
                bg_color,
                fg_color
            );

        res.status(201).json({
            wallet
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};

// update
export const updateWallet = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            amount,
            note
        } = req.body;
        const wallet = await updateWalletService(
                id,
                name,
                type,
                amount,
                note
            );
        res.json({
            wallet
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};

// xóa
export const deleteWallet = async (
    req,
    res
) => {
    try {
        const { id } = req.params;
        await deleteWalletService(id);
        res.json({
            message: "Deleted"
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err.message
        });
    }
};