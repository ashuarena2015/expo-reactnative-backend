const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    isVerified: { type: Boolean },
    verify_otp: { type: String }
  },
  { timestamps: true, discriminatorKey: "kind" },
);

const AccountCreation = mongoose.model("Account", AccountSchema);

module.exports = { AccountCreation };
