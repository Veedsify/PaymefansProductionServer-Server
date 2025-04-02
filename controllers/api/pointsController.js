const prismaQuery = require("../../utils/prisma");
const buyPointsService = require("../../services/buypoints.service");
const redis = require("../../libs/redis-store");
const { v4: uuid } = require('uuid')
const ConversionRateService = require("../../services/points/convertion-rate.service");
const PointPurcahseService = require("../../services/points/point-purcahse.service");
class PointsController {
    // ConvertionRate For Points
    static async ConversionRate(req, res) {
        const getConversionRate = await ConversionRateService(req)
        if (getConversionRate.error) {
            res.status(500).json({ status: false, ...getConversionRate })
        }
        res.status(200).json({ status: true, ...getConversionRate })
    }

    // GetGlobalPoints
    static async GetGlobalPoints(req, res) {
        const allPoints = await prismaQuery.globalPointsBuy.findMany();
        res.status(200).json({
            message: "Global points retrieved successfully",
            allPoints,
            status: true,
        });
    }
    // BuyPoints
    static async BuyPoints(req, res) {
        const { data } = await buyPointsService(req.body, req);
        if (data && Object.keys(data).length > 0) {
            data.status = true;
            res.status(200).json({ ...data });
        } else {
            res.status(401)
                .json({ message: "Sorry you cant buy this package", status: false });
        }
    }
    // Callback
    static async Callback(req, res) {
        const { reference } = req.query;
        // Verify Payment on Paystack
        const getUser = await prismaQuery.userPointsPurchase.findFirst({
            where: { purchase_id: reference },
        });
        const checkIfUpdated = await prismaQuery.userPointsPurchase.findFirst({
            where: { purchase_id: reference },
        });
        if (checkIfUpdated.success) {
            return res.status(200).json({ status: false, message: "These points are already updated" });
        }
        async function verifyPayment(reference) {
            const response = await fetch(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    },
                }
            )
            if (response.status === 200) {
                return response.json()
            } else {
                return null
            }
        }
        if (getUser && verifyPayment(reference)) {
            await prismaQuery.userPointsPurchase.update({
                where: { purchase_id: reference },
                data: { success: true },
            });
            await prismaQuery.userPoints.update({
                where: { user_id: getUser.user_id },
                data: {
                    points: {
                        increment: getUser.points,
                    },
                },
            });
            const notification_id = uuid()
            await prismaQuery.notifications.create({
                data: {
                    notification_id,
                    message: `Your Paypoints Purchase was succesful, <strong>${getUser.points}</strong> points have been added to your balance.`,
                    user_id: getUser.user_id,
                    action: "purchase",
                    url: "/wallet"
                }
            })
            await prismaQuery.$disconnect()
            res.redirect(process.env.APP_URL + "/wallet/");
        } else {
            res.status(401).json({ status: false });
        }
    }
    static async GetUserPoints(req, res) {
        const { id } = req.user;
        const userPoints = await prismaQuery.userPoints.findFirst({
            where: { user_id: id },
        });
        if (userPoints) {
            res.status(200).json({
                message: "User points retrieved successfully",
                userPoints,
                status: true,
            });
        } else {
            res.status(401).json({
                message: "User points not found",
                status: false,
            });
        }
    }
    static async GetPointPerMessage(req, res) {
        try {
            const { user_id } = req.body;
            const PriceKey = `price_per_message:${user_id}`;
            const price = await redis.get(PriceKey);
            if (price) {
                return res.json({
                    message: "Price per message retrieved successfully",
                    price_per_message: price,
                    status: true,
                });
            } else {
                res.json({
                    message: "Price per message not found",
                    status: false,
                    price_per_message: 0,
                })
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "An error occurred", status: false });
        }
    }


    // Points Purchase
    static async PointPurcahse(req, res) {
        const pointsPurchase = await PointPurcahseService(req, res)
        if (pointsPurchase.error) {
            res.status(500).json({ status: false, ...pointsPurchase })
            return
        }
        res.status(200).json({ status: true, ...pointsPurchase })
    }
}
module.exports = PointsController;
