const mongoose = require('mongoose');
const Kunjungan = require('../models/kunjungan');

const data = [
  {
    id_user: new mongoose.Types.ObjectId(),
    id_pasien: new mongoose.Types.ObjectId(),
    keluhan: 'Tidak nafsu makan',
    tanggal: new Date()
  }
];

async function seed() {
  try {
    await Kunjungan.deleteMany();
    await Kunjungan.insertMany(data);
    console.log('Seeded: kunjungan');
  } catch (err) {
    console.error('Error seeding kunjungan:', err);
  }
}

module.exports = seed;
