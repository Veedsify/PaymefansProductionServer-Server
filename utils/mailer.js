const nodemailer = require('nodemailer');
require('dotenv').config();

const MailConfigOptions = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
}

const mailer = nodemailer.createTransport(MailConfigOptions);

module.exports = mailer;