import express from 'express';
import Booking from '../models/booking.js';
import Kunjungan from '../models/kunjungan.js';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';

const router = express.Router();

// Endpoint untuk ambil booking + grand_total dari retribusi
router.get('/with-retribusi', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('id_pasien', 'nama nama_hewan id_user')
      .populate('pelayanans1') // jika masih ingin info layanan
      .populate('administrasis1')
      .sort({ createdAt: -1 });

    const bookingsWithGrandTotal = await Promise.all(
      bookings.map(async (booking) => {
        // cari kunjungan berdasarkan id_booking
        const kunjungan = await Kunjungan.findOne({ id_booking: booking._id });
        if (!kunjungan) return { ...booking.toObject(), grand_total: 0 };

        // cari retribusi berdasarkan id_kunjungan
        const retribusi = await RetribusiPembayaran.findOne({ id_kunjungan: kunjungan._id });
        const grandTotal = retribusi?.grand_total || 0;

        return {
          ...booking.toObject(),
          grand_total: grandTotal
        };
      })
    );

    res.status(200).json(bookingsWithGrandTotal);
  } catch (err) {
    console.error('Gagal mengambil booking dengan grand_total:', err);
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
});

export default router;
