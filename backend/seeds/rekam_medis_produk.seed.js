const mongoose = require('mongoose');
const RekamMedisProduk = require('../models/rekam_medis_produk');

const data = [
  {
    id_rekam_medis: new mongoose.Types.ObjectId(),
    id_produk: new mongoose.Types.ObjectId(),
    jumlah: 1
  }
];

async function seed() {
  try {
    await RekamMedisProduk.deleteMany();
    await RekamMedisProduk.insertMany(data);
    console.log('Seeded: rekam_medis_produk');
  } catch (err) {
    console.error('Error seeding rekam_medis_produk:', err);
  }
}

module.exports = seed;
