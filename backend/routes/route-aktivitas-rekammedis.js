import express from 'express';
import mongoose from 'mongoose';
import RekamMedis from '../models/rekam_medis.js';
import Kunjungan from '../models/kunjungan.js';

import Produk from '../models/produk.js';
import Pelayanan from '../models/pelayanan.js';

import Booking from '../models/booking.js';

import RetribusiPembayaran from '../models/retribusi_pembayaran.js';

const router = express.Router();

// ----- Routes rekam medis - Updated to handle subtotal fields

/**
 * Create a new medical record
 * POST /api/rekam-medis/create
 */
router.post('/create', async (req, res) => {
  try {
    const {
      diagnosa,
      keluhan,
      berat_badan,
      suhu_badan,
      pemeriksaan,
      hasil,
      tanggal = new Date(),
      id_kunjungan,
      status,
      produks = [],
      pelayanans2 = [],
      dokters = []
    } = req.body;

    // Validate id_kunjungan exists
    if (!mongoose.Types.ObjectId.isValid(id_kunjungan)) {
      return res.status(400).json({ message: 'ID kunjungan tidak valid' });
    }

    // Check if kunjungan exists
    const kunjunganExists = await Kunjungan.findById(id_kunjungan);
    if (!kunjunganExists) {
      return res.status(404).json({ message: 'Data kunjungan tidak ditemukan' });
    }

    // Format decimal fields - Safely handle null/undefined values
    let formattedBeratBadan = null;
    let formattedSuhuBadan = null;

    if (berat_badan !== null && berat_badan !== undefined && berat_badan !== '') {
      formattedBeratBadan = mongoose.Types.Decimal128.fromString(String(berat_badan));
    }
    
    if (suhu_badan !== null && suhu_badan !== undefined && suhu_badan !== '') {
      formattedSuhuBadan = mongoose.Types.Decimal128.fromString(String(suhu_badan));
    }

    // Format produks and pelayanans arrays for decimal values
    const formattedProduks = produks.map(prod => {
      console.log('Formatting produk for create:', prod);
      
      return {
        id_produk: prod.id_produk,
        jumlah: prod.jumlah,
        tanggal: prod.tanggal || new Date(),
        harga: mongoose.Types.Decimal128.fromString((prod.harga || 0).toString()),
        subtotal_obat: mongoose.Types.Decimal128.fromString((prod.subtotal_obat || 0).toString()),
        kategori: prod.kategori || "obat", // Ensure kategori exists
        jenis: prod.jenis || "-" // Ensure jenis exists
      };
    });

    const formattedPelayanans = pelayanans2.map(pel => ({
      id_pelayanan: pel.id_pelayanan,
      jumlah: pel.jumlah,
      tanggal: pel.tanggal || new Date(),
      harga: mongoose.Types.Decimal128.fromString((pel.harga || 0).toString()),
      subtotal_pelayanan: mongoose.Types.Decimal128.fromString((pel.subtotal_pelayanan || 0).toString()),
      kategori: pel.kategori || "layanan medis" // Ensure kategori exists
    }));

    // Format dokters array - process each dokter entry to handle decimal values
    const formattedDokters = dokters.map(dokter => {
      const formattedDokter = { ...dokter };
      
      // Convert berat_badan and suhu_badan to Decimal128 if they exist
      if (dokter.berat_badan !== null && dokter.berat_badan !== undefined) {
        formattedDokter.berat_badan = mongoose.Types.Decimal128.fromString(String(dokter.berat_badan));
      }
      
      if (dokter.suhu_badan !== null && dokter.suhu_badan !== undefined) {
        formattedDokter.suhu_badan = mongoose.Types.Decimal128.fromString(String(dokter.suhu_badan));
      }
      
      return formattedDokter;
    });

    // Create new rekam medis document
    const newRekamMedis = new RekamMedis({
      diagnosa,
      keluhan,
      berat_badan: formattedBeratBadan,
      suhu_badan: formattedSuhuBadan,
      pemeriksaan,
      hasil,
      tanggal,
      id_kunjungan,
      produks: formattedProduks,
      pelayanans2: formattedPelayanans,
      dokters: formattedDokters // Use the formatted dokters array
    });

    await newRekamMedis.save();

    // Update kunjungan status if provided
    if (status) {
      await Kunjungan.findByIdAndUpdate(id_kunjungan, { status });
      
      // Also update the booking status
      // First, find the booking ID from the kunjungan
      const kunjungan = await Kunjungan.findById(id_kunjungan);
      if (kunjungan && kunjungan.id_booking) {
        await Booking.findByIdAndUpdate(kunjungan.id_booking, { 
          status_booking: status 
        });
      }
    }

    res.status(201).json({ 
      message: 'Rekam medis berhasil disimpan', 
      rekam_medis: newRekamMedis 
    });
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menyimpan rekam medis',
      error: error.message 
    });
  }
});

/**
 * Update a medical record
 * PUT /api/rekam-medis/update/:id
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosa,
      keluhan,
      berat_badan,
      suhu_badan,
      pemeriksaan,
      hasil,
      status,
      id_kunjungan,
      produks = [],
      pelayanans2 = [],
      dokters = [],
      replaceCollections = false
    } = req.body;

    // Log data yang diterima untuk debugging
    console.log('Data update yang diterima:', {
      id,
      produks: produks.map(p => ({ id_produk: p.id_produk, jenis: p.jenis, kategori: p.kategori }))
    });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID rekam medis tidak valid' });
    }

    // Format decimal fields with proper null handling
    let updateData = { diagnosa, keluhan, pemeriksaan, hasil };

    if (berat_badan !== null && berat_badan !== undefined) {
      updateData.berat_badan = mongoose.Types.Decimal128.fromString(berat_badan.toString());
    }

    if (suhu_badan !== null && suhu_badan !== undefined) {
      updateData.suhu_badan = mongoose.Types.Decimal128.fromString(suhu_badan.toString());
    }

    // Format produks array dengan mempertahankan jenis dan kategori
    const formattedProduks = produks.map(prod => {
      // Log detail untuk debugging
      console.log('Formatting produk for update:', prod);
      
      return {
        id_produk: prod.id_produk,
        jumlah: prod.jumlah,
        tanggal: prod.tanggal || new Date(),
        harga: mongoose.Types.Decimal128.fromString((prod.harga || 0).toString()),
        subtotal_obat: mongoose.Types.Decimal128.fromString((prod.subtotal_obat || 0).toString()),
        kategori: prod.kategori || "obat", // Pastikan kategori selalu ada
        jenis: prod.jenis || "-" // Pastikan jenis selalu ada
      };
    });
    
    // Log hasil format produks
    console.log('Produks setelah diformat:', formattedProduks);
    
    // Update data dengan produks yang telah diformat
    updateData.produks = formattedProduks;
    
    const formattedPelayanans = pelayanans2.map(pel => ({
      id_pelayanan: pel.id_pelayanan,
      jumlah: pel.jumlah,
      tanggal: pel.tanggal || new Date(),
      harga: mongoose.Types.Decimal128.fromString((pel.harga || 0).toString()),
      subtotal_pelayanan: mongoose.Types.Decimal128.fromString((pel.subtotal_pelayanan || 0).toString()),
      kategori: pel.kategori || "layanan medis" // Add kategori field
    }));
    updateData.pelayanans2 = formattedPelayanans;
    
    // Find existing record to append to dokters array instead of overriding
    let existingRecord = null;
    if (dokters && dokters.length > 0) {
      existingRecord = await RekamMedis.findById(id);
      if (existingRecord) {
        // Use $push to append new dokters rather than replacing the array
        await RekamMedis.findByIdAndUpdate(id, {
          $push: { dokters: { $each: dokters } }
        });
      }
    }

    // Jika replaceCollections = true, gunakan operasi update langsung
    // Jika tidak, gunakan findByIdAndUpdate biasa
    let updatedRekamMedis;
    if (replaceCollections) {
      // Karena kita menggunakan replaceCollections, kita perlu menggunakan update dengan $set
      // untuk memastikan array produks dan pelayanans2 diganti seluruhnya
      updatedRekamMedis = await RekamMedis.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
    } else {
      // Opsi regular update
      updatedRekamMedis = await RekamMedis.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
    }

    if (!updatedRekamMedis) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }

    // Update kunjungan status if provided
    if (status && id_kunjungan) {
      await Kunjungan.findByIdAndUpdate(id_kunjungan, { status });
      
      // Also update the booking status
      // First, find the booking ID from the kunjungan
      const kunjungan = await Kunjungan.findById(id_kunjungan);
      if (kunjungan && kunjungan.id_booking) {
        await Booking.findByIdAndUpdate(kunjungan.id_booking, { 
          status_booking: status 
        });
      }
    }

    // Get the freshly updated record with the new dokters included
    const finalRecord = await RekamMedis.findById(id);
    
    // Log hasil akhir untuk memastikan data terkirim dengan benar
    console.log('Rekam medis setelah update:', finalRecord);

    res.status(200).json({ 
      message: 'Rekam medis berhasil diperbarui', 
      rekam_medis: finalRecord
    });
  } catch (error) {
    console.error('Error updating medical record:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat memperbarui rekam medis',
      error: error.message 
    });
  }
});

/**
 * Get medical record by kunjungan ID
 * GET /api/rekam-medis/by-kunjungan/:kunjunganId
 */
router.get('/by-kunjungan/:kunjunganId', async (req, res) => {
  try {
    const { kunjunganId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(kunjunganId)) {
      return res.status(400).json({ message: 'ID kunjungan tidak valid' });
    }

    const rekamMedis = await RekamMedis.findOne({ id_kunjungan: kunjunganId })
      .populate('produks.id_produk')
      .populate('pelayanans2.id_pelayanan')
      .populate('dokters.id_user');

    if (!rekamMedis) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }

    res.status(200).json(rekamMedis);
  } catch (error) {
    console.error('Error fetching medical record:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data rekam medis',
      error: error.message 
    });
  }
});

/**
 * Get all medical records for a patient
 * GET /api/rekam-medis/by-pasien/:pasienId
 */
router.get('/by-pasien/:pasienId', async (req, res) => {
  try {
    const { pasienId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pasienId)) {
      return res.status(400).json({ message: 'ID pasien tidak valid' });
    }

    // Find all visits for this patient
    const kunjunganList = await Kunjungan.find()
      .populate({
        path: 'id_booking',
        match: { 'id_pasien': pasienId },
        select: 'id_pasien'
      })
      .select('_id');

    // Filter out visits where id_booking didn't match the pasien
    const validKunjunganIds = kunjunganList
      .filter(k => k.id_booking)
      .map(k => k._id);

    // Find all medical records linked to these visits
    const rekamMedisList = await RekamMedis.find({ 
      id_kunjungan: { $in: validKunjunganIds } 
    })
    .sort({ tanggal: -1 })
    .populate('produks.id_produk')
    .populate('pelayanans2.id_pelayanan');

    res.status(200).json(rekamMedisList);
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil riwayat rekam medis',
      error: error.message 
    });
  }
});

/**
 * Delete a medical record
 * DELETE /api/rekam-medis/delete/:id
 */
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID rekam medis tidak valid' });
    }

    const deletedRekamMedis = await RekamMedis.findByIdAndDelete(id);

    if (!deletedRekamMedis) {
      return res.status(404).json({ message: 'Rekam medis tidak ditemukan' });
    }

    res.status(200).json({ 
      message: 'Rekam medis berhasil dihapus', 
      rekam_medis: deletedRekamMedis 
    });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus rekam medis',
      error: error.message 
    });
  }
});


//----- rout produk dan pelayanan
// 🔍 Ambil semua data produk
router.get('/produk/all', async (req, res) => {
    try {
      const data = await Produk.find().sort({ nama: 1 });
      res.status(200).json(data);
    } catch (error) {
      console.error('Gagal mengambil data produk:', error);
      res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
  });
  
  // 🔍 Ambil semua data pelayanan
  router.get('/pelayanan/all', async (req, res) => {
    try {
      const data = await Pelayanan.find().sort({ nama: 1 });
      res.status(200).json(data);
    } catch (error) {
      console.error('Gagal mengambil data pelayanan:', error);
      res.status(500).json({ message: 'Gagal mengambil data pelayanan' });
    }
  });
  
  // 🔘 Tambah produk baru
  router.post('/produk/tambah', async (req, res) => {
    try {
      const {
        nama,
        kategori,
        jenis,
        harga,
        stok,
        id_user
      } = req.body;
  
      const newProduk = new Produk({
        nama,
        kategori,
        jenis,
        harga,
        stok,
        id_user
      });
  
      await newProduk.save();
  
      res.status(201).json({ message: 'Produk berhasil ditambahkan', produk: newProduk });
    } catch (error) {
      console.error('Gagal menambah produk:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan produk' });
    }
  });
  
  // 🔘 Tambah pelayanan baru
  router.post('/pelayanan/tambah', async (req, res) => {
    try {
      const {
        nama,
        kategori,
        harga_ternak,
        harga_kesayangan_satwaliar,
        harga_unggas,
        id_user
      } = req.body;
  
      const newPelayanan = new Pelayanan({
        nama,
        kategori,
        harga_ternak,
        harga_kesayangan_satwaliar,
        harga_unggas,
        id_user
      });
  
      await newPelayanan.save();
  
      res.status(201).json({ message: 'Pelayanan berhasil ditambahkan', pelayanan: newPelayanan });
    } catch (error) {
      console.error('Gagal menambah pelayanan:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan pelayanan' });
    }
  });




// route retribusi pembayaran

// Get all retribusi pembayaran
router.get('/all', async (req, res) => {
    try {
      const data = await RetribusiPembayaran.find()
        .populate('id_kunjungan')
        .populate('id_user')
        .sort({ createdAt: -1 });
      
      res.status(200).json(data);
    } catch (error) {
      console.error('Gagal mengambil data retribusi pembayaran:', error);
      res.status(500).json({ message: 'Gagal mengambil data retribusi pembayaran' });
    }
  });
  
  // Get retribusi pembayaran by kunjungan ID
  router.get('/by-kunjungan/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const retribusi = await RetribusiPembayaran.findOne({ id_kunjungan: id })
        .populate('id_kunjungan')
        .populate('id_user');
      
      if (!retribusi) {
        return res.status(404).json({ message: 'Retribusi pembayaran tidak ditemukan' });
      }
      
      res.status(200).json(retribusi);
    } catch (error) {
      console.error('Gagal mengambil retribusi pembayaran:', error);
      res.status(500).json({ message: 'Gagal mengambil retribusi pembayaran' });
    }
  });
  
  // Add new retribusi pembayaran
  router.post('/tambah', async (req, res) => {
    try {
      const { 
        grand_total, 
        metode_bayar, 
        kembali, 
        status_retribusi, 
        id_kunjungan, 
        id_user 
      } = req.body;
  
      // Check if retribusi with this kunjungan ID already exists
      const existingRetribusi = await RetribusiPembayaran.findOne({ id_kunjungan });
      
      if (existingRetribusi) {
        return res.status(400).json({ 
          message: 'Retribusi pembayaran untuk kunjungan ini sudah ada',
          data: existingRetribusi
        });
      }
  
      const newRetribusi = new RetribusiPembayaran({
        grand_total,
        metode_bayar,
        kembali,
        status_retribusi,
        id_kunjungan,
        id_user,
        tanggal: new Date()
      });
  
      await newRetribusi.save();
      
      res.status(201).json({ 
        message: 'Retribusi pembayaran berhasil ditambahkan', 
        retribusi: newRetribusi 
      });
    } catch (error) {
      console.error('Gagal menambah retribusi pembayaran:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat menambahkan retribusi pembayaran',
        error: error.message 
      });
    }
  });
  
  // Update retribusi pembayaran by kunjungan ID
  router.put('/update-by-kunjungan/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        grand_total, 
        metode_bayar, 
        kembali, 
        status_retribusi, 
        id_user 
      } = req.body;
  
      const updatedRetribusi = await RetribusiPembayaran.findOneAndUpdate(
        { id_kunjungan: id },
        {
          grand_total,
          metode_bayar,
          kembali,
          status_retribusi,
          id_user,
          tanggal: new Date() // Update the date to current
        },
        { new: true, upsert: true } // Return updated document and create if doesn't exist
      );
  
      res.status(200).json({ 
        message: 'Retribusi pembayaran berhasil diperbarui', 
        retribusi: updatedRetribusi 
      });
    } catch (error) {
      console.error('Gagal memperbarui retribusi pembayaran:', error);
      res.status(500).json({ 
        message: 'Terjadi kesalahan saat memperbarui retribusi pembayaran',
        error: error.message 
      });
    }
  });
  
  export default router;


  //----- rout kunjungan

  // Add this to your kunjungan routes file
// 🔄 Update status kunjungan
router.put('/update-status/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { administrasis2, status_kunjungan } = req.body;
      
      // Find the kunjungan by ID
      const kunjungan = await Kunjungan.findById(id);
      
      if (!kunjungan) {
        return res.status(404).json({ message: 'Kunjungan tidak ditemukan' });
      }
      
      // Add new administrasi entry if provided
      if (administrasis2 && administrasis2.length > 0) {
        kunjungan.administrasis2.push(...administrasis2);
      }
      
      await kunjungan.save();
      
      res.status(200).json({ message: 'Status kunjungan berhasil diupdate', kunjungan });
    } catch (error) {
      console.error('Gagal mengupdate status kunjungan:', error);
      res.status(500).json({ message: 'Terjadi kesalahan saat mengupdate status kunjungan' });
    }
  });