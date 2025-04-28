import express from 'express';
import Booking from '../models/booking.js';
import Kunjungan from '../models/kunjungan.js';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';

const router = express.Router();

// Endpoint untuk ambil booking + grand_total dari retribusi
router.get('/with-retribusi', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'id_pasien',
        select: 'nama nama_hewan id_user',
        populate: {
          path: 'id_user',
          select: 'nama email' // Include the user fields you need
        }
      })
      .populate({
        path: 'pelayanans1',
        populate: {
          path: 'id_pelayanan',
          model: 'Pelayanan'
        }
      })
      .populate('administrasis1')
      .sort({ createdAt: -1 });
  
    // Rest of your code remains the same
    const bookingsWithGrandTotal = await Promise.all(
      bookings.map(async (booking) => {
        const kunjungan = await Kunjungan.findOne({ id_booking: booking._id });
        if (!kunjungan) return { ...booking.toObject(), grand_total: 0 };

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
