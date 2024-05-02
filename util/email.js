// eslint-disable-next-line import/no-extraneous-dependencies
const { createTransport } = require('nodemailer');

const SendEmail = async options => {

    const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions = {
        from: 'Prakash Singh <prakashsinghowebest@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    await transporter.sendMail(mailOptions)

}

module.exports = SendEmail;