const prismaQuery = require("../../utils/prisma");

class Transactions {
    static async GetTransactions(req, res) {
        const userId = req.user.id;

        try {
            const transactions = await prismaQuery.userPointsPurchase.findMany({
                where: {
                    user_id: userId
                },
                orderBy: {
                    created_at: "desc"
                }
            });

            res.status(200).json({
                status: "success",
                data: transactions
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }

    // Other transactions
    static async OtherTransactions(req, res) {
        const userId = req.user.id;

        try {
            const transactions = await prismaQuery.userTransaction.findMany({
                where: {
                    user_id: userId
                },
                orderBy: {
                    created_at: "desc"
                }
            });

            res.status(200).json({
                status: "success",
                data: transactions
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
}

module.exports = Transactions;