const express = require('express');
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendPasswordResetEmail } = require('../utils/emailUtils');
const { sendVerificationEmail } = require('../utils/verificationUtils');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ email, password });
    await sendVerificationEmail(newUser);
    res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Email or password not provided in login');
      return res.status(400).json({ message: "Please enter all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "User does not exist" });
    }
    if (!user.isVerified) {
      console.log('User email not verified:', email);
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) throw err;
      if (!isMatch) {
        console.log('Password does not match for user:', email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user._id;
      req.session.email = user.email;
      console.log('Login successful for user:', email);
      res.status(200).json({ message: "Login successful" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/login', (req, res) => res.render('login'));

router.get('/register', (req, res) => res.render('register'));

router.get('/homepage', (req, res) => {
  if (!req.session.userId) return res.redirect('/user/login');
  res.render('homepage', { email: req.session.email });
});

router.post('/update', async (req, res) => {
  if (!req.session.userId) {
    console.log('No session userId found for update');
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findById(req.session.userId);
    const { email, password } = req.body;
    if(email) user.email = email;
    if(password) {
      user.password = password;
    }
    await user.save();
    if(email) req.session.email = email;
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Failed to destroy the session during logout', err);
      return res.status(500).send('Server error');
    }
    res.redirect('/user/login');
  });
});

router.get('/forgot-password', (req, res) => res.render('forgot-password'));

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('No user found with that email.');
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/user/reset-password/${resetToken}`;

  sendPasswordResetEmail(user.email, resetUrl);
  res.status(200).send('A link to reset your password has been sent to your email.');
});

router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.render('reset-password', { token });
});

router.post('/reset-password/:token', async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Token is invalid or has expired.' });
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Password successfully reset.' });
});

router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ emailVerificationToken: req.params.token });
    if (!user) {
      console.log('Invalid token for email verification');
      return res.status(400).send('Invalid link or token has expired');
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.redirect('/user/login');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
