// Converting from CommonJS to ES Modules syntax
import express from 'express';
import mongoose from 'mongoose';
// Import User model - adjust the path as needed
import User from '../models/user.js'; 

const router = express.Router();

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

        // Simpan user ke database
        const user = new User({
            nama,
            email,
            password,
            telepon,
            alamat,
            aktor,
            gender,
            tanggal_lahir
        });

        await user.save();

        res.status(201).json({ message: "Registrasi berhasil", user });
    } catch (err) {
        console.error("Error saat registrasi user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ [GET] Ambil semua data user
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error saat mengambil semua data user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ [GET] Ambil data user dengan peran klien
// PENTING: Router khusus harus ditempatkan SEBELUM router dengan parameter dinamis
router.get('/klien', async (req, res) => {
    try {
        const users = await User.find({ aktor: 'klien' });
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
        const user = await User.findById(id);
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

// ✅ [PUT] Update user berdasarkan ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // Validasi ID apakah merupakan ObjectId yang valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID tidak valid" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        res.status(200).json({ message: "User berhasil diupdate", user: updatedUser });
    } catch (error) {
        console.error("Error saat mengupdate user:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;