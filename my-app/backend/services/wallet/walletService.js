import {
    getAllWalletsModel,
    getWalletsByUserModel,
    createWalletModel,
    updateWalletModel,
    deleteWalletModel
} from "../../models/walletModel.js";

// lấy
export const getAllWalletsService = async () => {
    return await getAllWalletsModel();
};

// lấy theo user
export const getWalletsByUserService = async (
    userId
) => {
    return await getWalletsByUserModel(
        userId
    );
};

// tạo
export const createWalletService = async (
    user_id,
    name,
    type,
    amount,
    note,

    icon,
    bg_color,
    fg_color
) => {
    return await createWalletModel(
        user_id,
        name,
        type,
        amount,
        note,
        icon,
        bg_color,
        fg_color
    );
};

// update
export const updateWalletService = async (
    id,
    name,
    type,
    amount,
    note,
    icon,
    bg_color,
    fg_color
) => {
    return await updateWalletModel(
        id,
        name,
        type,
        amount,
        note,
        icon,
        bg_color,
        fg_color
    );
};

// xóa
export const deleteWalletService = async (
    id
) => {
    return await deleteWalletModel(id);
};