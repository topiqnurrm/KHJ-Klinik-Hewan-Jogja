import mongoose from 'mongoose';
import Kunjungan from '../models/kunjungan.js';
import Booking from '../models/booking.js';
import User from '../models/user.js';

// Gunakan ID valid dari database atau tetap gunakan dummy seperti sekarang
const sampleUserId1 = new mongoose.Types.ObjectId('67f023259a0e77614f51a079');
const sampleUserId2 = new mongoose.Types.ObjectId('67f023259a0e77614f51a080');
const sampleBookingId1 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2158');
const sampleBookingId2 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c215c');
const sampleBookingId3 = new mongoose.Types.ObjectId('67f0aca488fa9662fb8c2160');

const data = [
  // {
  //   _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f42'),
  //   id_booking: sampleBookingId1,
  //   administrasis2: [
  //     {
  //       id_user: sampleUserId1,
  //       catatan: 'Pemeriksaan pertama dilakukan untuk muntah',
  //       status_kunjungan: 'dibatalkan administrasi',
  //       tanggal: new Date('2025-05-15')
  //     },
  //     {
  //       id_user: sampleUserId2,
  //       catatan: 'Pemeriksaan lanjutan untuk muntah',
  //       status_kunjungan: 'sedang diperiksa',
  //       tanggal: new Date('2025-05-15')
  //     }
  //   ],
  //   no_antri: 'A201'
  // },
  // {
  //   _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f45'),
  //   id_booking: sampleBookingId2,
  //   administrasis2: [
  //     {
  //       id_user: sampleUserId1,
  //       catatan: 'Pemeriksaan untuk keluhan lesu',
  //       status_kunjungan: 'dirawat inap',
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ],
  //   no_antri: 'G102'
  // },
  // {
  //   _id: new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f47'),
  //   id_booking: sampleBookingId3,
  //   administrasis2: [
  //     {
  //       id_user: sampleUserId1,
  //       catatan: 'Pemeriksaan untuk keluhan lesu',
  //       status_kunjungan: 'dibatalkan administrasi',
  //       tanggal: new Date('2025-05-16')
  //     }
  //   ],
  //   no_antri: 'E202'
  // }
];

export default async function seed() {
  try {
    await Kunjungan.deleteMany();
    await Kunjungan.insertMany(data);
    console.log('✅ Seeded: kunjungan');
  } catch (err) {
    console.error('❌ Error seeding kunjungan:', err);
  }
}
