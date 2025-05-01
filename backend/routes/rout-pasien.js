import express from 'express';
import Pasien from '../models/pasien.js';
import Booking from '../models/booking.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const pasien = await Pasien.find({});
    res.json(pasien);
  } catch (error) {
    console.error("Error fetching all patients:", error);
    res.status(500).json({ message: 'Gagal mengambil semua data pasien' });
  }
});

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
    const idHewan = req.params.id;

    // Cek apakah hewan ini masih ada booking yang belum selesai
    const hasUnfinishedBooking = await Booking.exists({
      id_pasien: idHewan,
      status_booking: { $ne: 'selesai' }
    });

    if (hasUnfinishedBooking) {
      return res.status(400).json({
        message: 'Data hewan ini telah Anda daftarkan di booking dan belum menyelesaikannya.'
      });
    }

    // Kalau aman, lanjut hapus hewan
    await Pasien.findByIdAndDelete(idHewan);
    res.status(200).json({ message: 'Hewan berhasil dihapus' });

  } catch (error) {
    console.error("Gagal menghapus hewan:", error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus hewan' });
  }
});

// Update data pasien berdasarkan ID dan juga semua booking terkait
router.put('/:id', async (req, res) => {
  try {
    const pasienId = req.params.id;
    const updateData = req.body;

    console.log("Updating pasien with ID:", pasienId);
    console.log("Update data:", updateData);

    // 1. Update pasien data
    const updatedPasien = await Pasien.findByIdAndUpdate(
      pasienId,
      updateData,
      { new: true }
    );

    if (!updatedPasien) {
      return res.status(404).json({ message: 'Pasien tidak ditemukan' });
    }

    // 2. Jika nama hewan berubah, update semua booking terkait
    if (updateData.nama) {
      const bookingUpdateResult = await Booking.updateMany(
        { id_pasien: pasienId },
        { $set: { nama: `${updateData.nama} (${updateData.jenis})` } },
        { timestamps: false }
      );      

      console.log(`Updated ${bookingUpdateResult.modifiedCount} booking records`);
    }

    res.json({
      pasien: updatedPasien,
      message: 'Data pasien dan booking terkait berhasil diperbarui'
    });
  } catch (error) {
    console.error("Gagal memperbarui pasien:", error);
    res.status(500).json({
      message: 'Gagal memperbarui data pasien',
      error: error.message
    });
  }
});


export default router;