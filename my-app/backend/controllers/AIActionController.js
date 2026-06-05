import {
    createAITransaction,
    deleteAITransaction,
    getBalance,
    getHighestCategory
} from "../services/AITransactionService.js";
export const executeAIAction = async (req, res) => {

    try {

        const action =
            req.body.action;

        const user_id =
            req.user.id;

        switch (action.action) {
            case "create_transaction":

                const result =
                    await createAITransaction({
                        user_id,
                        type: action.type,
                        amount: action.amount,
                        title: action.title,
                        category: action.category
                    });

                return res.json({
                    success: true,
                    type: "transaction",
                    id: result.id
                });
            case "delete_transaction":

                const deleted =
                    await deleteAITransaction(
                        user_id,
                        action.keyword
                    );

                return res.json({
                    success: true,
                    type: "delete_transaction",
                    deleted
                });

            case "get_balance":

                const balance =
                    await getBalance(
                        user_id
                    );

                return res.json({
                    success: true,
                    type: "balance",
                    data: balance
                });

            case "highest_category":

                const category =
                    await getHighestCategory(
                        user_id
                    );

                return res.json({
                    success: true,
                    type: "highest_category",
                    data: category || {
                        name: "Chưa có dữ liệu",
                        total: 0
                    }
                });

            default:

                return res.status(400).json({
                    success: false,
                    message: "Action không hỗ trợ"
                });
        }

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

