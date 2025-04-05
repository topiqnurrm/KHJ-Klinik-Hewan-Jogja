const mongoose = require('mongoose');
const User = require('../models/user');

const data = [
  {
    email: 'admin@example.com',
    nama: 'Admin',
    telepon: '08123456789',
    alamat: 'Jl. Cat Lovers No. 9',
    password: 'admin123',
    aktor: 'superadmin',
    gambar: 'images/default-image.jpg',
    gender: 'Laki-laki',
    tanggal_lahir: new Date("1990-01-01")
  },
  {
    email: 'dokter@example.com',
    nama: 'Dr. John',
    telepon: '08123456780',
    alamat: 'Jl. Dokter No. 10',
    password: 'dokter123',
    aktor: 'dokter',
    gambar: 'images/default-image.jpg',
    gender: 'Laki-laki',
    tanggal_lahir: new Date("1985-05-15")
  },
  {
    email: 'admin2@example.com',
    nama: 'Admin 2',
    telepon: '08123456781',
    alamat: 'Jl. Cat Lovers No. 10',
    password: 'admin1234',
    aktor: 'administrasi',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("1992-07-22")
  },
  {
    email: 'klien@example.com',
    nama: 'Klien 1',
    telepon: '08123456782',
    alamat: 'Jl. Klien No. 11',
    password: 'klien123',
    aktor: 'klien',
    gambar: 'images/default-image.jpg',
    gender: 'Laki-laki',
    tanggal_lahir: new Date("2000-03-10")
  },
  {
    email: 'pembayaran@example.com',
    nama: 'Pembayaran 1',
    telepon: '08123456783',
    alamat: 'Jl. Pembayaran No. 12',
    password: 'pembayaran123',
    aktor: 'pembayaran',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("1995-09-30")
  },
  {
    email: 'paramedis@example.com',
    nama: 'paramedis',
    telepon: '08123456784',
    alamat: 'Jl. medis No. 12',
    password: 'paramedis123',
    aktor: 'paramedis',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("1995-09-30")
  }
];

async function seed() {
  try {
    // Menghapus data yang ada sebelumnya
    await User.deleteMany();
    console.log('Old data deleted');

    // Menambahkan data baru
    await User.insertMany(data);
    console.log('Seeded: users');
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

module.exports = seed;
