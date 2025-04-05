const mongoose = require('mongoose');

const KunjunganSchema = new mongoose.Schema({
    administrasis2: [
        {
            id_user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            catatan: {
                type: Text,
                required: true
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
    id_booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    status_kunjungan: {
        type: String,
        enum: ['diproses', 'inap', 'dibatalkan'],
        required: true
    },
    no_antri: {
        type: String,
        required: true,
        maxlength: 10,
        minlength: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Kunjungan', KunjunganSchema);
