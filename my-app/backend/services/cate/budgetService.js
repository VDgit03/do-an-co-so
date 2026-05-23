
import {

    getBudgetsModel,

    addBudgetModel,

    updateBudgetModel,

    deleteBudgetModel

} from "../../models/budgetModel.js";


// lấy
export const getBudgetsService =
async () => {

    return await getBudgetsModel();
};


// thêm
export const addBudgetService =
async (
    user_id,
    category_id,
    amount,
    month,
    year
) => {

    if (!amount || amount <= 0) {

        throw new Error(
            "Số tiền không hợp lệ"
        );
    }

    await addBudgetModel(
        user_id,
        category_id,
        amount,
        month,
        year
    );
};


// update
export const updateBudgetService =
async (
    id,
    amount
) => {

    if (!amount || amount <= 0) {

        throw new Error(
            "Số tiền không hợp lệ"
        );
    }

    await updateBudgetModel(
        id,
        amount
    );
};


// xóa
export const deleteBudgetService =
async (id) => {

    await deleteBudgetModel(id);
};

