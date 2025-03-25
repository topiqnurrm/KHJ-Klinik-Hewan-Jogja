const mongoose = require('mongoose');

const KunjunganSchema = new mongoose.Schema({
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    id_booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    kedatangan: {
        type: String,
        enum: ['menunggu', 'datang', 'tidak'],
        required: true
    },
    status_kunjungan: {
        type: String,
        enum: ['proses', 'rawat', 'rip', 'selesai'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Kunjungan', KunjunganSchema);
