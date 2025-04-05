const mongoose = require('mongoose');
const Pelayanan = require('../models/pelayanan');

// Data yang akan dimasukkan ke dalam koleksi pelayanan
const data = [
  {
    nama: 'Vaksinasi Rabies',
    kategori: 'tindakan_umum',
    harga_ternak: mongoose.Types.Decimal128.fromString('75000.00'),
    harga_kesayangan_satwaliar: mongoose.Types.Decimal128.fromString('100000.00'),
    harga_unggas: mongoose.Types.Decimal128.fromString('50000.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    nama: 'Cek Kesehatan Hewan',
    kategori: 'tindakan_khusus',
    harga_ternak: mongoose.Types.Decimal128.fromString('100000.00'),
    harga_kesayangan_satwaliar: mongoose.Types.Decimal128.fromString('150000.00'),
    harga_unggas: mongoose.Types.Decimal128.fromString('70000.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  },
  {
    nama: 'Sterilisasi Hewan',
    kategori: 'tindakan_khusus',
    harga_ternak: mongoose.Types.Decimal128.fromString('200000.00'),
    harga_kesayangan_satwaliar: mongoose.Types.Decimal128.fromString('250000.00'),
    harga_unggas: mongoose.Types.Decimal128.fromString('100000.00'),
    id_user: new mongoose.Types.ObjectId('67f023259a0e77614f51a077') // id_user untuk admin
  }
];

async function seed() {
  try {
    // Menghapus data lama dalam koleksi 'pelayanan'
    await Pelayanan.deleteMany();
    console.log('Old data deleted');

    // Menambahkan data pelayanan baru ke dalam koleksi
    await Pelayanan.insertMany(data);
    console.log('Seeded: pelayanan');
  } catch (err) {
    console.error('Error seeding pelayanan:', err);
  }
}

module.exports = seed;
