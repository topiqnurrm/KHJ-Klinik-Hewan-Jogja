import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import sendVerificationEmail from '../utils/email.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Konfigurasi storage untuk multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.resolve(process.cwd(), 'images');
      
      console.log('Target upload path:', uploadPath);
      
      if (!fs.existsSync(uploadPath)) {
        console.log('Creating directory:', uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
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

// Endpoint untuk update profile user
router.put('/profile/:id', upload.single('gambar'), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        console.log(`PUT request for edit profile user ${id}`);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file ? 
            `File received: ${req.file.originalname}, size: ${req.file.size}` : 
            'No file received');
        
        // Validasi ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`Invalid ID: ${id}`);
            return res.status(400).json({ message: "ID tidak valid" });
        }

        // Cek apakah user ada
        const existingUser = await User.findById(id);
        if (!existingUser) {
            console.log(`User not found with ID: ${id}`);
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        // Jika ada password baru, hash password
        if (updateData.password && updateData.password.trim() !== '') {
            console.log('Hashing new password');
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        } else {
            console.log('No password update requested');
            // Hapus field password jika kosong
            delete updateData.password;
        }

        // Jika email diubah, verifikasi tidak ada duplikat
        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await User.findOne({ 
                email: updateData.email,
                _id: { $ne: id } // Exclude current user
            });
            
            if (emailExists) {
                return res.status(409).json({ message: "Email sudah digunakan oleh pengguna lain" });
            }
        }

        // Jika ada file gambar yang diupload
        if (req.file) {
            console.log(`Updating image path for user ${id}`);
            updateData.gambar = `/images/${id}.png`;
        }
        
        console.log('Final update data:', updateData);

        // Update user
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
            message: "Profil berhasil diupdate", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Error saat mengupdate profil user:", error);
        // Provide more detailed error information for debugging
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : error.stack 
        });
    }
});

// Endpoint khusus untuk verifikasi email setelah update
router.post('/send-profile-verification', async (req, res) => {
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

export default router;