const nodemailer = require('nodemailer');
const User = require('../models/User');
const crypto = require('crypto');

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
});

const sendVerificationEmail = async (user) => {
  if (!user) throw new Error('No user provided for sendVerificationEmail');

  const emailVerificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  await user.save();

  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/user/verify/${emailVerificationToken}`;

  const mailOptions = {
    from: 'auth22@example.com',
    to: user.email,
    subject: 'Please confirm your email account',
    text: `Hello,\n\n Please verify your account by clicking the link: ${verificationUrl}`
  };

  await transport.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail
};
