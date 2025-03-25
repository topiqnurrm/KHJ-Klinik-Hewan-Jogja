const mongoose = require('mongoose');

const BookingPelayananSchema = new mongoose.Schema({
    jumlah: {
        type: Number,
        required: true
    },
    id_booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    id_pelayanan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pelayanan',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BookingPelayanan', BookingPelayananSchema);
