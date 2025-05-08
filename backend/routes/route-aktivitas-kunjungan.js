import express from 'express';
import Kunjungan from '../models/kunjungan.js';
import Booking from '../models/booking.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import Pasien from '../models/pasien.js'; // Add Pasien model import

const router = express.Router();

// Get all kunjungan with detailed information
router.get('/', async (req, res) => {
  try {
    // Get all kunjungan with populated booking data - add more populate paths
    const kunjungans = await Kunjungan.find()
      .populate({
        path: 'id_booking',
        select: 'nama status_booking pilih_tanggal administrasis1 jenis_layanan kategori keluhan pelayanans1 id_pasien',
        // Add additional populate for the id_pasien reference
        populate: [
          {
            path: 'pelayanans1',
            select: 'nama'
          },
          {
            path: 'id_pasien',
            select: 'jenis_kelamin ras umur'
          }
        ]
      })
      .sort({ tanggal: -1 }); // Sort by check-in date in descending order

    // Create an array to hold enhanced kunjungan data
    const enhancedKunjungans = [];

    // Process each kunjungan to include client name and complete information
    for (const kunjungan of kunjungans) {
      let klienName = '-';
      let namaHewan = '-';
      let jenisLayanan = 'offline';
      let status = 'sedang diperiksa';
      let keluhan = '-';
      let kategori = 'kesayangan / satwa liar';  // Default value
      
      // Fields that need to be fixed
      let jenisKelamin = '-';
      let ras = '-';
      let umur = '-';

      // First check in kunjungan data
      if (kunjungan.keluhan) {
        keluhan = kunjungan.keluhan;
      }
      if (kunjungan.kategori) {
        kategori = kunjungan.kategori;
      }
      
      // Get the fields from kunjungan data if available
      if (kunjungan.jenis_kelamin && kunjungan.jenis_kelamin !== '-') {
        jenisKelamin = kunjungan.jenis_kelamin;
      }
      if (kunjungan.ras && kunjungan.ras !== '-') {
        ras = kunjungan.ras;
      }
      if (kunjungan.umur_hewan && kunjungan.umur_hewan > 0) {
        umur = kunjungan.umur_hewan;
      }

      // Check for layanan in kunjungan.pelayanans1 first
      let layanan = '-';
      if (kunjungan.pelayanans1 && kunjungan.pelayanans1.length > 0) {
        // If pelayanans1 is populated object with nama
        if (kunjungan.pelayanans1[0].nama) {
          layanan = kunjungan.pelayanans1[0].nama;
        } 
        // If pelayanans1 is an array of strings or has a different structure
        else if (typeof kunjungan.pelayanans1[0] === 'string') {
          layanan = kunjungan.pelayanans1[0];
        }
        // If it's an object with id_pelayanan and nama
        else if (kunjungan.pelayanans1[0] && kunjungan.pelayanans1[0].nama) {
          layanan = kunjungan.pelayanans1[0].nama;
        }
      }

      // Try to get data from the booking and pasien
      if (kunjungan.id_booking) {
        const booking = kunjungan.id_booking;
        
        if (booking.keluhan) {
          keluhan = booking.keluhan;
        }
        if (booking.kategori) {
          kategori = booking.kategori;
        }
        
        // Get the layanan name from booking.pelayanans1 if available and if kunjungan.pelayanans1 wasn't found
        if (layanan === '-' && booking.pelayanans1 && booking.pelayanans1.length > 0) {
          // If pelayanans1 is populated object with nama
          if (booking.pelayanans1[0].nama) {
            layanan = booking.pelayanans1[0].nama;
          } 
          // If pelayanans1 is an array of strings or has a different structure
          else if (typeof booking.pelayanans1[0] === 'string') {
            layanan = booking.pelayanans1[0];
          }
        }
        
        // Check if we have pasien data through the booking
        if (booking.id_pasien) {
          // Try to use pasien data for jenis_kelamin, ras, and umur if not already set
          if (jenisKelamin === '-' && booking.id_pasien.jenis_kelamin) {
            jenisKelamin = booking.id_pasien.jenis_kelamin;
          }
          if (ras === '-' && booking.id_pasien.ras) {
            ras = booking.id_pasien.ras;
          }
          if (umur === '-' && booking.id_pasien.umur) {
            umur = booking.id_pasien.umur;
          }
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

      // Create enhanced kunjungan object with additional fields
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
        // Add fixed fields
        layanan: layanan, 
        jenis_kelamin: jenisKelamin,
        ras: ras,
        umur: umur
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
        select: 'nama status_booking pilih_tanggal administrasis1 jenis_layanan kategori keluhan pelayanans1 id_pasien',
        // Add population for id_pasien to get the additional fields
        populate: [
          {
            path: 'pelayanans1',
            select: 'nama'
          },
          {
            path: 'id_pasien',
            select: 'jenis_kelamin ras umur'
          }
        ]
      });
    
    if (!kunjungan) {
      return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
    }

    let klienName = '-';
    let namaHewan = '-';
    let jenisLayanan = 'offline';
    let status = 'sedang diperiksa';
    let keluhan = '-';
    let kategori = 'kesayangan / satwa liar';  // Default value
    
    // Initialize fields with default values
    let jenisKelamin = '-';
    let ras = '-';
    let umur = '-';

    // First check in kunjungan data
    if (kunjungan.keluhan) {
      keluhan = kunjungan.keluhan;
    }
    if (kunjungan.kategori) {
      kategori = kunjungan.kategori;
    }

    // Check for jenis_kelamin, ras, and umur_hewan in kunjungan data first
    if (kunjungan.jenis_kelamin && kunjungan.jenis_kelamin !== '-') {
      jenisKelamin = kunjungan.jenis_kelamin;
    }
    if (kunjungan.ras && kunjungan.ras !== '-') {
      ras = kunjungan.ras;
    }
    if (kunjungan.umur_hewan && kunjungan.umur_hewan > 0) {
      umur = kunjungan.umur_hewan;
    }

    // Check for layanan in kunjungan.pelayanans1 first
    let layanan = '-';
    if (kunjungan.pelayanans1 && kunjungan.pelayanans1.length > 0) {
      // If pelayanans1 is populated object with nama
      if (kunjungan.pelayanans1[0].nama) {
        layanan = kunjungan.pelayanans1[0].nama;
      } 
      // If pelayanans1 is an array of strings or has a different structure
      else if (typeof kunjungan.pelayanans1[0] === 'string') {
        layanan = kunjungan.pelayanans1[0];
      }
      // If it's an object with id_pelayanan and nama
      else if (kunjungan.pelayanans1[0] && kunjungan.pelayanans1[0].nama) {
        layanan = kunjungan.pelayanans1[0].nama;
      }
    }

    // Then check in booking and pasien data
    if (kunjungan.id_booking) {
      const booking = kunjungan.id_booking;
      
      if (booking.keluhan) {
        keluhan = booking.keluhan;
      }
      if (booking.kategori) {
        kategori = booking.kategori;
      }
      
      // Get the layanan name from booking.pelayanans1 if available
      if (layanan === '-' && booking.pelayanans1 && booking.pelayanans1.length > 0) {
        // If pelayanans1 is populated object with nama
        if (booking.pelayanans1[0].nama) {
          layanan = booking.pelayanans1[0].nama;
        } 
        // If pelayanans1 is an array of strings or has a different structure
        else if (typeof booking.pelayanans1[0] === 'string') {
          layanan = booking.pelayanans1[0];
        }
      }
      
      // Check if we have pasien data and use it if fields are still -
      if (booking.id_pasien) {
        if (jenisKelamin === '-' && booking.id_pasien.jenis_kelamin) {
          jenisKelamin = booking.id_pasien.jenis_kelamin;
        }
        if (ras === '-' && booking.id_pasien.ras) {
          ras = booking.id_pasien.ras;
        }
        if (umur === '-' && booking.id_pasien.umur) {
          umur = booking.id_pasien.umur;
        }
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

    // Create enhanced kunjungan object with additional fields
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
      keluhan: keluhan,
      kategori: kategori,
      // Include fixed fields
      layanan: layanan,
      jenis_kelamin: jenisKelamin,
      ras: ras,
      umur: umur,
      // Include original data for detailed view
      originalKunjungan: kunjungan
    };

    res.status(200).json(enhancedKunjungan);
  } catch (error) {
    console.error('Error fetching kunjungan by ID:', error);
    res.status(500).json({ message: 'Gagal mengambil data kunjungan', error: error.message });
  }
});

// Rest of the code remains unchanged
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
      // Log the incoming request body for debugging
      console.log('Received data:', req.body);
      
      const { 
          tanggal_waktu, 
          nama_klein, 
          nama_hewan, 
          jenis_layanan = 'offline',
          jenis_kelamin = '-',
          jenis,
          ras = '-',
          umur_hewan = '-',
          kategori = 'kesayangan / satwa liar',
          id_user,  // Make sure this matches what's sent from the client
          keluhan = '-',
          pelayanans1 = [] // Extract pelayanans1 array from request
      } = req.body;
    
      // Validate user ID
      if (!id_user) {
          return res.status(400).json({ 
              message: 'ID user tidak valid' 
          });
      }
      
      // Validate required fields
      if (!tanggal_waktu || !nama_klein || !nama_hewan || !jenis) {
          return res.status(400).json({ 
              message: 'Tanggal dan waktu, nama klien, nama hewan, dan jenis hewan harus diisi' 
          });
      }

      // Validate pelayanans1 format
      let validatedPelayanans = [];
      if (pelayanans1 && pelayanans1.length > 0) {
          // Ensure each item has required fields
          validatedPelayanans = pelayanans1.map(item => ({
              id_pelayanan: item.id_pelayanan || null,
              nama: item.nama || '',
              jumlah: parseInt(item.jumlah) || 1,
              tanggal: item.tanggal || new Date()
          }));
          
          // Only keep valid items (with id_pelayanan)
          validatedPelayanans = validatedPelayanans.filter(item => item.id_pelayanan);
      }

      // Parse the datetime string properly
      const visitDate = new Date(tanggal_waktu);
      
      // Check if the date is valid
      if (isNaN(visitDate.getTime())) {
          return res.status(400).json({ 
              message: 'Format tanggal tidak valid' 
          });
      }
      
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

      // Format umur_hewan as a number if provided
      let numericUmurHewan = undefined;
      if (umur_hewan !== '-') {
          numericUmurHewan = Number(umur_hewan);
          if (isNaN(numericUmurHewan)) {
              numericUmurHewan = undefined;
          }
      }
  
      // Create the new kunjungan object
      const newKunjungan = new Kunjungan({
          tanggal: visitDate,
          nama_klein,
          nama_hewan,
          jenis_layanan,
          jenis_kelamin,
          jenis,
          ras,
          umur_hewan: numericUmurHewan,
          kategori,
          keluhan,
          no_antri,
          pelayanans1: validatedPelayanans, // Add validated pelayanans1 array to the new kunjungan
          administrasis2: [{
              id_user,
              catatan: 'dibuat',
              status_kunjungan: 'sedang diperiksa',
              tanggal: new Date()
          }]
      });
  
      // Log the document before saving
      console.log('Kunjungan document to save:', JSON.stringify(newKunjungan, null, 2));
  
      // Save the kunjungan to database
      const savedKunjungan = await newKunjungan.save();
  
      res.status(201).json({ 
          message: 'Kunjungan berhasil dibuat', 
          kunjungan: savedKunjungan 
      });
  } catch (error) {
      console.error('Error creating direct kunjungan:', error);
      res.status(500).json({ 
          message: 'Gagal membuat kunjungan: ' + error.message, 
          error: error.message 
      });
  }
});

export default router;