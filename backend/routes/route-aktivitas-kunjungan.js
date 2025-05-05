import express from 'express';
import Kunjungan from '../models/kunjungan.js';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all kunjungan with detailed information
router.get('/', async (req, res) => {
  try {
    // Get all kunjungan with populated booking data
    const kunjungans = await Kunjungan.find()
      .populate({
        path: 'id_booking',
        select: 'nama status_booking pilih_tanggal administrasis1 jenis_layanan kategori keluhan'
      })
      .sort({ tanggal: -1 }); // Sort by check-in date in descending order

    // Create an array to hold enhanced kunjungan data
    const enhancedKunjungans = [];

    // Process each kunjungan to include client name and complete information
    for (const kunjungan of kunjungans) {
      let klienName = 'N/A';
      let namaHewan = 'N/A';
      let jenisLayanan = 'offline';
      let status = 'sedang diperiksa';
      // Add variables to store keluhan and kategori
      let keluhan = 'N/A';
      let kategori = 'kesayangan / satwa liar';  // Default value

      // First check in kunjungan data
      if (kunjungan.keluhan) {
        keluhan = kunjungan.keluhan;
      }
      if (kunjungan.kategori) {
        kategori = kunjungan.kategori;
      }

      // Then check in booking data and override if present
      if (kunjungan.id_booking) {
        const booking = kunjungan.id_booking;
        
        if (booking.keluhan) {
          keluhan = booking.keluhan;
        }
        if (booking.kategori) {
          kategori = booking.kategori;
        }
      }
      
      // First try to get data from the kunjungan record itself
      if (kunjungan.nama_klein) {
        klienName = kunjungan.nama_klein;
      }
      
      if (kunjungan.nama_hewan) {
        namaHewan = kunjungan.nama_hewan + (kunjungan.jenis ? ` (${kunjungan.jenis})` : '');
      }
      
      if (kunjungan.jenis_layanan) {
        jenisLayanan = kunjungan.jenis_layanan;
      }
      
      // Check for status in administrasis2 (most recent status)
      if (kunjungan.administrasis2 && kunjungan.administrasis2.length > 0) {
        // Sort to get the latest entry
        const sortedAdministrasis = [...kunjungan.administrasis2].sort((a, b) => 
          new Date(b.tanggal) - new Date(a.tanggal)
        );
        status = sortedAdministrasis[0].status_kunjungan;
      }
      
      // If booking data is available, override with that data
      if (kunjungan.id_booking) {
        const booking = kunjungan.id_booking;
        
        // Get client name from booking
        if (booking.administrasis1 && booking.administrasis1.length > 0) {
          // Sort to get the earliest entry
          const administrasis = [...booking.administrasis1].sort((a, b) => 
            new Date(a.tanggal) - new Date(b.tanggal)
          );
          
          // Get the first user ID (earliest record)
          const userId = administrasis[0].id_user;
          
          // If user ID exists, fetch user details
          if (userId) {
            try {
              const user = await User.findById(userId);
              if (user && user.nama) {
                klienName = user.nama;
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          }
        }
        
        // Get other data from booking
        if (booking.nama) {
          namaHewan = booking.nama;
        }
        
        if (booking.jenis_layanan) {
          jenisLayanan = booking.jenis_layanan;
        }
        
        if (booking.status_booking) {
          status = booking.status_booking;
        }
      }

      // Create enhanced kunjungan object
      enhancedKunjungans.push({
        _id: kunjungan._id,
        tanggal_checkin: kunjungan.tanggal,
        klien: klienName,
        nama_hewan: namaHewan,
        jenis_layanan: jenisLayanan,
        nomor_antri: kunjungan.no_antri,
        status: status,
        tanggal_edit: kunjungan.updatedAt,
        id_booking: kunjungan.id_booking ? kunjungan.id_booking._id : null,
        keluhan: keluhan,
        kategori: kategori,
      });
    }

    res.status(200).json(enhancedKunjungans);
  } catch (error) {
    console.error('Error fetching kunjungan data:', error);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan', error: error.message });
  }
});

// Get kunjungan by ID
router.get('/:id', async (req, res) => {
  try {
    const kunjungan = await Kunjungan.findById(req.params.id)
      .populate({
        path: 'id_booking',
        select: 'nama status_booking pilih_tanggal administrasis1 jenis_layanan kategori keluhan'
      });
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }

    let klienName = 'N/A';
    let namaHewan = 'N/A';
    let jenisLayanan = 'offline';
    let status = 'sedang diperiksa';
    // Add variables to store keluhan and kategori
    let keluhan = 'N/A';
    let kategori = 'kesayangan / satwa liar';  // Default value

    // First check in kunjungan data
    if (kunjungan.keluhan) {
      keluhan = kunjungan.keluhan;
    }
    if (kunjungan.kategori) {
      kategori = kunjungan.kategori;
    }

    // Then check in booking data and override if present
    if (kunjungan.id_booking) {
      const booking = kunjungan.id_booking;
      
      if (booking.keluhan) {
        keluhan = booking.keluhan;
      }
      if (booking.kategori) {
        kategori = booking.kategori;
      }
    }
    
    // First try to get data from the kunjungan record itself
    if (kunjungan.nama_klein) {
      klienName = kunjungan.nama_klein;
    }
    
    if (kunjungan.nama_hewan) {
        namaHewan = kunjungan.nama_hewan + (kunjungan.jenis ? ` (${kunjungan.jenis})` : '');
    }
    
    if (kunjungan.jenis_layanan) {
      jenisLayanan = kunjungan.jenis_layanan;
    }
    
    // Check for status in administrasis2 (most recent status)
    if (kunjungan.administrasis2 && kunjungan.administrasis2.length > 0) {
      // Sort to get the latest entry
      const sortedAdministrasis = [...kunjungan.administrasis2].sort((a, b) => 
        new Date(b.tanggal) - new Date(a.tanggal)
      );
      status = sortedAdministrasis[0].status_kunjungan;
    }
    
    // If booking data is available, override with that data
    if (kunjungan.id_booking) {
      const booking = kunjungan.id_booking;
      
      // Get client name from booking
      if (booking.administrasis1 && booking.administrasis1.length > 0) {
        // Sort to get the earliest entry
        const administrasis = [...booking.administrasis1].sort((a, b) => 
          new Date(a.tanggal) - new Date(b.tanggal)
        );
        
        // Get the first user ID (earliest record)
        const userId = administrasis[0].id_user;
        
        // If user ID exists, fetch user details
        if (userId) {
          try {
            const user = await User.findById(userId);
            if (user && user.nama) {
              klienName = user.nama;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      }
      
      // Get other data from booking
      if (booking.nama) {
        namaHewan = booking.nama;
      }
      
      if (booking.jenis_layanan) {
        jenisLayanan = booking.jenis_layanan;
      }
      
      if (booking.status_booking) {
        status = booking.status_booking;
      }
    }

    // Create enhanced kunjungan object
    const enhancedKunjungan = {
      _id: kunjungan._id,
      tanggal_checkin: kunjungan.tanggal,
      klien: klienName,
      nama_hewan: namaHewan,
      jenis_layanan: jenisLayanan,
      nomor_antri: kunjungan.no_antri,
      status: status,
      tanggal_edit: kunjungan.updatedAt,
      id_booking: kunjungan.id_booking ? kunjungan.id_booking._id : null,
      // Include original data for detailed view
      originalKunjungan: kunjungan
    };

    res.status(200).json(enhancedKunjungan);
  } catch (error) {
    console.error('Error fetching kunjungan by ID:', error);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan', error: error.message });
  }
});

// Update kunjungan status (via updating booking)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status diperlukan' });
    }

    const kunjungan = await Kunjungan.findById(req.params.id);
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }

    // Add status to administrasis2
    kunjungan.administrasis2.push({
      catatan: `Status diubah menjadi ${status}`,
      status_kunjungan: status === 'sedang diperiksa' || status === 'dirawat inap' || status === 'dibatalkan administrasi' ? 
        status : 'sedang diperiksa',
      tanggal: new Date()
    });
    
    await kunjungan.save();

    // If there is a related booking, update it too
    if (kunjungan.id_booking) {
      // Update status on the related booking
      const updatedBooking = await Booking.findByIdAndUpdate(
        kunjungan.id_booking,
        { status_booking: status },
        { new: true }
      );

      if (!updatedBooking) {
        console.warn(`Related booking not found for kunjungan ${req.params.id}`);
      }
    }

    // Return updated kunjungan with booking info
    const updatedKunjungan = await Kunjungan.findById(req.params.id).populate('id_booking');
    
    res.status(200).json(updatedKunjungan);
  } catch (error) {
    console.error('Error updating kunjungan status:', error);
    res.status(500).json({ message: 'Gagal mengupdate status kunjungan', error: error.message });
  }
});

// Add administration record to kunjungan
router.post('/:id/administrasi', async (req, res) => {
  try {
    const { id_user, catatan, status_kunjungan } = req.body;
    
    if (!catatan || !status_kunjungan) {
      return res.status(400).json({ message: 'Catatan dan status diperlukan' });
    }

    const kunjungan = await Kunjungan.findById(req.params.id);
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }

    // Add new administration record
    kunjungan.administrasis2.push({
      id_user,
      catatan,
      status_kunjungan,
      tanggal: new Date()
    });

    // Update the related booking status if it exists
    if (kunjungan.id_booking) {
      // Map kunjungan status to booking status
      let bookingStatus;
      switch(status_kunjungan) {
        case 'sedang diperiksa':
          bookingStatus = 'sedang diperiksa';
          break;
        case 'dirawat inap':
          bookingStatus = 'dirawat inap';
          break;
        case 'dibatalkan administrasi':
          bookingStatus = 'dibatalkan administrasi';
          break;
        default:
          bookingStatus = 'sedang diperiksa'; // Default status
      }

      await Booking.findByIdAndUpdate(
        kunjungan.id_booking,
        { status_booking: bookingStatus }
      );
    }

    await kunjungan.save();

    res.status(200).json(kunjungan);
  } catch (error) {
    console.error('Error adding administration record to kunjungan:', error);
    res.status(500).json({ message: 'Gagal menambahkan catatan administrasi', error: error.message });
  }
});

// Delete kunjungan
router.delete('/:id', async (req, res) => {
  try {
    const kunjungan = await Kunjungan.findByIdAndDelete(req.params.id);
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }

    res.status(200).json({ message: 'Kunjungan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kunjungan:', error);
    res.status(500).json({ message: 'Gagal menghapus kunjungan', error: error.message });
  }
});

// Create kunjungan directly (without requiring booking)
router.post('/direct', async (req, res) => {
    try {
        const { 
            tanggal_waktu, 
            nama_klein, 
            nama_hewan, 
            jenis_layanan = 'offline',
            jenis_kelamin = '-',
            jenis,
            ras,
            umur_hewan,
            kategori = 'kesayangan / satwa liar',
            id_user,
            keluhan  // <-- Add this line to extract keluhan from the request body
          } = req.body;
      
        // Validate required fields
        if (!tanggal_waktu || !nama_klein || !nama_hewan || !kategori || !jenis || !keluhan) {  // <-- Add keluhan to required fields validation
            return res.status(400).json({ 
            message: 'Tanggal dan waktu, nama klien, nama hewan, jenis hewan, keluhan, dan kategori harus diisi' 
            });
        }
  
      // Parse the datetime string properly
      const visitDate = new Date(tanggal_waktu);
      
      // 1. Tentukan digit pertama berdasarkan hari (A-G untuk Senin-Minggu)
      const dayOfWeek = visitDate.getDay(); // 0 = Minggu, 1 = Senin, dst.
      const dayMapping = ['G', 'A', 'B', 'C', 'D', 'E', 'F']; // Mengatur G untuk Minggu
      const firstDigit = dayMapping[dayOfWeek];
      
      // 2. Tentukan digit kedua berdasarkan jam
      const currentHour = visitDate.getHours();
      let secondDigit;
      
      if (currentHour >= 7 && currentHour < 11) {
          secondDigit = '1';
      } else if (currentHour >= 11 && currentHour < 15) {
          secondDigit = '2';
      } else if (currentHour >= 15 && currentHour < 18) {
          secondDigit = '3';
      } else {
          secondDigit = '0';
      }
      
      // 3. Format tanggal for filtering (YYYY-MM-DD)
      const formattedDate = visitDate.toISOString().split('T')[0];
      
      // 4. Ambil semua kunjungan dengan tanggal yang sama untuk menentukan urutan
      const existingKunjungan = await Kunjungan.find({
        tanggal: {
          $gte: new Date(formattedDate),
          $lt: new Date(new Date(formattedDate).setDate(new Date(formattedDate).getDate() + 1))
        }
      });
      
      // Hitung kunjungan pada hari yang sama
      const count = existingKunjungan.length + 1;
      // Format digit ketiga dengan padding nol di depan jika perlu
      const thirdDigit = count.toString().padStart(3, '0');
      
      // Gabungkan semua digit untuk nomor antri
      const no_antri = `${firstDigit}${secondDigit}${thirdDigit}`;
  
      // Create the new kunjungan - use the full visitDate with time component
        const newKunjungan = new Kunjungan({
            tanggal: visitDate,
            nama_klein,
            nama_hewan,
            jenis_layanan,
            jenis_kelamin,
            jenis,
            ras,
            umur_hewan,
            kategori,
            keluhan,  // <-- Add this line to include keluhan in the new kunjungan
            no_antri,
            administrasis2: [{
                id_user,
                catatan: 'dibuat',
                status_kunjungan: 'sedang diperiksa',
                tanggal: new Date()
            }]
        });
  
      // Save the kunjungan to database
      const savedKunjungan = await newKunjungan.save();
  
      res.status(201).json({ 
        message: 'Kunjungan berhasil dibuat', 
        kunjungan: savedKunjungan 
      });
    } catch (error) {
      console.error('Error creating direct kunjungan:', error);
      res.status(500).json({ 
        message: 'Gagal membuat kunjungan', 
        error: error.message 
      });
    }
  });

export default router;