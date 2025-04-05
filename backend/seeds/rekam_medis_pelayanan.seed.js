const mongoose = require('mongoose');
const RekamMedisPelayanan = require('../models/rekam_medis_pelayanan');

const data = [
  {
    id_rekam_medis: new mongoose.Types.ObjectId(),
    id_pelayanan: new mongoose.Types.ObjectId()
  }
];

async function seed() {
  try {
    await RekamMedisPelayanan.deleteMany();
    await RekamMedisPelayanan.insertMany(data);
    console.log('Seeded: rekam_medis_pelayanan');
  } catch (err) {
    console.error('Error seeding rekam_medis_pelayanan:', err);
  }
}

module.exports = seed;
