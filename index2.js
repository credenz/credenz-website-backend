require('dotenv').config();
var nodemailer = require('nodemailer');

// mail authentication
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.IEEE_EMAIL,
        pass: process.env.IEEE_EMAIL_PASSWORD
    }
});

var mailOptions = {
    from: 'gauravghati225@gmail.com',
    to: 'gauravghatii@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
}); 
