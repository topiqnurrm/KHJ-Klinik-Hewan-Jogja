const mongoose = require('mongoose');
const User = require('../models/user');

const data = [
  {
    _id: new mongoose.Types.ObjectId('67f023259a0e77614f51a077'),  // Menambahkan id yang diberikan
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
    _id: new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c4'),
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
    _id: new mongoose.Types.ObjectId('67f023259a0e77614f51a079'),
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
    _id: new mongoose.Types.ObjectId('67f023259a0e77614f51a080'),
    email: 'admin3@example.com',
    nama: 'Admin 3',
    telepon: '08123456782',
    alamat: 'Jl. Cat Lovers No. 10',
    password: 'admin1234',
    aktor: 'administrasi',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("1992-07-22")
  },
  {
    _id: new mongoose.Types.ObjectId('67f023259a0e77614f51a07a'),
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
    _id: new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c8'),
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
    _id: new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c9'),
    email: 'paramedis@example.com',
    nama: 'paramedis',
    telepon: '08123456784',
    alamat: 'Jl. medis No. 12',
    password: 'paramedis123',
    aktor: 'paramedis',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("1995-09-30")
  },
  {
    email: 'klien2@example.com',
    nama: 'Klien 2',
    telepon: '08123456782',
    alamat: 'Jl. Klien No. 11',
    password: 'klien123',
    aktor: 'klien',
    gambar: 'images/default-image.jpg',
    gender: 'Perempuan',
    tanggal_lahir: new Date("2000-03-10")
  },
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
