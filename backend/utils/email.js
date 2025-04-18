import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, password) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: "Verifikasi Akun Anda - Klinik Hewan Kota Yogyakarta",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di <strong>Klinik Hewan Kota Yogyakarta</strong>.</p>
        <p>Silakan klik tombol berikut untuk login ke akun Anda:</p>

        <p>
          <a href="https://www.google.com" style="
            display: inline-block;
            background-color: #4b0082;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          ">
            Masuk ke Website Klinik
          </a>
        </p>

        <div style="margin-top: 20px;">
          <p><strong>Detail Akun Anda:</strong></p>
          <p>Email: <strong>${to}</strong></p>
          <p>Password: <strong>${password}</strong></p>
          <p style="font-size: 12px; color: #666;">Catat informasi ini untuk login di kemudian hari.</p>
        </div>

        <p style="margin-top: 30px;">Salam hangat,</p>
        <p><strong>Klinik Hewan Kota Yogyakarta</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
