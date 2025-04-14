import mongoose from 'mongoose';
import Booking from '../models/booking.js';
import Pasien from '../models/pasien.js';
import User from '../models/user.js';
import Pelayanan from '../models/pelayanan.js';

// ID Dummy — pastikan ID-nya memang ada di koleksi terkait jika perlu referensi
const samplePasienId1 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3e');
const samplePasienId2 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e3f');
const samplePasienId3 = new mongoose.Types.ObjectId('67f0a2c5822bae46f6580e40');
const sampleUserId1 = new mongoose.Types.ObjectId('67f023259a0e77614f51a079');
const sampleUserId2 = new mongoose.Types.ObjectId('67f023259a0e77614f51a080');
const samplePelayananId1 = new mongoose.Types.ObjectId('67f026757099fba35c613520');
const samplePelayananId2 = new mongoose.Types.ObjectId('67f026757099fba35c613521');
const samplePelayananId3 = new mongoose.Types.ObjectId('67f026757099fba35c613522');

const data = [
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2158'),
    id_pasien: samplePasienId1,
    status_booking: 'menunggu',
    pilih_tanggal: new Date('2025-05-15'),
    keluhan: 'Hewan sering muntah-muntah',
    administrasis1: [
      {
        id_user: sampleUserId1,
        catatan: 'tidak ada pelayanan untuk hewan gajah',
        status_booking: 'ditolak',
        tanggal: new Date('2025-05-15')
      },
      {
        id_user: sampleUserId2,
        catatan: 'Pemeriksaan kedua untuk muntah',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId3,
        jumlah: 1,
        tanggal: new Date('2025-05-15')
      }
    ],
    tanggal_disetujui: new Date('2025-05-16')
  },
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c215c'),
    id_pasien: samplePasienId2,
    status_booking: 'disetujui',
    pilih_tanggal: new Date('2025-05-16'),
    keluhan: 'Hewan terlihat lesu dan tidak nafsu makan',
    administrasis1: [
      {
        id_user: sampleUserId1,
        catatan: 'Pemeriksaan lanjutan untuk keluhan lesu',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId1,
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      },
      {
        id_pelayanan: samplePelayananId2,
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      }
    ],
    tanggal_disetujui: new Date('2025-05-17')
  },
  {
    _id: new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2160'),
    id_pasien: samplePasienId3,
    status_booking: 'disetujui',
    pilih_tanggal: new Date('2025-05-16'),
    keluhan: 'Hewan terlihat lesu dan tidak nafsu makan',
    administrasis1: [
      {
        id_user: sampleUserId1,
        catatan: 'Pemeriksaan lanjutan untuk keluhan lesu',
        status_booking: 'disetujui',
        tanggal: new Date('2025-05-16')
      }
    ],
    pelayanans1: [
      {
        id_pelayanan: samplePelayananId1,
        jumlah: 2,
        tanggal: new Date('2025-05-16')
      }
    ],
    tanggal_disetujui: new Date('2025-05-18')
  }
];

export default async function seed() {
  try {
    await Booking.deleteMany();
    await Booking.insertMany(data);
    console.log('✅ Seeded: booking');
  } catch (err) {
    console.error('❌ Error seeding booking:', err);
  }
}
