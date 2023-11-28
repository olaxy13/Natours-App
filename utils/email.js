const nodemailer = require("nodemailer");

const sendEmail = async options => {
    //1 Create a transporter
    const transporter = nodemailer.createTransport({
        // // if we were to use GMAIL as ervice provided here is the format
        // service: 'Gmail',//>
        //    //Activate in gmail app 'less secure app' option
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
         
        }
    })
    //2  Define the email options
    const mailOptions = {
        from: "Oke Olamide <okeolamide.o@gmail.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html
    }

    //3) Actually send email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;







//If we were to use gmmail service
// EMAIL_USERNAME = your-email
// EMAIL_PASSWORD = your-password