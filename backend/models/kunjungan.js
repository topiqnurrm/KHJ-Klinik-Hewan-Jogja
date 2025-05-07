import mongoose from 'mongoose';

const KunjunganSchema = new mongoose.Schema({
    administrasis2: [
        {
            id_user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: false
            },
            catatan: {
                type: String,
                required: false
            },
            status_kunjungan: {
                type: String,
                enum: ['sedang diperiksa', 'dirawat inap', 'dibatalkan administrasi', 'menunggu pembayaran'],
                required: false
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
        required: false
    },
    tanggal: {
        type: Date,
        default: Date.now
    },
    no_antri: {
        type: String,
        required: true,
        maxlength: 10,
        minlength: 1
    },
    nama_klein : {
        type: String,
        required: false,
        maxlength: 200,
        minlength: 3
    },
    nama_hewan : {
        type: String,
        required: false,
        maxlength: 200,
        minlength: 3
    },
    jenis_layanan: {
        type: String,
        enum: ['onsite', 'house call', 'offline'],
        required: false,
    },
    jenis_kelamin : {
        type: String,
        enum: ['jantan', 'betina', '-'],
        required: false,
    },
    jenis: {
        type: String,
        required: false,
        maxlength: 100
    },
    ras: {
        type: String,
        required: false,
        maxlength: 250
    },
    umur_hewan: {
        type: Number,
        required: false,
        min: 0,
        max: 999 
    },
    kategori: {
        type: String,
        required: false,
        enum: ['ternak', 'kesayangan / satwa liar', 'unggas']
    },
    keluhan: {
        type: String,
        required: false,
        validate: {
            validator: function(value) {
                const wordCount = value.split(' ').length;
                return wordCount <= 250;  // Validasi agar keluhan tidak lebih dari 250 kata
            },
            message: 'Keluhan tidak boleh lebih dari 250 kata'
        }
    },
    pelayanans1: {
        type: [
            {
            id_pelayanan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Pelayanan',
                required: false
            },
            nama: {
                type: String,
                require: false,
            },
            jumlah: {
                type: Number,
                required: false
            },
            tanggal: {
                type: Date,
                default: Date.now
            }
            }
        ],
        default: []
    },
}, { timestamps: true });

export default mongoose.model('Kunjungan', KunjunganSchema);
