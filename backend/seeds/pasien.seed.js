const mongoose = require('mongoose');
const Pasien = require('../models/pasien');

// Misalnya, kita asumsikan Anda memiliki id_user tertentu (dapat menggunakan ID dari pengguna yang sudah ada)
const sampleUserId = new mongoose.Types.ObjectId('67f023259a0e77614f51a07a');

const data = [
  {
    _id: new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3e'),
    nama: 'Kucing Manis',
    jenis: 'Kucing Anggora',
    kategori: 'kesayangan / satwa liar',
    jenis_kelamin: 'jantan',
    ras: 'Anggora',
    tanggal: new Date('2018-01-01'),
    id_user: sampleUserId, // Ganti dengan ID User yang sesuai
    umur: 7
  },
  {
    _id: new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3f'),
    nama: 'Anjing Gembul',
    jenis: 'Anjing Labrador',
    kategori: 'kesayangan / satwa liar',
    jenis_kelamin: 'betina',
    ras: 'Labrador',
    tanggal: new Date('2020-06-15'),
    id_user: sampleUserId, // Ganti dengan ID User yang sesuai
    umur: 4
  },
  {
    _id: new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e40'),
    nama: 'Ayam Kampung',
    jenis: 'Ayam Jantan',
    kategori: 'unggas',
    jenis_kelamin: 'jantan',
    ras: 'Kampung',
    tanggal: new Date('2021-03-25'),
    id_user: sampleUserId, // Ganti dengan ID User yang sesuai
    umur: 3
  }
];

async function seed() {
  try {
    // Menghapus semua data Pasien yang ada di database
    await Pasien.deleteMany();
    // Menambahkan data pasien yang baru
    await Pasien.insertMany(data);
    console.log('Seeded: pasien');
  } catch (err) {
    console.error('Error seeding pasien:', err);
  }
}

module.exports = seed;
