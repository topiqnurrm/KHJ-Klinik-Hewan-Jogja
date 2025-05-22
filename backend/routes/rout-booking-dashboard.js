import express from 'express';
import Kunjungan from '../models/kunjungan.js';

const router = express.Router();

// Perbaikan untuk route-kunjungan.js
// Ganti endpoint '/all' yang sudah ada dengan yang baru

// 🔍 Ambil semua data kunjungan dengan filter tanggal
router.get('/all', async (req, res) => {
  try {
    const { startDate, endDate, date } = req.query;
    
    let dateFilter = {};
    
    if (date) {
      // Filter untuk tanggal spesifik
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateFilter = {
        tanggal: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      };
    } else if (startDate && endDate) {
      // Filter untuk rentang tanggal
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dateFilter = {
        tanggal: {
          $gte: start,
          $lte: end
        }
      };
    }
    
    // PERBAIKAN: Populate lebih lengkap dan sertakan kategori dari booking
    const data = await Kunjungan.find(dateFilter)
      .populate({
        path: 'id_booking',
        populate: {
          path: 'id_pasien',
          select: 'nama kategori jenis_kelamin ras id_user'
        },
        select: 'id_pasien pilih_tanggal jenis_layanan kategori nama' // Tambahkan kategori dan nama
      })
      .sort({ createdAt: -1 });

    // PERBAIKAN: Pastikan setiap kunjungan memiliki kategori
    const enrichedData = data.map(kunjungan => {
      const kunjunganObj = kunjungan.toObject();
      
      // Jika tidak ada kategori di kunjungan, ambil dari booking
      if (!kunjunganObj.kategori && kunjunganObj.id_booking?.kategori) {
        kunjunganObj.kategori = kunjunganObj.id_booking.kategori;
      }
      
      // Pastikan nama hewan tersedia
      if (!kunjunganObj.nama_hewan) {
        if (kunjunganObj.id_booking?.nama) {
          kunjunganObj.nama_hewan = kunjunganObj.id_booking.nama;
        } else if (kunjunganObj.id_booking?.id_pasien?.nama) {
          kunjunganObj.nama_hewan = kunjunganObj.id_booking.id_pasien.nama;
        }
      }
      
      return kunjunganObj;
    });

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Gagal mengambil data kunjungan:', error);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan' });
  }
});

export default router;