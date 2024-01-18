const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text"); //we use this coz some pple prefer plain text instead of the formatted html to covert the html to plain text

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Oke Olamide <${process.env.EMAIL_FROM}>` 
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            //sendgrid configuration
            return 1
        }

        return nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
          auth: {
             user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
            }
        })
     }
        //send the actual email
    async send(template, subject) {
     //1) REnder HTML based on a pug template
     //we use pug to take in the file and render the pug code into real HTML code
     const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject //this is the subject for the template not one of the argument
      })

     //2) DEfine email options
     const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html,
                text: htmlToText.convert(html), //so we converted the html formate stored in the html to text
                
            };
     //3) Create ttransport and send email
   await this.newTransport().sendMail(mailOptions)
}
    async sendWelcome() {
        await this.send("welcome", "Welcome to the Natours Family!");
    }

    async sendPasswordReset() {
        await this.send("passwordReset", "Your password reset token (valid for only 10 minutes)")
    }
}

// const sendEmail = async options => {
//     //1 Create a transporter
//     const transporter = nodemailer.createTransport({
//         // // if we were to use GMAIL as ervice provided here is the format
//         // service: 'Gmail',//>
//         //    //Activate in gmail app 'less secure app' option
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
         
//         }
//     })
//     //2  Define the email options
//     const mailOptions = {
//         from: "Oke Olamide <okeolamide.o@gmail.com>",
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         //html
//     }

//     //3) Actually send email
//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail;







// //If we were to use gmmail service
// // EMAIL_USERNAME = your-email
// // EMAIL_PASSWORD = your-password v b