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
        const existingUser = await AccountCreation.findOne({ email: req.user?.email });
        return res
            .status(200)
            .json({
                user: existingUser,
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
        if(!user) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const newUser = new AccountCreation({
                email,
                isVerified: false,
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
                isVerified: false
            });
        }
        if (user && user?.isVerified) {
            return res.status(201).json({ message: "User verified, please enter passowrd", isVerified: true, user });
        } else {
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
    
        const { otp, email, password } = req.body;
        if (otp) {
            // Check If User Exists In The Database
            const user = await AccountCreation.findOne({ email, isVerified: false, verify_otp: otp });
            if(user) {
                const defaultPassoword = generateSixDigitCode();
                // 🔹 Hash the password with a salt
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(defaultPassoword, saltRounds);
                const newUser = await AccountCreation.findOneAndUpdate(
                    {
                        email,
                        verify_otp: otp
                    },
                    {
                        password: hashedPassword,
                        isVerified: true
                    }
                );
                console.log({newUser});
                await transporter.sendMail({
                    from: '"Admin portal application" <ashuarena@gmail.com>',
                    to: email,
                    subject: 'Admin-Portal-App: Your password',
                    text: `Your default password is ${defaultPassoword}, please change your password on profile page.`
                });
                return res.status(200).json({
                    message: "Your account has been created.",
                    user: newUser,
                    isVerified: true
                });
            }
            if (user && user?.isVerified) {
                return res.status(201).json({ message: "User verified, please enter passowrd", isVerifiedUser: true });
            } else {
                console.log('user && !passwordMatch');
                return res.status(401).send({message: 'Please provide correct details.'});
            }
        } 
        if (password) {
            const user = await AccountCreation.findOne({ email, isVerified: true });
            // Compare Passwords
            const passwordMatch = await bcrypt.compare(password, user.password);
            if(!user || !passwordMatch) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

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

            return res.status(200).json({
                message: "Login Successful",
                user,
                token,
                isVerified: true
            });
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

