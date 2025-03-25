const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    id_pasien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasien',
        required: true
    },
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pilih_tanggal: {
        type: Date,
        required: true
    },
    status_booking: {
        type: String,
        enum: ['menunggu', 'setuju', 'tolak'],
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    keluhan: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
