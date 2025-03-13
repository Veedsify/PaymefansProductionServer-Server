// Initiate random payments for a user
const {v4: uuid} = require("uuid");

module.exports = async (amount, email, callback_url, referenceId) => {
    try {
        const modelSignup = await fetch(
            "https://api.paystack.co/transaction/initialize",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                },
                body: JSON.stringify({
                    amount: amount * 100,
                    email: email,
                    reference: referenceId,
                    callback_url: callback_url,
                }),
            }
        );
        const data = await modelSignup.json();
        return data
    } catch (error) {
        throw new Error(error);
    }
}