// eslint-disable-next-line import/no-extraneous-dependencies
const { createTransport } = require('nodemailer');

const SendEmail = async options => {
    const transporter = createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '902387b8c31a6b',
            pass: 'aa998fb17134d4'
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