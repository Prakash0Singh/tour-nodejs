// eslint-disable-next-line import/no-extraneous-dependencies
const htmlToText = require('html-to-text')
const nodemailer = require('nodemailer');
const pug = require('pug')

module.exports = class Email {
    constructor(user) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.from = `Prakash Singh <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            //Sendgrid 
            return 1
        }

        return nodemailer.createTransport({
            host: 'sandbox.smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: '902387b8c31a6b',
                pass: 'aa998fb17134d4'
            }
        })

    }

    async send(template, subject) {
        //send the actual email
        //1 Render HTML based  on pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            subject
        })
        //2 Define Email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.htmlToText(html),
        }

        //3 create a transport and send email
        const s = await this.newTransport()
        await s.sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Tour Family !!')
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }
}