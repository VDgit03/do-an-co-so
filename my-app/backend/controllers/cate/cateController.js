import {
    getAllCategories,
    addCategory,
    editCategory,
    removeCategory
} from "../../services/cate/cateService.js";

export const getCategories = async (
    req,
    res
) => {

    try {

        const { userId } = req.params;

        const { month, year } = req.query;

        const data =
            await getAllCategories(
                userId,
                month,
                year
            );

        res.json(data);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

export const createCategory = async (
    req,
    res
) => {

    try {

        const result =
            await addCategory(req.body);

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

export const updateCategory = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const result =
            await editCategory(
                id,
                req.body
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};

export const deleteCategory = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const { month, year } = req.query;

        const result =
            await removeCategory(
                id,
                month,
                year
            );

        res.json(result);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });
    }
};