const express = require('express');

require('dotenv').config();

const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const isEmail = require('validator/lib/isEmail');

const baseUrl = require('../utils/baseUrl');
const UserModel = require('../models/UserModel');

const options = {
  auth: {
    api_key: process.env.sendGrid_api,
  },
};

const transporter = nodemailer.createTransport(sendgridTransport(options));

// Check user exist and send email for reset password
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmail(email)) {
      return res.status(401).send('Invalid Email');
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;

    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: 'klymenvlad@gmail.com',
      subject: 'Hi there! You made a reset request, didn`t you?',
      html: `<p>Hey ${user.name
        .split(' ')[0]
        .toString()}, You made a request for password reset, right? 
        <a href="${href}">Click this link to reset the password</a></p>
        <p>This token is valid for only 1 hour.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => err && console.error(err));

    return res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

// Verify the token and reset the password

router.post('/token', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(401).send('Unauthorized');
    }

    if (password.length < 6) {
      return res.status(401).send('Password must be longer than 6 characters');
    }

    const user = await UserModel.findOne({ resetToken: token });

    if (!user) {
      return res.status(404).send('User not found');
    }

    if (Date.now() > user.expireToken) {
      return res.status(401).send('Token expired. Try again');
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = '';
    user.expireToken = undefined;

    await user.save();

    return res.status(200).send('Password updated');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
