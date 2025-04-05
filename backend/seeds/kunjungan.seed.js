const mongoose = require('mongoose');
const Kunjungan = require('../models/kunjungan');
const Booking = require('../models/booking'); // Mengambil model Booking
const User = require('../models/user'); // Mengambil model User

// Ambil ID Booking dan User yang valid dari database atau hardcode ID-nya
const sampleUserId1 = new mongoose.Types.ObjectId('67f023259a0e77614f51a079');  // Ganti dengan ID User yang valid
const sampleUserId2 = new mongoose.Types.ObjectId('67f023259a0e77614f51a080');  // Ganti dengan ID User yang valid
const sampleBookingId1 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2158');  // Ganti dengan ID Booking yang valid
const sampleBookingId2 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c215c');  // Ganti dengan ID Booking yang valid
const sampleBookingId3 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2160');

const data = [
  {
    _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f42'),
    id_booking: sampleBookingId1, // ID Booking yang valid
    administrasis2: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'Pemeriksaan pertama dilakukan untuk muntah',
        status_kunjungan: 'dibatalkan',
        tanggal: new Date('2025-05-15')
      },
      {
        id_user: sampleUserId2,  // ID User yang valid
        catatan: 'Pemeriksaan lanjutan untuk muntah',
        status_kunjungan: 'diproses',
        tanggal: new Date('2025-05-15')
      }
    ],
    status_kunjungan: 'diproses',
    no_antri: 'A201'
  },
  {
    _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f45'),
    id_booking: sampleBookingId2, // ID Booking yang valid
    administrasis2: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'Pemeriksaan untuk keluhan lesu',
        status_kunjungan: 'inap',
        tanggal: new Date('2025-05-16')
      }
    ],
    status_kunjungan: 'inap',
    no_antri: 'G102'
  },
  {
    _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f47'),
    id_booking: sampleBookingId3, // ID Booking yang valid
    administrasis2: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'Pemeriksaan untuk keluhan lesu',
        status_kunjungan: 'dibatalkan',
        tanggal: new Date('2025-05-16')
      }
    ],
    status_kunjungan: 'dibatalkan',
    no_antri: 'E202'
  }
];

async function seed() {
  try {
    // Menghapus semua data Kunjungan yang ada di database
    await Kunjungan.deleteMany();
    // Menambahkan data Kunjungan yang baru
    await Kunjungan.insertMany(data);
    console.log('Seeded: kunjungan');
  } catch (err) {
    console.error('Error seeding kunjungan:', err);
  }
}

module.exports = seed;
