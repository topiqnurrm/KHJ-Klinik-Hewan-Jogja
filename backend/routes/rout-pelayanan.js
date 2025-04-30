import express from 'express';
import Pelayanan from '../models/pelayanan.js';

const router = express.Router();

// rout-pelayanan.js - GET all layanan
router.get('/', async (req, res) => {
  try {
    const layanan = await Pelayanan.find();
    
    // Mengubah respons untuk mengonversi Decimal128 menjadi Number sebelum dikirim ke client
    const formattedLayanan = layanan.map(item => {
      const plainObj = item.toObject();
      
      // Konversi nilai Decimal128 ke Number
      if (plainObj.harga_ternak) 
        plainObj.harga_ternak = parseFloat(plainObj.harga_ternak.toString());
        
      if (plainObj.harga_kesayangan_satwaliar)
        plainObj.harga_kesayangan_satwaliar = parseFloat(plainObj.harga_kesayangan_satwaliar.toString());
        
      if (plainObj.harga_unggas)
        plainObj.harga_unggas = parseFloat(plainObj.harga_unggas.toString());
      
      return plainObj;
    });
    
    res.json(formattedLayanan);
  } catch (error) {
    console.error("Error fetching layanan:", error);
    res.status(500).send("Server error");
  }
});

// GET layanan by ID
router.get('/:id', async (req, res) => {
  try {
    const layanan = await Pelayanan.findById(req.params.id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    const plainObj = layanan.toObject();
    
    // Konversi nilai Decimal128 ke Number
    if (plainObj.harga_ternak) 
      plainObj.harga_ternak = parseFloat(plainObj.harga_ternak.toString());
      
    if (plainObj.harga_kesayangan_satwaliar)
      plainObj.harga_kesayangan_satwaliar = parseFloat(plainObj.harga_kesayangan_satwaliar.toString());
      
    if (plainObj.harga_unggas)
      plainObj.harga_unggas = parseFloat(plainObj.harga_unggas.toString());
    
    res.json(plainObj);
  } catch (error) {
    console.error("Error fetching layanan by ID:", error);
    res.status(500).send("Server error");
  }
});

// Endpoint untuk membuat layanan baru
router.post('/', async (req, res) => {
  try {
    const { nama, kategori, harga_ternak, harga_kesayangan_satwaliar, harga_unggas, id_user } = req.body;
    
    // Ensure price fields are valid numbers
    const priceFields = {
      harga_ternak: parseFloat(harga_ternak) || 0,
      harga_kesayangan_satwaliar: parseFloat(harga_kesayangan_satwaliar) || 0,
      harga_unggas: parseFloat(harga_unggas) || 0
    };
    
    // Debug log
    console.log('Creating layanan with prices:', priceFields);
    
    const newLayanan = new Pelayanan({
      nama,
      kategori,
      harga_ternak: priceFields.harga_ternak,
      harga_kesayangan_satwaliar: priceFields.harga_kesayangan_satwaliar,
      harga_unggas: priceFields.harga_unggas,
      id_user
    });
    
    const savedLayanan = await newLayanan.save();
    
    // Convert the saved layanan to a plain object and format decimal values
    const formattedLayanan = savedLayanan.toObject();
    if (formattedLayanan.harga_ternak)
      formattedLayanan.harga_ternak = parseFloat(formattedLayanan.harga_ternak.toString());
    if (formattedLayanan.harga_kesayangan_satwaliar)
      formattedLayanan.harga_kesayangan_satwaliar = parseFloat(formattedLayanan.harga_kesayangan_satwaliar.toString());
    if (formattedLayanan.harga_unggas)
      formattedLayanan.harga_unggas = parseFloat(formattedLayanan.harga_unggas.toString());
    
    res.status(201).json(formattedLayanan);
  } catch (error) {
    console.error("Error creating layanan:", error);
    res.status(400).json({ message: error.message });
  }
});

// Endpoint untuk mengupdate layanan
router.put('/:id', async (req, res) => {
  try {
    const { nama, kategori, harga_ternak, harga_kesayangan_satwaliar, harga_unggas } = req.body;
    
    // Ensure price fields are valid numbers
    const priceFields = {
      harga_ternak: parseFloat(harga_ternak) || 0,
      harga_kesayangan_satwaliar: parseFloat(harga_kesayangan_satwaliar) || 0,
      harga_unggas: parseFloat(harga_unggas) || 0
    };
    
    // Debug log
    console.log('Updating layanan with prices:', priceFields);
    
    const updatedLayanan = await Pelayanan.findByIdAndUpdate(
      req.params.id,
      {
        nama,
        kategori,
        harga_ternak: priceFields.harga_ternak,
        harga_kesayangan_satwaliar: priceFields.harga_kesayangan_satwaliar,
        harga_unggas: priceFields.harga_unggas
      },
      { new: true }
    );
    
    if (!updatedLayanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    // Convert the updated layanan to a plain object and format decimal values
    const formattedLayanan = updatedLayanan.toObject();
    if (formattedLayanan.harga_ternak)
      formattedLayanan.harga_ternak = parseFloat(formattedLayanan.harga_ternak.toString());
    if (formattedLayanan.harga_kesayangan_satwaliar)
      formattedLayanan.harga_kesayangan_satwaliar = parseFloat(formattedLayanan.harga_kesayangan_satwaliar.toString());
    if (formattedLayanan.harga_unggas)
      formattedLayanan.harga_unggas = parseFloat(formattedLayanan.harga_unggas.toString());
    
    res.json(formattedLayanan);
  } catch (error) {
    console.error("Error updating layanan:", error);
    res.status(400).json({ message: error.message });
  }
});

// Endpoint untuk menghapus layanan
router.delete('/:id', async (req, res) => {
  try {
    const deletedLayanan = await Pelayanan.findByIdAndDelete(req.params.id);
    
    if (!deletedLayanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    res.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    console.error("Error deleting layanan:", error);
    res.status(500).send("Server error");
  }
});

export default router;