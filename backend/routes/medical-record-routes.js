import express from 'express';
import Booking from '../models/booking.js';
import Kunjungan from '../models/kunjungan.js';
import RekamMedis from '../models/rekam_medis.js';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get single booking by ID
router.get('/booking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID booking tidak valid' });
    }
    
    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data booking' });
  }
});

// Get kunjungan by booking ID
router.get('/kunjungan/by-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'ID booking tidak valid' });
    }
    
    const kunjungan = await Kunjungan.findOne({ id_booking: bookingId });
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }
    
    res.json(kunjungan);
  } catch (error) {
    console.error('Error fetching kunjungan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kunjungan' });
  }
});

// Get rekam medis by kunjungan ID
router.get('/rekam-medis/by-kunjungan/:kunjunganId', async (req, res) => {
  try {
    const { kunjunganId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(kunjunganId)) {
      return res.status(400).json({ message: 'ID kunjungan tidak valid' });
    }
    
    const rekamMedis = await RekamMedis.findOne({ id_kunjungan: kunjunganId });
    
    if (!rekamMedis) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }
    
    res.json(rekamMedis);
  } catch (error) {
    console.error('Error fetching rekam medis:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data rekam medis' });
  }
});

// Get retribusi pembayaran by kunjungan ID
router.get('/retribusi/by-kunjungan/:kunjunganId', async (req, res) => {
  try {
    const { kunjunganId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(kunjunganId)) {
      return res.status(400).json({ message: 'ID kunjungan tidak valid' });
    }
    
    const retribusi = await RetribusiPembayaran.findOne({ id_kunjungan: kunjunganId });
    
    if (!retribusi) {
      return res.status(404).json({ message: 'Retribusi pembayaran tidak ditemukan' });
    }
    
    res.json(retribusi);
  } catch (error) {
    console.error('Error fetching retribusi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data retribusi pembayaran' });
  }
});

export default router;