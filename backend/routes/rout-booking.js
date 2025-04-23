import express from 'express';
import Booking from '../models/booking.js';
import Hewan from '../models/pasien.js'; 


const router = express.Router();

// 🔘 Tambah booking baru
router.post('/booking', async (req, res) => {
  try {
    const {
      id_pasien,
      pilih_tanggal,
      keluhan,
      status_booking = 'menunggu respon administrasi',
      pelayanans1 = [],
      administrasis1 = []
    } = req.body;

    // Validasi agar tanggal booking tidak lebih kecil dari hari ini
    const tanggalBooking = new Date(pilih_tanggal);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of the day

    if (tanggalBooking < today) {
      return res.status(400).json({ message: 'Tanggal booking tidak boleh lebih kecil dari hari ini.' });
    }

    // Validasi keluhan agar tidak lebih dari 250 kata
    const wordCount = keluhan.split(' ').length;
    if (wordCount > 250) {
      return res.status(400).json({ message: 'Keluhan tidak boleh lebih dari 250 kata.' });
    }

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

// 🔍 Ambil semua booking
router.get('/all', async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate({
          path: 'id_pasien',
          select: 'nama id_user' // penting: supaya bisa akses id_user dari pasien
        })
        .sort({ createdAt: -1 });
  
      res.json(bookings);
    } catch (error) {
      console.error('Gagal mengambil booking:', error);
      res.status(500).json({ message: 'Gagal mengambil data booking' });
    }
  });



  // 🔔 Endpoint untuk cek apakah ada booking belum selesai
  import mongoose from 'mongoose';

  router.get('/ada-booking-belum-selesai/:id_pasien', async (req, res) => {
    try {
      const { id_pasien } = req.params;
  
      // Ubah string jadi ObjectId
      const idPasienObj = new mongoose.Types.ObjectId(id_pasien);
  
      const count = await Booking.countDocuments({
        id_pasien: idPasienObj,
        status_booking: { $ne: "selesai" }
      });
  
      console.log("ID pasien:", id_pasien);
      console.log("Jumlah booking belum selesai:", count);
  
      res.json({ ada: count > 0 });
    } catch (error) {
      console.error('Gagal cek booking belum selesai:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat cek status booking' });
    }
  });  


// 🔍 Ambil semua booking berdasarkan ID pasien
router.get('/by-user/:id_pasien', async (req, res) => {
  try {
    const { id_pasien } = req.params;
    const bookings = await Booking.find({ id_pasien }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Gagal mengambil booking user:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data booking user' });
  }
});


export default router;



// 🔍 Cek apakah user punya booking belum selesai
router.get('/cek-booking-user/:id_user', async (req, res) => {
  try {
    const { id_user } = req.params;

    // Ambil semua hewan milik user
    const hewans = await Hewan.find({ id_user });

    if (hewans.length === 0) {
      return res.json({ ada: false }); // Tidak punya hewan = tidak ada booking
    }

    // Ambil semua ID hewan
    const idHewanArray = hewans.map(h => h._id);

    // Cek apakah ada booking dengan status bukan "selesai"
    const unfinishedBooking = await Booking.exists({
      id_pasien: { $in: idHewanArray },
      status_booking: { $ne: "selesai" }
    });

    res.json({ ada: !!unfinishedBooking });
  } catch (error) {
    console.error("Gagal cek booking user:", error);
    res.status(500).json({ message: 'Terjadi kesalahan saat cek booking user' });
  }
});
