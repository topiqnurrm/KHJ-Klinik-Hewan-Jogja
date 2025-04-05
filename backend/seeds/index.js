const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
require('../models/user'); // Trigger schema

const seeds = [
  require('./user.seed'),
  require('./produk.seed'),
  require('./pelayanan.seed'),
  require('./pasien.seed'),
  require('./booking.seed'),
  require('./kunjungan.seed'),
  require('./rekam_medis.seed'),
  require('./retribusi_pembayaran.seed'),
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
