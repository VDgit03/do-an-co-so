import { createGoal } from "../models/goalModel.js";

import { createAITransaction } from "../services/AITransactionService.js";

export const executeAIAction =
    async (req, res) => {

        try {

            const action =
                req.body.action;

            const user_id =
                req.user.id;

            if (
                action.action ===
                "create_transaction"
            ) {

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
            }

            if (
                action.action ===
                "create_goal"
            ) {

                const id =
                    await createGoal({
                        user_id,
                        wallet_id: null,
                        name: action.name,
                        target_amount:
                            action.target_amount,
                        saved_amount: 0,
                        color_index: 0,
                        start_date: null,
                        deadline: null
                    });

                return res.json({
                    success: true,
                    type: "goal",
                    id
                });
            }

            if (
                action.action === "saving"
            ) {

                return res.json({
                    success: false,
                    message: "saving chưa xử lý"
                });
            }

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }
    };