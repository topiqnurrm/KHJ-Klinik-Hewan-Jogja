const mongoose = require('mongoose');
const BookingPelayanan = require('../models/booking_pelayanan');

const data = [
  {
    id_booking: new mongoose.Types.ObjectId(),
    id_pelayanan: new mongoose.Types.ObjectId()
  }
];

async function seed() {
  try {
    await BookingPelayanan.deleteMany();
    await BookingPelayanan.insertMany(data);
    console.log('Seeded: booking_pelayanan');
  } catch (err) {
    console.error('Error seeding booking_pelayanan:', err);
  }
}

module.exports = seed;
