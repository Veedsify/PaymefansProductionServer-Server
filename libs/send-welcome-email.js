const mailer = require("../utils/mailer");

module.exports = async (email, username) => {
    mailer.sendMail({
        from: `Paymefans <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Welcome to Paymefans",
        html: `
        <h1>Welcome to Paymefans</h1>
        <p>Hi ${username},</p>
        <p>Thank you for signing up to Paymefans. We are excited to have you on board.</p>
        <p>Get ready to connect with your fans and make money.</p>
        <p>Best regards,</p>
        <p>Paymefans Team</p>
        `
    }, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    })
}