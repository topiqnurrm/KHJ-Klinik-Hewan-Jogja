import express from 'express';
import Booking from '../models/booking.js';

const router = express.Router();

// 🔘 Tambah booking baru
router.post('/booking', async (req, res) => {
  try {
    const {
      id_pasien,
      pilih_tanggal,
      keluhan,
      status_booking = 'menunggu',
      pelayanans1 = [],
      administrasis1 = []
    } = req.body;

    const tanggalMulai = new Date(pilih_tanggal);
    tanggalMulai.setHours(0, 0, 0, 0);
    const tanggalAkhir = new Date(tanggalMulai);
    tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);

    const bookingCount = await Booking.countDocuments({
      pilih_tanggal: {
        $gte: tanggalMulai,
        $lt: tanggalAkhir
      }
    });

    if (bookingCount >= 5) {
      return res.status(400).json({ message: 'Kuota booking untuk tanggal ini sudah penuh.' });
    }

    const newBooking = new Booking({
      id_pasien,
      pilih_tanggal,
      keluhan,
      status_booking,
      pelayanans1,
      administrasis1
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking berhasil ditambahkan', booking: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan booking' });
  }
});

// Endpoint untuk cek ketersediaan slot
router.get('/cek-ketersediaan', async (req, res) => {
    try {
      const { tanggal } = req.query;
  
      if (!tanggal) {
        return res.status(400).json({ message: 'Tanggal diperlukan' });
      }
  
      const tanggalMulai = new Date(tanggal);
      tanggalMulai.setHours(0, 0, 0, 0);
      const tanggalAkhir = new Date(tanggalMulai);
      tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);
  
      const bookingCount = await Booking.countDocuments({
        pilih_tanggal: {
          $gte: tanggalMulai,
          $lt: tanggalAkhir
        }
      });
  
      const sisa = Math.max(5 - bookingCount, 0);
      res.json({
        tanggal: tanggalMulai.toISOString().split('T')[0],
        total_booking: bookingCount,
        tersedia: sisa,  // Pastikan properti ini ada
        message: `Sudah ada ${bookingCount} pesanan di tanggal ini. Tersedia ${sisa} slot lagi.`
      });
    } catch (error) {
      console.error('Gagal cek ketersediaan:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat cek ketersediaan booking' });
    }
  });
  

export default router;
