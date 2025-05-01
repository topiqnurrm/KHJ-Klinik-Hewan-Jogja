// File: route-produk.js
import express from 'express';
import Produk from '../models/produk.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mendapatkan semua produk
router.get('/', async (req, res) => {
    try {
        const produk = await Produk.find();
        res.status(200).json(produk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mendapatkan satu produk berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID produk tidak valid' });
        }
        
        const produk = await Produk.findById(id);
        
        if (!produk) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        
        res.status(200).json(produk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Membuat produk baru
router.post('/', async (req, res) => {
    try {
        const { nama, kategori, jenis, harga, stok, id_user } = req.body;
        
        // Validasi input
        if (!nama || !kategori || !jenis || !harga || !stok || !id_user) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }
        
        // Membuat objek produk baru
        const newProduk = new Produk({
            nama,
            kategori,
            jenis,
            harga,
            stok,
            id_user
        });
        
        // Simpan ke database
        const savedProduk = await newProduk.save();
        res.status(201).json(savedProduk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update produk berdasarkan ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, kategori, jenis, harga, stok } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID produk tidak valid' });
        }
        
        // Cari produk yang ingin diupdate
        const produk = await Produk.findById(id);
        
        if (!produk) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        
        // Membuat objek update
        const updatedProduk = {
            nama: nama || produk.nama,
            kategori: kategori || produk.kategori,
            jenis: jenis || produk.jenis,
            harga: harga || produk.harga,
            stok: stok || produk.stok
        };
        
        // Update dan dapatkan data terbaru
        const result = await Produk.findByIdAndUpdate(
            id, 
            updatedProduk, 
            { new: true }  // Option untuk mendapatkan dokumen yang sudah diupdate
        );
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Hapus produk berdasarkan ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID produk tidak valid' });
        }
        
        // Cari produk yang ingin dihapus
        const produk = await Produk.findById(id);
        
        if (!produk) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }
        
        // Hapus produk
        await Produk.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tambahan: Router untuk mencari produk berdasarkan kategori
router.get('/kategori/:kategori', async (req, res) => {
    try {
        const { kategori } = req.params;
        const produk = await Produk.find({ kategori });
        
        if (produk.length === 0) {
            return res.status(404).json({ message: 'Tidak ada produk dengan kategori tersebut' });
        }
        
        res.status(200).json(produk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tambahan: Router untuk mencari produk dengan stok menipis (kurang dari nilai tertentu)
router.get('/stok/menipis/:nilai', async (req, res) => {
    try {
        const nilai = parseFloat(req.params.nilai);
        
        if (isNaN(nilai)) {
            return res.status(400).json({ message: 'Nilai harus berupa angka' });
        }
        
        const produk = await Produk.find({
            stok: { $lt: mongoose.Types.Decimal128.fromString(nilai.toString()) }
        });
        
        res.status(200).json(produk);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;