const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
require('../models/user'); // Trigger schema

const seeds = [
  // require('./booking.seed'),
  require('./booking_pelayanan.seed'),
  // require('./kunjungan.seed'),
  // require('./pasien.seed'),
  //sudah require('./pelayanan.seed'),
  //sudah require('./produk.seed'),
  // require('./rekam_medis.seed'),
  // require('./rekam_medis_pelayanan.seed'),
  // require('./rekam_medis_produk.seed'),
  // require('./retribusi_pembayaran.seed'),
  //sudah require('./user.seed'),
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/klinik_hewan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  for (const seed of seeds) {
    await seed();
  }
  mongoose.disconnect();
}).catch(err => console.error('MongoDB connection error:', err));
