import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/user.js';
import sendVerificationEmail from './utils/email.js';

import multer from 'multer';
import fs from 'fs';

import pasienRouter from './routes/rout-pasien.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Support untuk path ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// Middleware untuk CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked origin:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));


app.use(express.json());

// Middleware static file, biar folder images bisa diakses dari URL
app.use('/images', express.static(path.join(__dirname, 'images')));

// Koneksi ke MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/klinik_hewan')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Route test
app.get('/', (req, res) => {
  res.send('Server is running');
});



// app.use('/api/pasien', require('./routes/rout-pasien'));
app.use('/api/pasien', pasienRouter);


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
  const { nama, email, password, telepon, alamat, aktor, gender, tanggal_lahir } = req.body;

  try {
    if (!nama || !email || !password || !telepon || !alamat || !gender || !tanggal_lahir) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const cekEmail = await User.findOne({ email });
    if (cekEmail) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      await sendVerificationEmail(email, password);
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
import jwt from 'jsonwebtoken';

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

    // Buat token
    const token = jwt.sign(
      { id: user._id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );

    // Hapus password sebelum dikirim ke frontend
    const userData = user.toObject();
    delete userData.password;

    // Kirim token + data user
    res.json({
      message: "Login berhasil.",
      user: userData,
      // user: updatedUser,
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server.", detail: error.message });
  }
});

// Route get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error ambil user by ID:', error);
    res.status(500).json({ message: "Server error", detail: error });
  }
});

app.post('/api/send-verification-email', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  try {
    await sendVerificationEmail(email, password);
    res.status(200).json({ message: "Email verifikasi berhasil dikirim." });
  } catch (error) {
    console.error("Gagal mengirim email verifikasi:", error);
    res.status(500).json({ message: "Gagal mengirim email verifikasi." });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Upload gambar
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload.' });
    }

    const imageUrl = `http://localhost:${PORT}/images/${req.file.filename}`;
    res.status(200).json({ message: 'Upload berhasil', imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Gagal upload gambar', error });
  }
});


app.put('/api/users/:id', upload.single('gambar'), async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = {
      nama: req.body.nama,
      email: req.body.email,
      telepon: req.body.telepon,
      alamat: req.body.alamat,
      gender: req.body.gender,
      tanggal_lahir: req.body.tanggal_lahir,
    };

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    // Ganti nama file ke <user_id>.png
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();

      // Validasi hanya menerima file PNG
      if (ext !== '.png') {
        fs.unlinkSync(req.file.path); // Hapus file sementara
        return res.status(400).json({ message: 'Hanya file PNG yang diperbolehkan.' });
      }

      const newFileName = `${id}.png`;
      const newPath = path.join(__dirname, 'images', newFileName);

      // Hapus file lama jika ada
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }

      fs.renameSync(req.file.path, newPath); // Rename file

      updateData.gambar = `/images/${newFileName}`;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.status(200).json({ message: 'User berhasil diperbarui', user: updatedUser });
  } catch (error) {
    console.error('Gagal update user:', error);
    res.status(500).json({ message: 'Gagal update user', error });
  }
});
