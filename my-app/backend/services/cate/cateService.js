
import {

    getAllCategoriesModel,

    addCategoryModel,

    editCategoryModel,

    removeCategoryModel

} from "../../models/cateModel.js";


// lấy
export const getAllCategories =
async (
    userId,
    month,
    year
) => {

    return await getAllCategoriesModel(
        userId,
        month,
        year
    );
};


// thêm
export const addCategory =
async (data) => {

    if (!data.name) {

        throw new Error(
            "Tên danh mục không được để trống"
        );
    }

    await addCategoryModel(data);

    return {
        message: "Created"
    };
};


// update
export const editCategory =
async (
    id,
    data
) => {

    await editCategoryModel(
        id,
        data
    );

    return {
        message: "Updated"
    };
};


// xóa
export const removeCategory =
async (
    id,
    month,
    year
) => {

    await removeCategoryModel(
        id,
        month,
        year
    );

    return {
        message: "Deleted"
    };
};
