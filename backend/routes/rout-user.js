import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import sendVerificationEmail from '../utils/email.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Konfigurasi storage untuk multer - menggunakan direktori yang benar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Gunakan path.resolve untuk memastikan path separator yang benar
      // Dan gunakan 'images' sebagai target direktori (bukan 'backend\images')
      const uploadPath = path.resolve(process.cwd(), 'images');
      
      console.log('Target upload path:', uploadPath);
      
      // Pastikan direktori ada
      if (!fs.existsSync(uploadPath)) {
        console.log('Creating directory:', uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      // Nama file akan diganti dengan ID dari user
      // Ekstensi tetap .png sesuai ketentuan
      cb(null, req.params.id + '.png');
      console.log('Saving file as:', req.params.id + '.png');
    }
});

// Filter file - hanya terima image/png
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Hanya file PNG yang diperbolehkan'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Batasi ukuran file 5MB
  }
});

// ✅ [POST] Registrasi user baru
router.post('/', async (req, res) => {
    try {
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

        // Validasi data minimal
        if (!nama || !email || !password || !telepon || !alamat || !gender || !tanggal_lahir) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        // Cek duplikat email
        const cekEmail = await User.findOne({ email });
        if (cekEmail) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Simpan user ke database dengan password yang sudah di-hash
        const user = new User({
            nama,
            email,
            password: hashedPassword, // Save hashed password
            telepon,
            alamat,
            aktor,
            gender,
            tanggal_lahir
        });

        await user.save();

        // Kirim email verifikasi
        try {
            await sendVerificationEmail(email, password); // Kirim email dengan password yang belum di-hash
        } catch (emailError) {
            console.error("Error saat mengirim email verifikasi:", emailError);
            // Kita tetap melanjutkan proses registrasi meskipun email gagal terkirim
        }

        res.status(201).json({ message: "Registrasi berhasil", user });
    } catch (err) {
        console.error("Error saat registrasi user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// API khusus untuk mengirim email verifikasi
router.post('/send-verification-email', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password diperlukan" });
        }
        
        await sendVerificationEmail(email, password);
        res.status(200).json({ message: "Email verifikasi berhasil dikirim" });
    } catch (error) {
        console.error("Error saat mengirim email verifikasi:", error);
        res.status(500).json({ message: "Gagal mengirim email verifikasi" });
    }
});

// ✅ [GET] Ambil semua data user
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Jangan tampilkan password
        res.status(200).json(users);
    } catch (error) {
        console.error("Error saat mengambil semua data user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ [GET] Ambil data user dengan peran klien
router.get('/klien', async (req, res) => {
    try {
        const users = await User.find({ aktor: 'klien' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error("Error saat mengambil data klien:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ [GET] Ambil data user berdasarkan ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    // Validasi ID apakah merupakan ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID tidak valid" });
    }

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error saat mengambil data user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ [DELETE] Hapus user berdasarkan ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    // Validasi ID apakah merupakan ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID tidak valid" });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.status(200).json({ message: "User berhasil dihapus", user: deletedUser });
    } catch (error) {
        console.error("Error saat menghapus user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Modified PUT handler for user updates with better error handling
router.put('/:id', upload.single('gambar'), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        console.log(`PUT request for user ${id} started`);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file ? 
            `File received: ${req.file.originalname}, size: ${req.file.size}` : 
            'No file received');
        
        // Validasi ID apakah merupakan ObjectId yang valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`Invalid ID: ${id}`);
            return res.status(400).json({ message: "ID tidak valid" });
        }

        // Verify the user exists before updating
        const existingUser = await User.findById(id);
        if (!existingUser) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        // Jika ada password baru, hash password
        if (updateData.password) {
            console.log('Hashing new password');
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        } else {
            console.log('No password update requested');
            // Remove empty password fields to avoid overwriting with empty string
            delete updateData.password;
        }

        // Jika ada file gambar yang diupload
        if (req.file) {
            console.log(`Updating image path for user ${id}`);
            // Update path gambar di database sesuai dengan expected path di user.js model
            updateData.gambar = `/images/${id}.png`;
        }
        
        console.log('Final update data:', updateData);

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password'); // Jangan kembalikan password dalam response

        if (!updatedUser) {
            console.log(`User update failed for ID: ${id}`);
            return res.status(404).json({ message: "User tidak ditemukan atau gagal update" });
        }

        console.log(`User ${id} updated successfully`);
        res.status(200).json({ 
            message: "User berhasil diupdate", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error saat mengupdate user:", error);
        // Provide more detailed error information for debugging
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack 
        });
    }
});

export default router;