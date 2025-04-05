const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Pasien = require('../models/pasien'); // Jika Anda ingin mengacu ke Pasien yang sudah ada
const User = require('../models/user'); // Jika Anda ingin mengacu ke User yang sudah ada
const Pelayanan = require('../models/pelayanan'); // Jika Anda ingin mengacu ke Pelayanan yang sudah ada

// Ambil ID Pasien, User, dan Pelayanan yang sudah ada di database
const samplePasienId1 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3e'); // Ganti dengan ID Pasien yang valid
const samplePasienId2 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3f');
const samplePasienId3 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e40');
const sampleUserId1 = new mongoose.Types.ObjectId('67f023259a0e77614f51a079');   // Ganti dengan ID User yang valid
const sampleUserId2 = new mongoose.Types.ObjectId('67f023259a0e77614f51a080');
const samplePelayananId1 = new mongoose.Types.ObjectId('67f026757099fba35c613520'); // Ganti dengan ID Pelayanan yang valid
const samplePelayananId2 = new mongoose.Types.ObjectId('67f026757099fba35c613521');
const samplePelayananId3 = new mongoose.Types.ObjectId('67f026757099fba35c613522');

const data = [
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2158'),
    id_pasien: samplePasienId1,  // ID Pasien yang valid
    status_booking: 'menunggu',
    pilih_tanggal: new Date('2025-05-15'),
    keluhan: 'Hewan sering muntah-muntah',
    administrasis1: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'tidak ada pelayanan untuk hewan gajah',
        status_booking: 'ditolak',
        tanggal: new Date('2025-05-15')
      },
      {
        id_user: sampleUserId2,  // ID User yang valid
        catatan: 'Pemeriksaan kedua untuk muntah',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId3,  // ID Pelayanan yang valid
        jumlah: 1,
        tanggal: new Date('2025-05-15')
      }
    ],
    tanggal_disetujui: new Date('2025-05-16')
  },
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c215c'),
    id_pasien: samplePasienId2,  // ID Pasien yang valid
    status_booking: 'disetujui',
    pilih_tanggal: new Date('2025-05-16'),
    keluhan: 'Hewan terlihat lesu dan tidak nafsu makan',
    administrasis1: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'Pemeriksaan lanjutan untuk keluhan lesu',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId1,  // ID Pelayanan yang valid
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      },
      {
        id_pelayanan: samplePelayananId2,  // ID Pelayanan yang valid
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      }
    ],
    tanggal_disetujui: new Date('2025-05-17')
  },
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2160'),
    id_pasien: samplePasienId3,  // ID Pasien yang valid
    status_booking: 'disetujui',
    pilih_tanggal: new Date('2025-05-16'),
    keluhan: 'Hewan terlihat lesu dan tidak nafsu makan',
    administrasis1: [
      {
        id_user: sampleUserId1,  // ID User yang valid
        catatan: 'Pemeriksaan lanjutan untuk keluhan lesu',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId1,  // ID Pelayanan yang valid
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      }
    ],
    tanggal_disetujui: new Date('2025-05-18')
  }
];

async function seed() {
  try {
    // Menghapus semua data Booking yang ada di database
    await Booking.deleteMany();
    // Menambahkan data Booking yang baru
    await Booking.insertMany(data);
    console.log('Seeded: booking');
  } catch (err) {
    console.error('Error seeding booking:', err);
  }
}

module.exports = seed;
