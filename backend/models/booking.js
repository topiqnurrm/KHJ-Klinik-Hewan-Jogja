const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    id_pasien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasien',
        required: true
    },
    administrasis1: [
        {
            id_user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            },
            catatan: {
                type: Text,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ],
    pilih_tanggal: {
        type: Date,
        required: true
    },
    status_booking: {
        type: String,
        enum: ['menunggu', 'disetujui', 'ditolak'],
        required: true
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    keluhan: {
        type: String,
        required: true
    },
    tanggal_selesai: {
        type: Date,
        default: null
    },
    pelayanans1: [
        {
            id_pelayanan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pelayanan',
                required: true
            },
            jumlah: {
                type: Number,
                required: true
            },
            tanggal: {
                type: Date,
                default: Date.now
            },
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
