const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    phone: String,
    otp: String,
    createdAt: { type: Date, expires: 300, default: Date.now }, // OTP expires in 5 mins
});
  
const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
