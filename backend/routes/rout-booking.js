import express from 'express';
import Booking from '../models/booking.js';

const router = express.Router();

// Tambah booking baru
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

        // Pastikan tanggal tanpa jam (00:00:00)
        const tanggalMulai = new Date(pilih_tanggal);
        tanggalMulai.setHours(0, 0, 0, 0);
        const tanggalAkhir = new Date(tanggalMulai);
        tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);

        // Hitung booking yang ada pada tanggal yang sama
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

export default router;
