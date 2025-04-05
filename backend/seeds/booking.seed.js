const mongoose = require('mongoose');
const Booking = require('../models/booking');

const data = [
  {
    tanggal: new Date(),
    status_booking: 'menunggu',
    id_user: new mongoose.Types.ObjectId()
  }
];

async function seed() {
  try {
    await Booking.deleteMany();
    await Booking.insertMany(data);
    console.log('Seeded: booking');
  } catch (err) {
    console.error('Error seeding booking:', err);
  }
}

module.exports = seed;
