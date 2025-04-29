import express from 'express';
import Booking from '../models/booking.js';
import Hewan from '../models/pasien.js'; 
import Pelayanan from '../models/pelayanan.js';
import mongoose from 'mongoose';

const router = express.Router();

// Update the booking creation endpoint to ensure nama, pelayanan, and alamat details are saved
router.post('/booking', async (req, res) => {
  try {
    const {
      id_pasien,
      pilih_tanggal,
      keluhan,
      nama,
      kategori,
      jenis_layanan,
      alamat, // Add alamat field
      status_booking = 'menunggu respon administrasi',
      pelayanans1 = [],
      administrasis1 = []
    } = req.body;

    // Validate required fields
    if (!id_pasien) {
      return res.status(400).json({ message: 'ID pasien diperlukan' });
    }
    
    if (!pilih_tanggal) {
      return res.status(400).json({ message: 'Tanggal diperlukan' });
    }

    // Validate alamat for house call
    if (jenis_layanan === 'house call' && !alamat) {
      return res.status(400).json({ message: 'Alamat diperlukan untuk house call' });
    }

    // If nama is not provided but id_pasien is, fetch the name
    let pasienNama = nama;
    let pasienKategori = kategori;
    
    if ((!pasienNama || !pasienKategori) && id_pasien) {
      try {
        const pasien = await Hewan.findById(id_pasien);
        if (pasien) {
          if (!pasienNama) pasienNama = `${pasien.nama} (${pasien.jenis})`;
          if (!pasienKategori) pasienKategori = pasien.kategori;
        }
      } catch (err) {
        console.error('Error fetching pasien data:', err);
      }
    }

    // Process pelayanans1 to ensure service names are included
    const processedPelayanans = [...pelayanans1];
    for (let i = 0; i < processedPelayanans.length; i++) {
      if (processedPelayanans[i].id_pelayanan) {
        try {
          // Fetch the pelayanan service details
          const pelayanan = await Pelayanan.findById(processedPelayanans[i].id_pelayanan);
          if (pelayanan) {
            // Make sure to include both name and service type
            if (!processedPelayanans[i].nama) {
              processedPelayanans[i].nama = pelayanan.nama;
            }
            if (!processedPelayanans[i].jenis_layanan) {
              processedPelayanans[i].jenis_layanan = pelayanan.jenis_layanan;
            }
          }
        } catch (err) {
          console.error('Error fetching pelayanan details:', err);
        }
      }
    }

    // Create booking object with all fields including alamat
    const newBooking = new Booking({
      id_pasien,
      pilih_tanggal,
      keluhan,
      status_booking,
      pelayanans1: processedPelayanans,
      nama: pasienNama,
      kategori: pasienKategori,
      jenis_layanan,
      alamat, // Include alamat field
      administrasis1
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking berhasil ditambahkan', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan booking' });
  }
});

// Endpoint untuk cek ketersediaan slot
router.get('/cek-ketersediaan', async (req, res) => {
  try {
    const { tanggal, excludeBookingId } = req.query;

    if (!tanggal) {
      return res.status(400).json({ message: 'Tanggal diperlukan' });
    }

    const tanggalMulai = new Date(tanggal);
    tanggalMulai.setHours(0, 0, 0, 0);
    const tanggalAkhir = new Date(tanggalMulai);
    tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);

    // Create the base query object
    const query = {
      pilih_tanggal: {
        $gte: tanggalMulai,
        $lt: tanggalAkhir
      }
    };

    // If excludeBookingId is provided, exclude that booking from the count
    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const bookingCount = await Booking.countDocuments(query);

    const sisa = Math.max(5 - bookingCount, 0);
    res.json({
      tanggal: tanggalMulai.toISOString().split('T')[0],
      total_booking: bookingCount,
      tersedia: sisa,
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

// 🗑️ Delete booking by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }
    
    // Optional: Check if the user has permission to delete this booking
    // For example, only allow deletion if status is in certain states
    const allowedStatuses = [
      'menunggu respon administrasi',
      'disetujui administrasi',
      'ditolak administrasi',
      'dibatalkan administrasi'
    ];
    
    if (!allowedStatuses.includes(booking.status_booking)) {
      return res.status(403).json({ 
        message: 'Booking tidak dapat dihapus karena status sudah berubah' 
      });
    }
    
    await Booking.findByIdAndDelete(id);
    res.json({ message: 'Booking berhasil dihapus' });
  } catch (error) {
    console.error('Gagal menghapus booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus booking' });
  }
});

// Enhance the update booking endpoint to better handle nama and pelayanan details
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log("Received booking update:", {
      id,
      data: updateData
    });
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }
    
    // Optional: Check if the user has permission to update this booking
    const allowedStatuses = [
      'menunggu respon administrasi',
      'disetujui administrasi',
      'ditolak administrasi',
      'dibatalkan administrasi'
    ];
    
    if (!allowedStatuses.includes(booking.status_booking)) {
      return res.status(403).json({ 
        message: 'Booking tidak dapat diubah karena status sudah berubah' 
      });
    }
    
    // If pelayanans1 exists in the update data, process it to ensure service names are included
    if (updateData.pelayanans1 && updateData.pelayanans1.length > 0) {
      for (let i = 0; i < updateData.pelayanans1.length; i++) {
        if (updateData.pelayanans1[i].id_pelayanan) {
          try {
            const pelayanan = await Pelayanan.findById(updateData.pelayanans1[i].id_pelayanan);
            if (pelayanan) {
              // Make sure to include both name and service type
              if (!updateData.pelayanans1[i].nama) {
                updateData.pelayanans1[i].nama = pelayanan.nama;
              }
              if (!updateData.pelayanans1[i].jenis_layanan) {
                updateData.pelayanans1[i].jenis_layanan = pelayanan.jenis_layanan;
              }
            }
          } catch (err) {
            console.error('Error fetching pelayanan details:', err);
          }
        }
      }
    }
    
    // If nama doesn't exist in the update data but id_pasien does, fetch the name and type
    if (!updateData.nama && updateData.id_pasien) {
      try {
        const pasien = await Hewan.findById(updateData.id_pasien);
        if (pasien) {
          // Format name with type in parentheses
          updateData.nama = `${pasien.nama} (${pasien.jenis})`;
        }
      } catch (err) {
        console.error('Error fetching pasien name:', err);
      }
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    console.log("Updated booking:", {
      id: updatedBooking._id,
      nama: updatedBooking.nama,
      status: updatedBooking.status_booking,
      services: updatedBooking.pelayanans1.map(p => ({ 
        id: p.id_pelayanan, 
        nama: p.nama 
      }))
    });
    
    res.json({ 
      message: 'Booking berhasil diperbarui', 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error('Gagal memperbarui booking:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui booking' });
  }
});

export default router;