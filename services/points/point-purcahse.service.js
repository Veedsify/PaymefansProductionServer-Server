const prismaQuery = require("../../utils/prisma")
const ConversionRateService = require("./convertion-rate.service")
const { v4: uuid } = require('uuid')

async function PointPurcahseService(req, res) {
     const user = req.user
     const { amount } = req.body

     if (!user) {
          return {
               error: true,
               message: "User not found"
          }
     }

     if (!amount) {
          return {
               error: true,
               message: "Amount is required"
          }
     }

     const rate = await ConversionRateService(req)

     if (rate.status == false) {
          return {
               error: true,
               message: rate.message
          }
     }

     const platformFee = Number(process.env.PLATFORM_FEE) * amount
     const points = ((amount - platformFee) / rate.rate)
     const response = await PaystackPayment(amount, platformFee, rate.rate, req)

     
     if (!response.data || response.data.authorization_url == "") {
          return {
               error: true,
               message: `Cannot Generate Proceed With Checkout`
          }
     }

     return {
          error: false,
          message: "Payment initiated successfully",
          checkout: response.data,
          points: points,
          platformFee: platformFee,
     }

}


async function PaystackPayment(amount, platformFee, rate, req) {
     try {
          const referenceId = "points" + uuid().split("-").join("");
          await prismaQuery.userPointsPurchase.create({
               data: {
                    purchase_id: referenceId,
                    user_id: req.user.id,
                    points: Number((amount - platformFee) / rate),
                    amount: amount,
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
                         amount: amount * 100,
                         email: req.user.email,
                         reference: referenceId,
                         callback_url: process.env.SERVER_ORIGINAL_URL + "/api/points/callback",
                    }),
               }
          );
          return await CreateOrder.json();

     } catch (error) {
          console.log(error)
     }
}
module.exports = PointPurcahseService
