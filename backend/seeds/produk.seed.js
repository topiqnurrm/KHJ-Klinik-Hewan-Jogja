const mongoose = require('mongoose');
const Produk = require('../models/produk');

// Data produk yang akan dimasukkan ke dalam koleksi produk
const data = [
  {
    nama: 'Obat Cacing',
    kategori: 'antibiotik', // Anda bisa sesuaikan kategori sesuai kebutuhan
    jenis: 'tablet', // Anda bisa sesuaikan jenis sesuai kebutuhan
    harga: mongoose.Types.Decimal128.fromString('25000.00'),
    stok: mongoose.Types.Decimal128.fromString('100.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    nama: 'Vaksin Rabies',
    kategori: 'vaksin_hewan_kesayangan',
    jenis: 'vial',
    harga: mongoose.Types.Decimal128.fromString('150000.00'),
    stok: mongoose.Types.Decimal128.fromString('50.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    nama: 'Vitamin C',
    kategori: 'suplemen',
    jenis: 'tablet',
    harga: mongoose.Types.Decimal128.fromString('30000.00'),
    stok: mongoose.Types.Decimal128.fromString('200.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  }
];

async function seed() {
  try {
    // Menghapus data lama di koleksi 'produk'
    await Produk.deleteMany();
    console.log('Old data deleted');

    // Menambahkan data produk baru
    await Produk.insertMany(data);
    console.log('Seeded: produk');
  } catch (err) {
    console.error('Error seeding produk:', err);
  }
}

module.exports = seed;
