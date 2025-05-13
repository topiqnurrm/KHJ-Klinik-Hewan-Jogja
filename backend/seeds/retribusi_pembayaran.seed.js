import mongoose from 'mongoose';
import RetribusiPembayaran from '../models/retribusi_pembayaran.js';
import Kunjungan from '../models/kunjungan.js'; // Import model Kunjungan
import User from '../models/user.js'; // Import model User

// Ganti ID berikut dengan ID yang valid dari database Anda
const sampleKunjunganId1 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f42'); // Ganti dengan ID Kunjungan yang valid
const sampleKunjunganId2 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f45');
const sampleKunjunganId3 = new mongoose.Types.ObjectId('67f0b9514af6f61ed1ec3f47');
const sampleUserId = new mongoose.Types.ObjectId('67f0bbaac83a8ce540c7e9c8'); // Ganti dengan ID User yang valid

const data = [
  // {
  //   _id: new mongoose.Types.ObjectId('67f0c86ce7ee72d46005cae8'),
  //   subtotal_obat: 50000,
  //   total_obat: 50000,
  //   subtotal_pelayanan: 75000,
  //   total_pelayanan: 75000,
  //   grand_total: 125000,
  //   metode_bayar: 'cash',
  //   kembali: 0,
  //   // tanggal: new Date(),
  //   status_retribusi: 'menunggu pembayaran',
  //   id_kunjungan: sampleKunjunganId1, // ID Kunjungan yang valid
  //   id_user: sampleUserId, // ID User yang valid
  //   tanggal_bayar: new Date('2025-05-01T10:00:00'), // Tanggal bayar yang ditentukan
  //   tanggal_ambil_obat: new Date('2025-05-02T14:00:00') // Tanggal ambil obat yang ditentukan
  // }
];

async function seed() {
  try {
    // Menghapus semua data RetribusiPembayaran yang ada di database
    await RetribusiPembayaran.deleteMany();
    // Menambahkan data RetribusiPembayaran yang baru
    await RetribusiPembayaran.insertMany(data);
    console.log('Seeded: retribusi_pembayaran');
  } catch (err) {
    console.error('Error seeding retribusi_pembayaran:', err);
  }
}

export default seed;
