// routes/pasien.js
import express from 'express';
import Pasien from '../models/pasien.js';

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    try {
      const pasien = await Pasien.find({ id_user: req.params.userId }); // ✅ Sesuai field di DB
      res.json(pasien);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data pasien' });
    }
  });
  

  router.post('/', async (req, res) => {
    try {
      const pasien = new Pasien(req.body);
      await pasien.save();
      res.status(201).json(pasien);
    } catch (err) {
      console.error("Error saat menambahkan pasien:", err);
      res.status(400).json({ message: err.message || "Gagal menambahkan pasien" });
    }
});
  
  
// Hapus data pasien berdasarkan ID
router.delete('/:id', async (req, res) => {
  try {
    await Pasien.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pasien berhasil dihapus' });
  } catch (error) {
    console.error("Gagal menghapus pasien:", error);
    res.status(500).json({ message: 'Gagal menghapus pasien' });
  }
});

// Update data pasien berdasarkan ID
router.put('/:id', async (req, res) => {
  try {
    const updatedPasien = await Pasien.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPasien) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan' });
    }
    res.json(updatedPasien);
  } catch (error) {
    console.error("Gagal memperbarui pasien:", error);
    res.status(500).json({ message: 'Gagal memperbarui data pasien' });
  }
});


export default router;