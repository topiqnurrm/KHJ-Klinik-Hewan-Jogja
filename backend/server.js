// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.js';
import sendVerificationEmail from './utils/email.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/klinik_hewan')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route test
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Route ambil data klien
app.get('/api/users/klien', async (req, res) => {
  try {
    const user = await User.findOne({ aktor: 'klien' });
    if (!user) {
      return res.status(404).json({ message: 'User klien tidak ditemukan' });
    }
    res.json(user);
  } catch (error) {
    console.error('Terjadi error saat mengambil data user klien:', error);
    res.status(500).json({ message: error.message, detail: error });
  }
});

// Route registrasi user
app.post('/api/users', async (req, res) => {
  const {
    nama,
    email,
    password,
    telepon,
    alamat,
    aktor,
    gender,
    tanggal_lahir
  } = req.body;

  try {
    if (!nama || !email || !password || !telepon || !alamat || !gender || !tanggal_lahir) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const cekEmail = await User.findOne({ email });
    if (cekEmail) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const plainPassword = password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    try {
      await sendVerificationEmail(email, plainPassword);
    } catch (emailError) {
      return res.status(500).json({ message: "Gagal mengirim email verifikasi." });
    }

    const user = new User({
      nama,
      email,
      password: hashedPassword,
      telepon,
      alamat,
      aktor,
      gender,
      tanggal_lahir,
    });

    await user.save();

    res.status(201).json({
      message: "Registrasi berhasil! Email telah dikirim.",
      user,
    });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server.", detail: error });
  }
});

// Route login
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email tidak terdaftar." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: "Login berhasil.",
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server.", detail: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
