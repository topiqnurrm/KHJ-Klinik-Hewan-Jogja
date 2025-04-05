const mongoose = require('mongoose');
const RekamMedis = require('../models/rekam_medis');

const data = [
  {
    diagnosa: 'Cacingan',
    tindakan: 'Pemberian obat cacing',
    id_kunjungan: new mongoose.Types.ObjectId()
  }
];

async function seed() {
  try {
    await RekamMedis.deleteMany();
    await RekamMedis.insertMany(data);
    console.log('Seeded: rekam_medis');
  } catch (err) {
    console.error('Error seeding rekam_medis:', err);
  }
}

module.exports = seed;
