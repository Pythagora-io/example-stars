const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  await transport.sendMail({
    from: process.env.FROM_EMAIL || process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Please click on the following link, or paste this into your browser to complete the process: \n\n${resetUrl}`
  });
};

module.exports = { sendPasswordResetEmail };
