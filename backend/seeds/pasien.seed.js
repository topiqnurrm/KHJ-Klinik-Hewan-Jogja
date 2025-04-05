const mongoose = require('mongoose');
const Pasien = require('../models/pasien');

const data = [
  {
    nama: 'Kucing Manis',
    nik: '1234567890123456',
    tanggal_lahir: new Date('2018-01-01'),
    jenis_kelamin: 'jantan',
    alamat: 'Jl. Cat Lovers No. 9',
    no_hp: '08123456789'
  }
];

async function seed() {
  try {
    await Pasien.deleteMany();
    await Pasien.insertMany(data);
    console.log('Seeded: pasien');
  } catch (err) {
    console.error('Error seeding pasien:', err);
  }
}

module.exports = seed;
