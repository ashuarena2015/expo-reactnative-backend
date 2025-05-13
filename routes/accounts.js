/* eslint-disable padding-line-between-statements */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
const express = require('express');
const bcrypt = require("bcrypt");
const routerAccount = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./isAuth');
const { AccountCreation } = require('./schema/Accounts/accounts');

const fs = require('fs');
const path = require("path");
const multer = require("multer");
const sharp = require("sharp");
const nodemailer = require('nodemailer');
const cors = require('cors');

// Gmail app passoword: MailSender / cued eiag suuv ybzq

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ashuarena@gmail.com',
      pass: 'cued eiag suuv ybzq' // Use App Passwords, not your Gmail password
    }
  });

routerAccount.get('/auth', verifyToken, async (req, res) => {
    try {
        console.log('Auth login');
        const existingUser = await AccountCreation.findOne({ email: req.user?.email });
        return res
            .status(200)
            .json({
                user: existingUser,
                isAuthLogin: true
            });
    } catch (error) {
        return res
            .status(403)
            .json({error: error?.errmsg});
    }
})

routerAccount.post("/create", async (req, res) => {
    try {
    
        const { email } = req.body.userInfo;
        if(!email) {
            return res.status(400).send({message: 'Please provide correct credentials.'})
        }
        // Check If User Exists In The Database
        const user = await AccountCreation.findOne({ email });
        const otp = Math.floor(100000 + Math.random() * 900000);
        if(user) {
            await AccountCreation.findOneAndUpdate(
                {
                    email,
                },
                {
                    verify_otp: otp
                }
            );
            await transporter.sendMail({
                from: '"Admin portal application" <ashuarena@gmail.com>',
                to: email,
                subject: 'Admin-Portal-App: Email Verification Code',
                text: `Your verification code is ${otp}`
            });
            return res.status(200).json({
                message: "Please check your mail to get OTP.",
                user: {
                    email: user?.email
                },
                isLoginOtpSent: true
            });
        }
        if(!user) {
            const newUser = new AccountCreation({
                email,
                verify_otp: otp
            });
            await newUser.save();

            await transporter.sendMail({
                from: '"Admin portal application" <ashuarena@gmail.com>',
                to: email,
                subject: 'Admin-Portal-App: Email Verification Code',
                text: `Your verification code is ${otp}`
            });
            return res.status(200).json({
                message: "Your account has been created.",
                user: {
                    email: newUser?.email
                },
            });
        }
        else {
            return res.status(401).send({message: 'Please provide correct details.'});
        }
    } catch (error) {
        res.send({error: error?.errmsg});
    }
});

const generateSixDigitCode = () => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0] % 1000000).padStart(6, '0'); // ensures it's 6 digits
  };

routerAccount.post("/verify", async (req, res) => {
    try {
    
        const { otp, email } = req.body;
        if (otp) {
            // Check If User Exists In The Database
            const user = await AccountCreation.findOne({ email, verify_otp: otp });
            if(user) {
                // Generate JWT Token
                const token = jwt.sign({
                    userId: user._id,
                    email: user.email
                },
                "1234!@#%<{*&)",
                {
                    expiresIn: "24h",
                });

                res.cookie("auth", token, {
                    httpOnly: true, // ✅ Prevents client-side access
                    secure: true, // ✅ Use HTTPS in production
                    sameSite: "Strict" // ✅ Prevents CSRF attacks
                });

                await transporter.sendMail({
                    from: '"Admin portal application" <ashuarena@gmail.com>',
                    to: email,
                    subject: 'Admin-Portal-App: Your account has been verified successfully!',
                    text: `You can now start browsing the app's pages. Happy Browsing!!!`
                });
                return res.status(200).json({
                    message: "Your account has been created.",
                    user,
                    token
                });
            } else {
                return res.status(401).send({message: 'Please provide correct details.'});
            }
        }
    } catch (error) {
        res.send({error: error?.errmsg});
    }
});

routerAccount.post('/user-info', async (req, res) => {

    const { email } = req?.body;

    try {
        const userInfo = await AccountCreation.findOne({ email });
        return res
            .status(200)
            .json({
                user: userInfo,
            });
    } catch (error) {
        return res
            .status(403)
            .json({error: error?.errmsg});
    }
})

module.exports = { routerAccount };

