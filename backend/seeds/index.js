import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import '../models/user.js'; // pastikan file user.js sudah pakai export default

import userSeed from './user.seed.js';
import produkSeed from './produk.seed.js';
import pelayananSeed from './pelayanan.seed.js';
import pasienSeed from './pasien.seed.js';
import bookingSeed from './booking.seed.js';
import kunjunganSeed from './kunjungan.seed.js';
import rekamMedisSeed from './rekam_medis.seed.js';
import retribusiPembayaranSeed from './retribusi_pembayaran.seed.js';

const seeds = [
  userSeed,
  produkSeed,
  pelayananSeed,
  pasienSeed,
  bookingSeed,
  kunjunganSeed,
  rekamMedisSeed,
  retribusiPembayaranSeed,
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/klinik_hewan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log("✅ Connected to MongoDB");
  for (const seed of seeds) {
    await seed(); // jalankan seed satu per satu
  }
  console.log("✅ All seeds executed");
  mongoose.disconnect();
}).catch(err => console.error('❌ MongoDB connection error:', err));
