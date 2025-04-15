const express = require('express');
const router = express.Router();
const User = require('./models/User'); // pastikan path-nya sesuai

router.post('/api/users', async (req, res) => {
    try {
        const { nama, email, password, telepon, alamat, aktor, gender, tanggal_lahir } = req.body;

        // Validasi data minimal
        if (!nama || !email || !password || !telepon || !alamat || !gender || !tanggal_lahir) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        // Cek email biar gak dobel
        const cekEmail = await User.findOne({ email });
        if (cekEmail) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        // Simpan ke database
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
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Tambahkan di file yang sama
router.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
