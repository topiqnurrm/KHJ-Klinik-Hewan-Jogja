import express from 'express';
import Kunjungan from '../models/kunjungan.js';

const router = express.Router();

// 🔍 Ambil semua data kunjungan
router.get('/all', async (req, res) => {
  try {
    const data = await Kunjungan.find()
      .populate({
        path: 'id_booking',
        populate: {
          path: 'id_pasien',
          select: 'nama kategori jenis_kelamin ras id_user'
        },
        select: 'id_pasien pilih_tanggal'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    console.error('Gagal mengambil data kunjungan:', error);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan' });
  }
});

// 🔘 Tambah kunjungan baru
router.post('/tambah', async (req, res) => {
  try {
    const {
      administrasis2 = [],
      id_booking,
      tanggal = new Date(),
      status_kunjungan,
      no_antri
    } = req.body;

    const newKunjungan = new Kunjungan({
      administrasis2,
      id_booking,
      tanggal,
      status_kunjungan,
      no_antri
    });

    await newKunjungan.save();

    res.status(201).json({ message: 'Kunjungan berhasil ditambahkan', kunjungan: newKunjungan });
  } catch (error) {
    console.error('Gagal menambah kunjungan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan kunjungan' });
  }
});

export default router;
