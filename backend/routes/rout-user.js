const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('./models/User'); // Pastikan path-nya sesuai

// ✅ [POST] Registrasi user baru
router.post('/api/users', async (req, res) => {
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

// ✅ [GET] Ambil data user berdasarkan ID
router.get('/api/users/:id', async (req, res) => {
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

module.exports = router;
