const nodeMailer = require('nodemailer');


const transporter = nodeMailer.createTransport({
  host: 'smtp-mail.outlook.com',
  secure: false,
  auth: {
    user: 'loghaty2024@outlook.com',
    pass: 'Loghaty24'
  }
});

transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

module.exports = transporter;