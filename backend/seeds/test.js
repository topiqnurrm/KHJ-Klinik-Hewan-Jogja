// test-email.js
import dotenv from "dotenv";
dotenv.config();

import sendVerificationEmail from "../utils/email.js"; // pastikan path ini sesuai!

console.log("✅ ENV EMAIL_USER:", process.env.EMAIL_USER);
console.log("✅ ENV EMAIL_PASS:", process.env.EMAIL_PASS ? "✔️ Loaded" : "❌ Not loaded");

sendVerificationEmail("topique01@gmail.com")
  .then(() => console.log("✅ Email test berhasil"))
  .catch((err) => console.error("❌ Gagal kirim email:", err));
