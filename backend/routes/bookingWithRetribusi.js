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
          select: 'nama email'
        }
      })
      .populate({
        path: 'pelayanans1',
        populate: {
          path: 'id_pelayanan',
          model: 'Pelayanan',
          select: 'nama jenis_layanan' // Make sure to select jenis_layanan
        }
      })
      .populate('administrasis1')
      .sort({ createdAt: -1 });
  
    // Add a logging step to see the first booking's services
    if (bookings.length > 0 && bookings[0].pelayanans1 && bookings[0].pelayanans1.length > 0) {
      console.log('Sample booking services data:', 
        bookings[0].pelayanans1.map(s => ({
          nama: s.nama,
          jenis_layanan: s.jenis_layanan,
          from_id: s.id_pelayanan ? {
            nama: s.id_pelayanan.nama,
            jenis_layanan: s.id_pelayanan.jenis_layanan
          } : null
        }))
      );
    }
    
    const bookingsWithGrandTotal = await Promise.all(
      bookings.map(async (booking) => {
        const kunjungan = await Kunjungan.findOne({ id_booking: booking._id });
        if (!kunjungan) return { ...booking.toObject(), grand_total: 0 };

        const retribusi = await RetribusiPembayaran.findOne({ id_kunjungan: kunjungan._id });
        const grandTotal = retribusi?.grand_total || 0;

        // Process the booking data to ensure services have both name and type
        const processedBooking = booking.toObject();
        
        if (processedBooking.pelayanans1) {
          processedBooking.pelayanans1 = processedBooking.pelayanans1.map(service => {
            // Make sure we have the service type information
            if (service.id_pelayanan) {
              return {
                ...service,
                nama: service.nama || service.id_pelayanan.nama,
                jenis_layanan: service.jenis_layanan || service.id_pelayanan.jenis_layanan
              };
            }
            return service;
          });
        }

        return {
          ...processedBooking,
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
