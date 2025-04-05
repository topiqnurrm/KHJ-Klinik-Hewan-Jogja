const mongoose = require('mongoose');
const RetribusiPembayaran = require('../models/retribusi_pembayaran');

const data = [
  {
    subtotal_obat: 50000,
    total_obat: 50000,
    subtotal_pelayanan: 75000,
    total_pelayanan: 75000,
    grand_total: 125000,
    metode_bayar: 'cash',
    kembali: 0,
    tanggal: new Date(),
    status_retribusi: 'pembayaran',
    id_kunjungan: new mongoose.Types.ObjectId(),
    id_user: new mongoose.Types.ObjectId(),
    tanggal_bayar: new Date()
  }
];

async function seed() {
  try {
    await RetribusiPembayaran.deleteMany();
    await RetribusiPembayaran.insertMany(data);
    console.log('Seeded: retribusi_pembayaran');
  } catch (err) {
    console.error('Error seeding retribusi_pembayaran:', err);
  }
}

module.exports = seed;
