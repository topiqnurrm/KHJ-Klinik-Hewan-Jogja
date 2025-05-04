import express from 'express';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all bookings with detailed information
router.get('/', async (req, res) => {
  try {
    // Get all bookings with their info
    const bookings = await Booking.find()
      .populate({
        path: 'id_pasien',
        select: 'nama jenis kategori id_user'
      })
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    // Create an array to hold enhanced booking data
    const enhancedBookings = [];

    // Process each booking to include client name (owner)
    for (const booking of bookings) {
      let clientData = { nama: 'N/A' };
      
      // Check if booking has administrasis1 entries
      if (booking.administrasis1 && booking.administrasis1.length > 0) {
        // Sort by date to get the earliest entry
        const earliestAdmin = [...booking.administrasis1].sort((a, b) => 
          new Date(a.tanggal) - new Date(b.tanggal)
        )[0];
        
        if (earliestAdmin.id_user) {
          // Try to find the user
          const user = await User.findById(earliestAdmin.id_user);
          if (user) {
            clientData = { nama: user.nama };
          }
        }
      }
      
      // Get the latest note from administrasis1 if available
      let latestNote = '';
      if (booking.administrasis1 && booking.administrasis1.length > 0) {
        // Sort by date to get the latest entry
        const latestAdmin = [...booking.administrasis1].sort((a, b) => 
          new Date(b.tanggal) - new Date(a.tanggal)
        )[0];
        
        latestNote = latestAdmin.catatan || '';
      }

      // Create enhanced booking object
      enhancedBookings.push({
        _id: booking._id,
        tanggal_buat: booking.createdAt,
        tanggal_booking: booking.pilih_tanggal,
        klien: clientData.nama,
        nama_hewan: booking.nama,
        jenis_hewan: booking.kategori,
        jenis_layanan: booking.jenis_layanan,
        catatan: latestNote,
        status: booking.status_booking,
        tanggal_edit: booking.updatedAt
      });
    }

    res.status(200).json(enhancedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Gagal mengambil data booking', error: error.message });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'id_pasien',
        select: 'nama jenis kategori id_user'
      });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    // Get client data
    let clientData = { nama: 'N/A' };
    if (booking.administrasis1 && booking.administrasis1.length > 0) {
      const earliestAdmin = [...booking.administrasis1].sort((a, b) => 
        new Date(a.tanggal) - new Date(b.tanggal)
      )[0];
      
      if (earliestAdmin.id_user) {
        const user = await User.findById(earliestAdmin.id_user);
        if (user) {
          clientData = { nama: user.nama };
        }
      }
    }
    
    // Get latest note
    let latestNote = '';
    if (booking.administrasis1 && booking.administrasis1.length > 0) {
      const latestAdmin = [...booking.administrasis1].sort((a, b) => 
        new Date(b.tanggal) - new Date(a.tanggal)
      )[0];
      
      latestNote = latestAdmin.catatan || '';
    }

    // Create enhanced booking object
    const enhancedBooking = {
      _id: booking._id,
      tanggal_buat: booking.createdAt,
      tanggal_booking: booking.pilih_tanggal,
      klien: clientData.nama,
      nama_hewan: booking.nama,
      jenis_hewan: booking.kategori,
      jenis_layanan: booking.jenis_layanan,
      catatan: latestNote,
      status: booking.status_booking,
      tanggal_edit: booking.updatedAt,
      // Include original booking data for detailed view
      originalBooking: booking
    };

    res.status(200).json(enhancedBooking);
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    res.status(500).json({ message: 'Gagal mengambil data booking', error: error.message });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status diperlukan' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status_booking: status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Gagal mengupdate status booking', error: error.message });
  }
});

// Add note to booking
router.post('/:id/catatan', async (req, res) => {
  try {
    const { id_user, catatan, status_administrasi } = req.body;
    
    if (!id_user || !catatan) {
      return res.status(400).json({ message: 'ID user dan catatan diperlukan' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    // Add new entry to administrasis1
    booking.administrasis1.push({
      id_user,
      catatan,
      status_administrasi: status_administrasi || 'menunggu respon administrasi',
      tanggal: new Date()
    });

    // Update booking status if provided
    if (status_administrasi) {
      booking.status_booking = status_administrasi;
    }

    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    console.error('Error adding note to booking:', error);
    res.status(500).json({ message: 'Gagal menambahkan catatan', error: error.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    res.status(200).json({ message: 'Booking berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Gagal menghapus booking', error: error.message });
  }
});

export default router;