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
      <div style="font-family: Arial, sans-serif; color: #4b0082;">
        <p>Halo,</p>
        <p>Terima kasih telah mendaftar di <strong>Klinik Hewan Kota Yogyakarta</strong>.</p>
        <p>Silakan klik tombol berikut untuk memverifikasi akun Anda:</p>

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
            Website Klinik Hewan Kota Yogyakarta
          </a>
        </p>

        <br/>
        <p><strong>Detail akun Anda:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${to}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p style="color:red;"><em>Pesan ini digunakan untuk catatan akun Anda.</em></p>
        <br/>
        <p>Salam hangat,</p>
        <p><strong>Klinik Hewan Kota Yogyakarta</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail;
