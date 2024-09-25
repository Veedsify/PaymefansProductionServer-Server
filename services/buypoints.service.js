const prismaQuery = require("../utils/prisma");
const { v4: uuid } = require("uuid");


module.exports = async (body, req) => {
    const { points_buy_id } = body;
    const point = await prismaQuery.globalPointsBuy.findFirst({
        where: { points_buy_id },
    });
    prismaQuery.$disconnect();

    if (!point) {
        return { message: "Sorry you cant buy this package", status: false };
    }
    const createNewPointsOrder = await PaystackPayment(point, req);
    prismaQuery.$disconnect();
    return createNewPointsOrder;
};

async function PaystackPayment(price, req) {
    try {
        const referenceId = "points" + uuid().split("-").join("");
        const priceOfPoints = price.amount * 1.02
        const newOrder = await prismaQuery.userPointsPurchase.create({
            data: {
                purchase_id: referenceId,
                user_id: req.user.id,
                points: price.points,
                amount: priceOfPoints,
                success: false,
            },
        });
        prismaQuery.$disconnect();

        const CreateOrder = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
                body: JSON.stringify({
                    amount: priceOfPoints * 100,
                    email: req.user.email,
                    reference: referenceId,
                    callback_url: process.env.SERVER_ORIGINAL_URL + "/api/points/callback",
                }),
            }
        );
        const data = await CreateOrder.json();
        return { ...data };
    } catch (error) {
        throw new Error(error.message);
    }
}
