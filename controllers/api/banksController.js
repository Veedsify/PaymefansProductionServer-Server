const prismaQuery = require("../../utils/prisma");

class BanksController {
    static async GetBanks(req, res) {
        const userId = req.user.id;
        try {
            const banks = await prismaQuery.userBanks.findMany({
                where: {
                    user_id: userId
                }
            });
            res.status(200).json({
                status: true,
                data: banks
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    }
    static async addBank(req, res) {
        const userId = req.user.id;
        const { accountName, accountNumber, bankCode, otherDetails } = req.body;
        console.log(otherDetails)
        try {

            const checkBanks = await prismaQuery.userBanks.findFirst({
                where: {
                    account_number: accountNumber,
                }
            })

            if (checkBanks) {
                return res.status(400).json({
                    status: false,
                    message: "Bank account already exists"
                });
            }

            const bank = await prismaQuery.userBanks.create({
                data: {
                    user_id: userId,
                    bank_id: bankCode,
                    bank_name: otherDetails.name,
                    account_name: accountName,
                    account_number: accountNumber,
                    bank_country: otherDetails.country,
                }
            });

            res.status(200).json({
                status: true,
                message: "Bank added successfully",
                data: bank
            });

        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    }

    // DELETE BANKS
    static async DeleteBank(req, res) {
        const userId = req.user.id;
        const { accountNumber } = req.body;
        try {
            const bank = await prismaQuery.userBanks.delete({
                where: {
                    account_number: accountNumber,
                    user_id: userId
                }
            });
            res.status(200).json({
                status: true,
                message: "Bank deleted successfully",
                data: bank
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    }
}

module.exports = BanksController;